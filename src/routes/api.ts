import { type Context, Hono } from 'hono';
import { resolveBranding, whiteLabelOf } from '../brand';
import { activateConnector } from '../connector';
import {
  findChatMatches,
  isCrmEntityType,
  normalizePhoneDigits,
  resolveClientName,
  resolveEntityPhones,
  startConversation,
} from '../crm';
import { getPortalByMemberId } from '../db';
import * as license from '../license';
import {
  bindLine,
  disconnectSession,
  getSession,
  listSessions,
  provisionSession,
  refreshSessionsStatus,
  refreshStatus,
  removeSession,
  requestQrCode,
  setGroupMessagesEnabled,
} from '../sessions';
import { verifySession } from '../session';
import type { Env, PortalRow, SessionRow } from '../types';
import { conversationsThisMonth, recordConversationInitiated } from '../usage';
import { WasenderError, WEBHOOK_EVENTS, wasender } from '../wasender';

type Vars = { portal: PortalRow };

export const apiRoutes = new Hono<{ Bindings: Env; Variables: Vars }>();

/** Every /api/* route runs as a known portal, resolved from the signed session token. */
apiRoutes.use('/api/*', async (c, next) => {
  const memberId = await verifySession(c.env, c.req.header('X-App-Session') ?? null);
  if (!memberId) return c.json({ error: 'UNAUTHORIZED' }, 401);

  const portal = await getPortalByMemberId(c.env, memberId);
  if (!portal || portal.status !== 'active') return c.json({ error: 'NOT_FOUND' }, 404);

  c.set('portal', portal);
  await next();
});

/** Credentials never leave the Worker; the UI only ever sees this shape. */
const publicSession = (s: SessionRow) => ({
  id: s.id,
  phone_number: s.phone_number,
  status: s.status,
  bitrix_line_id: s.bitrix_line_id,
  connector_active: s.connector_active,
  group_messages_enabled: s.group_messages_enabled,
  last_status_at: s.last_status_at,
  last_error: s.last_error,
  // Pushed by qrcode.updated (routes/webhook.ts). Only meaningful while a scan is pending - a
  // stale QR on a connected session is useless at best, so it is withheld rather than shown.
  last_qr: s.status === 'connected' ? null : s.last_qr,
  last_qr_at: s.status === 'connected' ? null : s.last_qr_at,
});

/**
 * Customer-facing license summary for /api/state. Reads the D1-cached, signature-reverified
 * snapshot (license.ts) rather than raw columns, so expiry/grace and an authoritative revoke are
 * reflected the moment they land, not just whatever was last stamped into the row.
 */
async function licenseFor(c: { env: Env }, portal: PortalRow) {
  const [snap, used] = await Promise.all([
    license.snapshot(c.env, portal),
    conversationsThisMonth(c.env, portal.id),
  ]);
  const f = snap.features;
  return {
    tier: snap.tier,
    status: snap.status,
    licensed: snap.licensed,
    // Drives resolveBranding (src/brand.ts): only an active license carrying the white_label
    // feature removes the free-tier attribution.
    whiteLabel: whiteLabelOf(snap),
    expiresAt: snap.expiresAt,
    maxNumbers: typeof f.max_numbers === 'number' ? f.max_numbers : null,
    maxConversationsPerMonth: typeof f.max_conversations_per_month === 'number' ? f.max_conversations_per_month : null,
    conversationsThisMonth: used,
    // Gates POST /api/sessions/:id/group-messages below - a portal can only turn groups on for a
    // number if its plan carries this feature. message_scheduling has no implementation yet;
    // surfaced anyway so the licensing service's per-tier defaults and the customer features view can
    // already carry the flag ahead of the code landing.
    groupConversationsAllowed: f.group_conversations === true,
    messageSchedulingAllowed: f.message_scheduling === true,
    enforced: license.isEnforced(c.env),
  };
}

/**
 * Turn an upstream failure into something the UI can show. Wasender's messages are already
 * operator-readable ("Session does not need scanning", "You have reached your session limit"),
 * so they are passed through rather than flattened into a generic error.
 */
function upstreamError(c: Context, err: unknown) {
  if (err instanceof WasenderError) {
    return c.json(
      { error: 'UPSTREAM', message: err.message, retryable: err.retryable },
      err.status === 429 ? 429 : 502,
    );
  }
  throw err;
}

