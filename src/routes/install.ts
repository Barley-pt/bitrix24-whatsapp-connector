import { Hono } from 'hono';
import type { CrmTabPlacement } from '../app-shell';
import { renderApp } from '../app-shell';
import {
  bindEvents,
  ensureConnectorRegistered,
  reactivateBoundLines,
  verifyEventDelivery,
} from '../connector';
import { type CrmEntityType, isCrmEntityType } from '../crm';
import { upsertPortal } from '../db';
import type { BitrixFramePayload, Env } from '../types';

export const installRoutes = new Hono<{ Bindings: Env }>();

/**
 * Bitrix24 opens the app - and its separate install script - by POSTing a form into the iframe.
 * That POST carries AUTH_ID/REFRESH_ID/member_id but NOT application_token; only the
 * ONAPPINSTALL event does. See routes/events.ts.
 *
 * Bitrix does not put every field in the same place: observed live, DOMAIN/PROTOCOL/LANG/APP_SID
 * arrive as query-string parameters on the install URL while AUTH_ID/REFRESH_ID/member_id arrive
 * in the POST body. Reading the body alone (as originally written here) silently drops DOMAIN and
 * fails validation. Read both and merge, query taking precedence - the same working pattern
 * META-Forms-connector's install handler already uses (src/routes/bitrix.ts).
 */
async function readFramePayload(request: Request): Promise<BitrixFramePayload | null> {
  const contentType = request.headers.get('content-type') ?? '';
  const form = await request.formData().catch(() => null);
  const query = new URL(request.url).searchParams;

  const get = (k: string): string => {
    const q = query.get(k);
    if (q !== null) return q;
    const v = form?.get(k);
    return typeof v === 'string' ? v : '';
  };

  const payload: BitrixFramePayload = {
    DOMAIN: get('DOMAIN'),
    PROTOCOL: get('PROTOCOL'),
    LANG: get('LANG'),
    APP_SID: get('APP_SID'),
    AUTH_ID: get('AUTH_ID'),
    AUTH_EXPIRES: get('AUTH_EXPIRES'),
    REFRESH_ID: get('REFRESH_ID'),
    member_id: get('member_id'),
    PLACEMENT: get('PLACEMENT') || undefined,
    PLACEMENT_OPTIONS: get('PLACEMENT_OPTIONS') || undefined,
  };

  if (!payload.DOMAIN || !payload.AUTH_ID || !payload.REFRESH_ID || !payload.member_id) {
    // Diagnostic only: field NAMES from each channel, never values - AUTH_ID/REFRESH_ID must
    // never reach logs. Only fires on the already-erroring path.
    console.error(
      JSON.stringify({
        msg: 'install payload: missing a required field',
        contentType,
        queryKeys: [...query.keys()],
        formKeys: form ? [...form.keys()] : null,
        hasDomain: Boolean(payload.DOMAIN),
        hasAuthId: Boolean(payload.AUTH_ID),
        hasRefreshId: Boolean(payload.REFRESH_ID),
        hasMemberId: Boolean(payload.member_id),
      }),
    );
    return null;
  }
  return payload;
}

const restBase = (p: BitrixFramePayload) =>
  `${p.PROTOCOL === '0' ? 'http' : 'https'}://${p.DOMAIN}/rest/`;

/**
 * The connector-settings placement carries which Open Line is being configured as a JSON string:
 * `{"CONNECTOR":"acp_whatsapp","LINE":"12"}`. LINE arrives as a string; everything else about
 * this payload is Bitrix-controlled, so a malformed or missing value just means "no line picked
 * yet" rather than an error.
 */
export function parsePlacementOptions(raw: string | undefined): { lineId: number } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { LINE?: string | number };
    const lineId = Number(parsed.LINE);
    return Number.isInteger(lineId) && lineId > 0 ? { lineId } : null;
  } catch {
    return null;
  }
}

const CRM_TAB_ENTITY_TYPE: Record<string, CrmEntityType> = {
  CRM_LEAD_DETAIL_TAB: 'lead',
  CRM_DEAL_DETAIL_TAB: 'deal',
  CRM_CONTACT_DETAIL_TAB: 'contact',
  CRM_COMPANY_DETAIL_TAB: 'company',
};

/** CRM_DYNAMIC_<entityTypeId>_DETAIL_TAB - one per Smart Process (SPA) type, connector.ts's
 * bindDynamicCrmTabPlacements. */
const DYNAMIC_TAB_RE = /^CRM_DYNAMIC_(\d+)_DETAIL_TAB$/;

/**
 * A CRM_XXX_DETAIL_TAB (or CRM_DYNAMIC_<id>_DETAIL_TAB) placement carries which entity the tab is
 * open on as `{"ID":"123"}` in PLACEMENT_OPTIONS; PLACEMENT itself says which entity type (and,
 * for a Smart Process, which SPA type). Same "malformed just means nothing to show yet" tolerance
 * as parsePlacementOptions above.
 */