apiRoutes.get('/api/state', async (c) => {
  const portal = c.get('portal');
  const [sessions, licenseSummary] = await Promise.all([
    listSessions(c.env, portal.id).then((rows) => refreshSessionsStatus(c.env, rows)),
    licenseFor(c, portal),
  ]);

  return c.json({
    // Same object the SPA reads off its bootstrap (app-shell.ts) and the widget renders as its
    // powered-by footer - one resolution path, three surfaces.
    branding: resolveBranding(c.env, licenseSummary.whiteLabel),
    portal: {
      domain: portal.bitrix_domain,
      installedAt: portal.installed_at,
      connectorRegistered: portal.connector_version !== null,
      // Whether Bitrix events can be authenticated at all (routes/events.ts). False means
      // operator replies are being discarded even though everything else - placements, the
      // connector, inbound - looks healthy, which is precisely the failure this needs to make
      // visible rather than leave to a log nobody is reading.
      eventsReady: portal.application_token !== null,
    },
    sessions: sessions.map(publicSession),
    license: licenseSummary,
  });
});

/**
 * Customer-facing activation: the portal's own admin binds a purchased licence key from inside
 * the app, no X-Admin-Key involved. The portal is already resolved from the signed Bitrix
 * session by the /api/* middleware above, so this can only ever bind a key to the caller's own
 * portal - mirrors the operator-only POST /admin/portals/:domain/license (routes/admin.ts) but scoped
 * to "self" instead of taking a domain param.
 */
apiRoutes.post('/api/license/activate', async (c) => {
  const portal = c.get('portal');
  const body = await c.req.json<{ licenseKey?: string }>().catch(() => null);
  const licenseKey = body?.licenseKey?.trim();
  if (!licenseKey) return c.json({ error: 'BAD_REQUEST', message: 'License key is required' }, 400);

  const result = await license.activate(c.env, portal, licenseKey);
  if (!result.ok) return c.json(result, 400);
  return c.json({ ok: true, license: await licenseFor(c, portal) });
});

apiRoutes.post('/api/sessions', async (c) => {
  const portal = c.get('portal');
  const body = await c.req.json<{ name?: string; phoneNumber?: string }>().catch(() => null);

  const name = body?.name?.trim();
  const phoneNumber = body?.phoneNumber?.trim();
  if (!name || !phoneNumber) {
    return c.json({ error: 'BAD_REQUEST', message: 'name and phoneNumber are required' }, 400);
  }
  if (!/^\+[1-9]\d{6,15}$/.test(phoneNumber)) {
    return c.json(
      { error: 'BAD_REQUEST', message: 'phoneNumber must be in E.164 format, for example +971557801481' },
      400,
    );
  }

  const [existing, licenseSummary] = await Promise.all([
    listSessions(c.env, portal.id),
    licenseFor(c, portal),
  ]);

  // Seat limits only bite once licensing is enforced (LICENSE_ENFORCE=true in wrangler.jsonc).
  if (licenseSummary.enforced) {
    if (!licenseSummary.licensed) {
      return c.json({ error: 'LICENSE_INACTIVE', message: 'No active licence for this portal.' }, 402);
    }
    if (licenseSummary.maxNumbers !== null && existing.length >= licenseSummary.maxNumbers) {
      return c.json(
        { error: 'LICENSE_LIMIT', message: `Your plan allows ${licenseSummary.maxNumbers} number(s).` },
        402,
      );
    }
  }

  try {
    const row = await provisionSession(c.env, portal, { name, phoneNumber });
    return c.json({ session: publicSession(row) }, 201);
  } catch (err) {
    return upstreamError(c, err);
  }
});