export function parseCrmTabPlacement(
  placement: string | undefined,
  raw: string | undefined,
): CrmTabPlacement | null {
  if (!raw) return null;

  const fixed = CRM_TAB_ENTITY_TYPE[placement ?? ''];
  const dynamicMatch = placement?.match(DYNAMIC_TAB_RE);

  let entityType: CrmEntityType;
  let entityTypeId: number | undefined;
  if (fixed && isCrmEntityType(fixed)) {
    entityType = fixed;
  } else if (dynamicMatch?.[1]) {
    entityType = 'dynamic';
    entityTypeId = Number(dynamicMatch[1]);
  } else {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { ID?: string | number };
    const entityId = Number(parsed.ID);
    if (!Number.isInteger(entityId) || entityId <= 0) return null;
    return { entityType, entityId, ...(entityTypeId ? { entityTypeId } : {}) };
  } catch {
    return null;
  }
}

/**
 * `install: true` marks the one caller that is genuinely an installation (POST /install) rather
 * than an ordinary app open, and forces connector re-registration - see ensureConnectorRegistered
 * for why a remembered connector_version cannot be trusted across a reinstall. The placement
 * handlers (/, /connector/settings, /crm/tab) deliberately do not, so a normal open stays free.
 */
async function persistAndSetup(env: Env, payload: BitrixFramePayload, { install = false } = {}) {
  const portal = await upsertPortal(env, {
    memberId: payload.member_id,
    bitrixDomain: payload.DOMAIN,
    clientEndpoint: restBase(payload),
    accessToken: payload.AUTH_ID,
    refreshToken: payload.REFRESH_ID,
  });

  await ensureConnectorRegistered(env, portal, { force: install });
  // Only after a real install: re-registering resets every Line to deactivated, so the bindings
  // the operator already made have to be re-applied or the connector is registered but routes
  // nothing. See reactivateBoundLines.
  if (install) await reactivateBoundLines(env, portal);
  await bindEvents(env, portal);

  // A portal with no application_token on file cannot authenticate a single inbound event, so
  // every operator reply is discarded (routes/events.ts's authenticate) while the app itself
  // looks perfectly healthy - placements render, the connector is active, inbound flows. This
  // frame POST is the only reliably-recurring authenticated context the app has, so it is where
  // that gets repaired. Best-effort by design: opening the app must never fail because a repair
  // attempt did.
  //
  // A no-op on the very first /install hit, since events are not delivered until installFinish()
  // has run (Bitrix: "Events will not be sent to the handler, even after a successful
  // event.bind") - the next open is the one that lands it. Stops costing anything the moment it
  // works, because the token is then on file.
  if (!portal.application_token) {
    try {
      await verifyEventDelivery(env, portal);
    } catch (err) {
      console.error(
        JSON.stringify({
          msg: 'event-delivery self-test failed',
          memberId: portal.member_id,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }

  return portal;
}

/** Install script: runs once, in a frame, at install time. */
installRoutes.post('/install', async (c) => {
  const payload = await readFramePayload(c.req.raw);
  if (!payload) return c.text('Invalid install payload', 400);

  await persistAndSetup(c.env, payload, { install: true });

  return c.html(
    `<!doctype html>
<html><head><meta charset="utf-8"><title>ACPZap</title>
<script src="//api.bitrix24.com/api/v1/"></script></head>
<body style="font:14px/1.5 system-ui;padding:24px;color:#1f2937">
<p>WhatsApp connector installed.</p>
<script>
  // Tells Bitrix24 the install step finished and it can close the frame.
  BX24.init(function () { BX24.installFinish(); });
</script>
</body></html>`,
    200,
    { 'Cache-Control': 'no-store' },
  );
});

/** Main app handler: the tab the user opens inside Bitrix24. */
installRoutes.post('/', async (c) => {
  const payload = await readFramePayload(c.req.raw);
  if (!payload) return c.text('Invalid application payload', 400);

  await persistAndSetup(c.env, payload);
  return renderApp(c.env, c.req.raw, payload.member_id, 'setup');
});

/** PLACEMENT_HANDLER registered with imconnector.register. */
installRoutes.post('/connector/settings', async (c) => {
  const payload = await readFramePayload(c.req.raw);
  if (!payload) return c.text('Invalid placement payload', 400);

  await persistAndSetup(c.env, payload);
  const placement = parsePlacementOptions(payload.PLACEMENT_OPTIONS);
  return renderApp(c.env, c.req.raw, payload.member_id, 'connector-settings', placement);
});

/** HANDLER registered for every CRM_TAB_PLACEMENTS entry (connector.ts). */
installRoutes.post('/crm/tab', async (c) => {
  const payload = await readFramePayload(c.req.raw);
  if (!payload) return c.text('Invalid placement payload', 400);

  await persistAndSetup(c.env, payload);
  const placement = parseCrmTabPlacement(payload.PLACEMENT, payload.PLACEMENT_OPTIONS);
  return renderApp(c.env, c.req.raw, payload.member_id, 'crm-tab', placement);
});

/**
 * Bitrix's Market app form validates each registered URL field's reachability with a plain GET
 * before it lets you save the version - confirmed live 2026-08-05 ("the URL specified is not
 * accessible") against a handler that only accepted POST. Every URL field needs one of these.
 */
installRoutes.get('/', (c) =>
  c.text('ACPZap - open this app from inside your Bitrix24 portal.', 200),
);
installRoutes.get('/install', (c) =>
  c.text('ACPZap - open this app from inside your Bitrix24 portal.', 200),
);