/** Kick off (or restart) linking and hand the QR to the UI. */
apiRoutes.post('/api/sessions/:id/qr', async (c) => {
  const row = await getSession(c.env, c.get('portal').id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);

  try {
    const { status, qrCode } = await requestQrCode(c.env, row);
    // Deleted upstream: there is no QR to give, only a prompt to remove and re-add the number.
    if (status === 'expired') {
      return c.json({
        status,
        qrCode: null,
        error: 'SESSION_GONE',
        message: 'This number no longer exists on the WhatsApp provider. Remove it and add it again.',
      });
    }
    return c.json({ status, qrCode: qrCode ?? null });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/** Polled by the UI while a QR is on screen. */
apiRoutes.get('/api/sessions/:id/status', async (c) => {
  const row = await getSession(c.env, c.get('portal').id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);

  try {
    return c.json({ status: await refreshStatus(c.env, row) });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/** Called from the connector-settings placement once the operator picks a number for this Line. */
apiRoutes.post('/api/sessions/:id/bind', async (c) => {
  const portal = c.get('portal');
  const row = await getSession(c.env, portal.id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);

  const body = await c.req.json<{ lineId?: number }>().catch(() => null);
  const lineId = body?.lineId;
  if (typeof lineId !== 'number' || !Number.isInteger(lineId) || lineId <= 0) {
    return c.json({ error: 'BAD_REQUEST', message: 'lineId must be a positive integer' }, 400);
  }

  try {
    await activateConnector(c.env, portal, lineId);
    const updated = await bindLine(c.env, portal.id, row.id, lineId);
    return c.json({ session: publicSession(updated) });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/**
 * Toggle group traffic for one number, surfaced in the connector-settings widget
 * (ui/src/components/ConnectorSettings.tsx) so an operator can opt a Line OUT of groups (or back
 * in) at the moment they connect a number to it - the pair starts on for a new number, so this is
 * an opt-out first and an opt-in only for numbers someone already turned off. Wasender is updated
 * first (the source of truth for what actually gets delivered); the local column is only flipped
 * once that PUT succeeds, so the two never disagree about what was actually requested.
 */
apiRoutes.post('/api/sessions/:id/group-messages', async (c) => {
  const portal = c.get('portal');
  const row = await getSession(c.env, portal.id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);
  if (!row.wasender_session_id) return c.json({ error: 'NOT_PROVISIONED' }, 409);

  const body = await c.req.json<{ enabled?: boolean }>().catch(() => null);
  if (typeof body?.enabled !== 'boolean') {
    return c.json({ error: 'BAD_REQUEST', message: 'enabled must be a boolean' }, 400);
  }

  if (body.enabled && license.isEnforced(c.env)) {
    const licenseSummary = await licenseFor(c, portal);
    if (!licenseSummary.groupConversationsAllowed) {
      return c.json(
        { error: 'LICENSE_FEATURE', message: 'Group messaging is not included in your plan.' },
        402,
      );
    }
  }

  try {
    await wasender(c.env).updateSession(row.wasender_session_id, { ignoreGroups: !body.enabled });
    await setGroupMessagesEnabled(c.env, row.id, body.enabled);
    const updated = await getSession(c.env, portal.id, row.id);
    return c.json({ session: publicSession(updated!) });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/**
 * Repair path for sessions provisioned before `messages.upsert` landed in WEBHOOK_EVENTS
 * (wasender.ts): those were created with the old list and Wasender never syncs it on its own, so
 * app-sent messages (see inbound.ts, processAppSentMessage) silently never arrive until this
 * runs once. Safe to call any number of times - it always PUTs the current WEBHOOK_EVENTS list
 * rather than diffing against what is already configured upstream.
 */
apiRoutes.post('/api/sessions/:id/repair-webhook', async (c) => {
  const row = await getSession(c.env, c.get('portal').id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);
  if (!row.wasender_session_id) return c.json({ error: 'NOT_PROVISIONED' }, 409);

  try {
    const client = wasender(c.env);
    await client.updateSession(row.wasender_session_id, { webhookEvents: WEBHOOK_EVENTS });
    // Debug aid: read the session straight back and return what Wasender actually persisted.
    // If `messages.upsert` is missing here, the subscription was silently dropped upstream and
    // app-sent messages can never arrive - that's the difference between "repaired" and "worked".
    const fresh = await client.getSession(row.wasender_session_id);
    return c.json({ ok: true, webhook_events: fresh.webhook_events });
  } catch (err) {
    return upstreamError(c, err);
  }
});

apiRoutes.delete('/api/sessions/:id', async (c) => {
  const row = await getSession(c.env, c.get('portal').id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);

  try {
    await removeSession(c.env, row);
    return c.json({ ok: true });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/**
 * The reversible counterpart to DELETE /api/sessions/:id above: takes the number offline but keeps
 * it - the row, its credentials and its Open Line binding all stay - so the operator can link the
 * same number again with a new QR scan instead of adding it from scratch. Idempotent: a number
 * that is already offline is the state the caller asked for, not a failure (sessions.ts's
 * disconnectSession spells out how Wasender's "nothing to disconnect" refusal is absorbed).
 *
 * Free on every tier, including an unlicensed deployment: the licence logic gates features, and
 * taking your own number offline is not one - gating it would leave a portal with no way to stop a
 * session it no longer wants, which is a worse outcome than any upsell (compare the seat limit in
 * POST /api/sessions, which is enforced here and there).
 */
apiRoutes.post('/api/sessions/:id/disconnect', async (c) => {
  const row = await getSession(c.env, c.get('portal').id, c.req.param('id'));
  if (!row) return c.json({ error: 'NOT_FOUND' }, 404);

  try {
    const updated = await disconnectSession(c.env, row);
    return c.json({ ok: true, session: publicSession(updated) });
  } catch (err) {
    return upstreamError(c, err);
  }
});

/**
 * Backs the CRM detail tab (routes/install.ts's /crm/tab, ui/src/components/CrmTab.tsx): the
 * entity's phone number(s) plus, per connected session, whether a conversation already exists for
 * any of them - so the UI can offer "open" instead of "start new".
 */
apiRoutes.get('/api/crm/context', async (c) => {
  const portal = c.get('portal');
  const entityType = c.req.query('entityType');
  const entityId = Number(c.req.query('entityId'));
  if (!isCrmEntityType(entityType) || !Number.isInteger(entityId) || entityId <= 0) {
    return c.json({ error: 'BAD_REQUEST', message: 'entityType/entityId are required' }, 400);
  }

  const entityTypeId = Number(c.req.query('entityTypeId'));
  if (entityType === 'dynamic' && (!Number.isInteger(entityTypeId) || entityTypeId <= 0)) {
    return c.json({ error: 'BAD_REQUEST', message: 'entityTypeId is required for a dynamic entity' }, 400);
  }

  let phones: string[];
  try {
    phones = await resolveEntityPhones(
      c.env,
      portal,
      entityType,
      entityId,
      entityType === 'dynamic' ? entityTypeId : undefined,
    );
  } catch (err) {
    return upstreamError(c, err);
  }

  const sessions = await listSessions(c.env, portal.id);
  const withMatches = await Promise.all(
    sessions.map(async (s) => ({
      ...publicSession(s),
      // An unbound session feeds no line at all, so it can have no live conversation to reopen -
      // findChatMatches is scoped to a specific line and has nothing to scope to here.
      matches: s.bitrix_line_id ? await findChatMatches(c.env, s.id, s.bitrix_line_id, phones) : [],
    })),
  );

  return c.json({ phones, sessions: withMatches });
});

/**
 * Click-to-chat: create (or, if one already exists, report) a conversation with `phone` on
 * `sessionId`. The reopen path never touches Bitrix - findChatMatches already has the chat id.
 * The start path is gated exactly like POST /api/sessions' seat limit: a brand new conversation
 * counts against the same monthly quota an inbound-first one would.
 */
apiRoutes.post('/api/crm/start', async (c) => {
  const portal = c.get('portal');
  const body = await c.req
    .json<{
      sessionId?: string;
      phone?: string;
      /** Which CRM record the tab was opened from - only used to name the customer. */
      entityType?: string;
      entityId?: number;
      entityTypeId?: number;
    }>()
    .catch(() => null);
  const phone = body?.phone ? normalizePhoneDigits(body.phone) : '';
  if (!body?.sessionId || !phone) {
    return c.json({ error: 'BAD_REQUEST', message: 'sessionId and phone are required' }, 400);
  }

  const session = await getSession(c.env, portal.id, body.sessionId);
  if (!session) return c.json({ error: 'NOT_FOUND' }, 404);
  if (!session.bitrix_line_id) {
    return c.json(
      { error: 'NOT_BOUND', message: 'This number is not linked to an Open Line yet.' },
      409,
    );
  }

  const existing = await findChatMatches(c.env, session.id, session.bitrix_line_id, [phone]);
  if (existing[0]) return c.json({ bitrixChatId: existing[0].bitrixChatId });

  const licenseSummary = await licenseFor(c, portal);
  if (licenseSummary.enforced) {
    if (!licenseSummary.licensed) {
      return c.json({ error: 'LICENSE_INACTIVE', message: 'No active licence for this portal.' }, 402);
    }
    if (
      licenseSummary.maxConversationsPerMonth !== null &&
      licenseSummary.conversationsThisMonth >= licenseSummary.maxConversationsPerMonth
    ) {
      return c.json(
        { error: 'LICENSE_LIMIT', message: 'Your plan’s monthly conversation limit is reached.' },
        402,
      );
    }
  }

  try {
    // Best-effort: a chat named after the customer is much better than one named "Guest", but not
    // worth failing the whole open over if the lookup errors.
    const displayName =
      isCrmEntityType(body.entityType) && Number.isInteger(body.entityId) && Number(body.entityId) > 0
        ? await resolveClientName(
            c.env,
            portal,
            body.entityType,
            Number(body.entityId),
            body.entityType === 'dynamic' ? body.entityTypeId : undefined,
          ).catch(() => undefined)
        : undefined;

    const bitrixChatId = await startConversation(c.env, portal, session, phone, displayName);
    await recordConversationInitiated(c.env, portal.id);
    return c.json({ bitrixChatId }, 201);
  } catch (err) {
    return upstreamError(c, err);
  }
});
