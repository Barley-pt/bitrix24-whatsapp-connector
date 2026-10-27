import { type Context, Hono } from 'hono';
import { callMethod, verifyAccessToken } from '../bitrix';
import {
  bindDynamicCrmTabPlacement,
  bindEvents,
  ensureConnectorRegistered,
  reactivateBoundLines,
} from '../connector';
import { decrypt } from '../crypto';
import { getPortalByMemberId, markUninstalled, updateApplicationToken, upsertPortal } from '../db';
import { WHISPER_PREFIX } from '../inbound';
import type { BitrixEventAuth, Env, OutboundFile, PortalRow } from '../types';
import { parsePhpFormData, stripBBCode, timingSafeEqual } from '../util';

/** upsertPortal always writes a refresh token, so an event without one reuses the stored value. */
const currentRefreshToken = (env: Env, portal: PortalRow): Promise<string> =>
  decrypt(portal.refresh_token, env.TOKEN_ENC_KEY);

export const eventRoutes = new Hono<{ Bindings: Env }>();

// Bitrix's Market app form validates the "Installation event callback" field's reachability with
// a plain GET before letting the version save - a POST-only handler fails that check even though
// it works correctly for the real event delivery (see install.ts for the same fix on /install).
eventRoutes.get('/events/install', (c) =>
  c.text('WhatsApp Connector - open this app from inside your Bitrix24 portal.', 200),
);

interface EventBody {
  event?: string;
  auth?: BitrixEventAuth;
  data?: Record<string, unknown>;
}

/** Event handlers receive application/x-www-form-urlencoded with PHP bracket keys. */
async function readEvent(request: Request): Promise<EventBody | null> {
  const form = await request.formData().catch(() => null);
  if (!form) return null;
  return parsePhpFormData(form) as EventBody;
}

/**
 * Every rejection in this file answers Bitrix with a plain 200 'ignored' - correct, because a
 * non-2xx only earns a redelivery of an event we have already decided we cannot trust. The cost
 * is that a rejection used to be completely invisible: no log, no row, no metric. A portal whose
 * application_token never arrived discarded every operator reply for five days and produced
 * nothing anywhere to notice (confirmed live 2026-08-10, example.bitrix24.com.br). Bitrix
 * still gets the same 200; we now get a reason code.
 *
 * Logs which auth keys were present, never their values - the auth block carries live OAuth
 * tokens.
 */
function ignored(
  c: Context<{ Bindings: Env }>,
  route: string,
  reason: string,
  auth?: BitrixEventAuth,
) {
  console.warn(
    JSON.stringify({
      msg: 'event ignored',
      route,
      reason,
      memberId: auth?.member_id ?? null,
      authKeys: auth ? Object.keys(auth).sort() : null,
    }),
  );
  return c.text('ignored', 200);
}

/** Why authenticate() refused, for the log line above. */
type AuthFailure =
  | 'NO_MEMBER_ID'
  | 'UNKNOWN_PORTAL'
  | 'APPLICATION_TOKEN_MISMATCH'
  | 'NO_APPLICATION_TOKEN_ON_FILE'
  | 'ACCESS_TOKEN_REJECTED';

/**
 * An event is trusted when its application_token matches the one stored for that portal - the
 * fast path, no extra network call. When that's not possible (no stored token yet, because
 * ONAPPINSTALL is documented as "not guaranteed" and confirmed live 2026-08-05 to sometimes
 * never arrive across a reinstall; or the token rotated), this falls back to proving the caller
 * holds a genuinely working access_token for the portal - the same check ONAPPUPDATE already
 * relies on for its own token rotation, generalized here for every event. A verified fallback
 * self-heals the stored token, so the slow path only ever has to run once per portal.
 *
 * Note which half is the reliable one. Bitrix marks `application_token` required on an event's
 * auth block and `access_token` optional, and warns that "Authorization tokens are not always
 * passed to the event handler. If the hit that initiated the event could not be linked to a
 * specific Bitrix24 user, the tokens are not passed" - an Open Line message routed by queue rules
 * rather than a direct click is exactly that case. So a portal with no application_token on file
 * is not merely on a slower path, it is one unattributable hit away from dropping the event
 * outright, with no way to ever recover on its own. connector.ts's verifyEventDelivery exists to
 * get that portal a token; NO_APPLICATION_TOKEN_ON_FILE is how it becomes visible.
 */
async function authenticate(
  env: Env,
  auth: BitrixEventAuth | undefined,
): Promise<{ portal: PortalRow } | { portal: null; reason: AuthFailure }> {
  if (!auth?.member_id) return { portal: null, reason: 'NO_MEMBER_ID' };

  const portal = await getPortalByMemberId(env, auth.member_id);
  if (!portal) return { portal: null, reason: 'UNKNOWN_PORTAL' };

  if (portal.application_token && auth.application_token) {
    const ok = await timingSafeEqual(portal.application_token, auth.application_token);
    if (ok) return { portal };
  }

  if (!auth.access_token) {
    return {
      portal: null,
      reason: portal.application_token ? 'APPLICATION_TOKEN_MISMATCH' : 'NO_APPLICATION_TOKEN_ON_FILE',
    };
  }
  const verified = await verifyAccessToken(portal.client_endpoint, auth.access_token);
  if (!verified) return { portal: null, reason: 'ACCESS_TOKEN_REJECTED' };

  if (auth.application_token) {
    await updateApplicationToken(env, portal.id, auth.application_token);
  }
  return { portal };
}

/**
 * ONAPPINSTALL. Unlike the iframe POST this carries application_token, which every later event
 * is validated against - so this is the handler that makes event auth possible at all.
 *
 * Fires with a delay and is not guaranteed, hence the iframe install script also persists tokens.
 */
eventRoutes.post('/events/install', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = body?.auth;

  if (!auth?.member_id || !auth.access_token || !auth.refresh_token || !auth.application_token) {
    // All four are marked required on ONAPPINSTALL's auth block specifically (unlike a regular
    // event, where only application_token is), so a payload missing any of them is genuinely
    // malformed rather than the documented "tokens are not always passed" case.
    return ignored(c, '/events/install', 'INCOMPLETE_AUTH', auth);
  }

  // If we already know this portal, the incoming token must match the stored one. Without this a
  // forged ONAPPINSTALL could overwrite a live portal's OAuth tokens.
  const existing = await getPortalByMemberId(c.env, auth.member_id);
  if (existing?.application_token) {
    const ok = await timingSafeEqual(existing.application_token, auth.application_token);
    if (!ok) return ignored(c, '/events/install', 'APPLICATION_TOKEN_MISMATCH', auth);
  }

  const portal = await upsertPortal(c.env, {
    memberId: auth.member_id,
    bitrixDomain: auth.domain,
    clientEndpoint: auth.client_endpoint ?? `https://${auth.domain}/rest/`,
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    applicationToken: auth.application_token,
  });

  // force: Bitrix wipes the connector and placements on uninstall, so whatever connector_version
  // this row remembers describes a registration that no longer exists - see
  // ensureConnectorRegistered. ONAPPINSTALL is proof the app was just installed, which makes the
  // remembered value meaningless regardless of whether the matching ONAPPUNINSTALL ever landed.
  await ensureConnectorRegistered(c.env, portal, { force: true });
  await reactivateBoundLines(c.env, portal);
  await bindEvents(c.env, portal);

  return c.text('ok', 200);
});

/**
 * ONAPPUPDATE. Fires on every installed portal when a new Market version is published, carrying
 * a refreshed application_token.
 *
 * This is the one event that cannot be authenticated by comparing application_token, because the
 * token is exactly what is allowed to change. Instead the supplied access_token is verified
 * against the portal, and only then is the new token trusted.
 */
eventRoutes.post('/events/update', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = body?.auth;

  if (!auth?.member_id || !auth.access_token || !auth.application_token) {
    return ignored(c, '/events/update', 'INCOMPLETE_AUTH', auth);
  }

  const existing = await getPortalByMemberId(c.env, auth.member_id);
  if (!existing) return ignored(c, '/events/update', 'UNKNOWN_PORTAL', auth);

  const clientEndpoint = auth.client_endpoint ?? existing.client_endpoint;
  const sameToken = await timingSafeEqual(
    existing.application_token ?? '',
    auth.application_token,
  );

  if (!sameToken && !(await verifyAccessToken(clientEndpoint, auth.access_token))) {
    return ignored(c, '/events/update', 'ACCESS_TOKEN_REJECTED', auth);
  }

  const portal = await upsertPortal(c.env, {
    memberId: auth.member_id,
    bitrixDomain: auth.domain,
    clientEndpoint,
    accessToken: auth.access_token,
    // ONAPPUPDATE does not always carry a refresh token; keep the working one if it is absent.
    refreshToken: auth.refresh_token ?? (await currentRefreshToken(c.env, existing)),
    applicationToken: auth.application_token,
  });

  // A version bump is also when connector metadata changes, so re-run registration and binding.
  await ensureConnectorRegistered(c.env, portal);
  await bindEvents(c.env, portal);

  return c.text('ok', 200);
});

eventRoutes.post('/events/uninstall', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = await authenticate(c.env, body?.auth);
  if (!auth.portal) return ignored(c, '/events/uninstall', auth.reason, body?.auth);

  await markUninstalled(c.env, auth.portal.member_id);
  return c.text('ok', 200);
});

/**
 * One attachment inside a MESSAGES item. Bitrix's own docs for ONIMCONNECTORMESSAGEADD document
 * only `user_id` and `text` under `message` and say nothing about attachments at all, so the field
 * names here are read defensively: `link` is what the payload has been seen to carry, `url` is
 * accepted as the obvious alternative, and anything with neither is reported by the diagnostic in
 * the handler rather than silently dropped.
 */
interface MessageAddEventFile {
  name?: string;
  link?: string;
  url?: string;
  type?: string;
}

interface MessageAddEventItem {
  im?: { chat_id?: string; message_id?: string };
  // parsePhpFormData turns files[0][link] into a plain object keyed by numeric string, never an
  // array - the same shape as MESSAGES itself.
  message?: {
    user_id?: string;
    text?: string;
    /** 'Y' on a system message (im.message.add's SYSTEM field). */
    system?: string;
    files?: Record<string, MessageAddEventFile>;
  };
  chat?: { id?: string };
}

function parseFiles(message: MessageAddEventItem['message']): OutboundFile[] {
  const raw = message?.files;
  if (!raw || typeof raw !== 'object') return [];

  const files: OutboundFile[] = [];
  for (const entry of Object.values(raw)) {
    const link = entry?.link ?? entry?.url;
    if (!link) continue;
    files.push({ link, name: entry.name ?? '', ...(entry.type ? { type: entry.type } : {}) });
  }
  return files;
}

/**
 * ONIMCONNECTORMESSAGEADD - operator replies in the Open Line.
 *
 * Only enqueues, one message at a time: the actual Wasender send happens in the queue consumer
 * (index.ts's queue() / src/outbound.ts), so a slow or rate-limited send never holds up Bitrix's
 * event delivery. `chat.id` here is the same external chat id the connector set when it called
 * imconnector.send.messages in phase 3 - see OutboundQueueMessage.
 */
eventRoutes.post('/events/message-add', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = await authenticate(c.env, body?.auth);
  if (!auth.portal) return ignored(c, '/events/message-add', auth.reason, body?.auth);
  const portal = auth.portal;

  // parsePhpFormData never produces real arrays - repeated bracket indices become a plain object
  // keyed by numeric string ("0", "1", ...), same as data.MESSAGES['0'] elsewhere in this file.
  const data = body?.data as
    | { LINE?: string; MESSAGES?: Record<string, MessageAddEventItem> }
    | undefined;
  const lineId = Number(data?.LINE);
  if (!Number.isInteger(lineId) || !data?.MESSAGES) {
    return ignored(c, '/events/message-add', 'NO_LINE_OR_MESSAGES', body?.auth);
  }

  for (const item of Object.values(data.MESSAGES)) {
    const waJid = item.chat?.id;
    const text = item.message?.text ?? '';

    // Never forward a system message/whisper back to the customer's WhatsApp. The connector publishes
    // app-sent (phone-typed) messages with im.message.add + SYSTEM: 'Y' and a SYSTEM MESSAGE:
    // prefix (inbound.ts's whisperPayload), and Bitrix can echo that back here. Both signals are
    // checked - the flag is documented but the prefix holds even if a payload drops it.
    if (item.message?.system === 'Y' || text.startsWith(WHISPER_PREFIX)) continue;

    const files = parseFiles(item.message);
    const bitrixChatId = Number(item.im?.chat_id);
    const bitrixMessageId = Number(item.im?.message_id);

    // A malformed item is skipped, not fatal to the rest of the batch - Bitrix has no notion of
    // "partially accepted" for this event, so failing the whole request would just get it
    // redelivered with the same bad item still in it.
    if (!waJid || !Number.isInteger(bitrixChatId) || !Number.isInteger(bitrixMessageId)) {
      continue;
    }

    // Nothing sendable. Deliberately measured on the *stripped* text, the same way outbound.ts
    // measures it just before the send: a reply that is pure BBCode ("[br]", an empty [b][/b]) is
    // truthy here but empty by the time it reaches Wasender, which rejects a send carrying neither
    // text nor media. That gap is what made the operator's two-PDF reply on
    // example.bitrix24.com.br dead-letter and show as undelivered in Bitrix (2026-08-18 21:48
    // UTC): it passed as "has text", then arrived at sendText as "".
    //
    // Reaching this with attachments the operator can see in Bitrix means parseFiles could not read
    // a link out of them - the one case where the exact payload shape matters and is documented
    // nowhere. Hence the shape dump: every key name Bitrix used, at the item level as well as under
    // `message` (the two candidate homes for `files`), plus which BBCode tags the text was made of.
    // Names and tags only, never values - an attachment link carries an auth signature, and the
    // text is the operator's own words.
    if (!stripBBCode(text) && files.length === 0) {
      console.warn(
        JSON.stringify({
          msg: 'connector message carries neither text nor a readable attachment - dropped',
          memberId: portal.member_id,
          lineId,
          bitrixMessageId,
          itemKeys: Object.keys(item).sort(),
          messageKeys: Object.keys(item.message ?? {}).sort(),
          fileKeys: Object.values(item.message?.files ?? {}).map((f) => Object.keys(f ?? {}).sort()),
          rawTextLength: text.length,
          // Tag names only, with any "=value" or trailing argument cut off: a [url=...] or
          // [DISK FILE ID=...] payload is precisely the link we must not write to a log.
          bbcodeTags: [
            ...new Set(
              (text.match(/\[[^\]]*\]/g) ?? []).map((t) => `[${t.match(/^\[\/?([^\]=\s]*)/)?.[1] ?? ''}]`),
            ),
          ].slice(0, 10),
        }),
      );
      continue;
    }

    await c.env.OUTBOUND_QUEUE.send({
      portalId: portal.id,
      lineId,
      waJid,
      bitrixChatId,
      bitrixMessageId,
      text,
      ...(files.length ? { files } : {}),
    });
  }

  return c.text('ok', 200);
});

/**
 * ONAPPTEST - the delivery half of connector.ts's verifyEventDelivery, and the escape hatch from
 * the deadlock described there: this is the one event this app can make Bitrix send on demand, so
 * it is the one chance a portal with no application_token on file has to acquire one.
 *
 * Trust is established exactly the way authenticate()'s fallback does - by proving the caller
 * holds a working access_token for the portal - and deliberately NOT by trusting the incoming
 * application_token on its own, which would let anyone who learned a member_id nominate the
 * secret that every later event is validated against. The stricter check is free here: because
 * event.test is triggered by our own authenticated REST call, Bitrix can always attribute the hit
 * to a user and therefore always sends the full auth block.
 *
 * Storing the token is the whole point, so unlike every other handler this one treats a payload
 * without an application_token as a failure worth logging rather than a no-op.
 */
eventRoutes.post('/events/test', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = body?.auth;
  if (!auth?.member_id || !auth.access_token || !auth.application_token) {
    return ignored(c, '/events/test', 'INCOMPLETE_AUTH', auth);
  }

  const portal = await getPortalByMemberId(c.env, auth.member_id);
  if (!portal) return ignored(c, '/events/test', 'UNKNOWN_PORTAL', auth);

  const clientEndpoint = auth.client_endpoint ?? portal.client_endpoint;
  if (!(await verifyAccessToken(clientEndpoint, auth.access_token))) {
    return ignored(c, '/events/test', 'ACCESS_TOKEN_REJECTED', auth);
  }

  await updateApplicationToken(c.env, portal.id, auth.application_token);
  console.log(
    JSON.stringify({
      msg: 'application_token recovered via ONAPPTEST',
      memberId: portal.member_id,
      domain: portal.bitrix_domain,
    }),
  );
  return c.text('ok', 200);
});

interface CrmTypeAddEventData {
  FIELDS?: { ID?: string };
}

/**
 * ONCRMTYPEADD - a new Smart Process (SPA) type was created. Binds its
 * CRM_DYNAMIC_<entityTypeId>_DETAIL_TAB placement immediately rather than waiting for the next
 * CONNECTOR_VERSION bump (connector.ts's bindDynamicCrmTabPlacements only runs at registration
 * time). The event payload only carries the type's internal `id` (crm.type.add's own primary
 * key) - not the entityTypeId the placement code actually uses - so crm.type.get resolves it
 * first.
 */
eventRoutes.post('/events/crm-type-add', async (c) => {
  const body = await readEvent(c.req.raw);
  const auth = await authenticate(c.env, body?.auth);
  if (!auth.portal) return ignored(c, '/events/crm-type-add', auth.reason, body?.auth);

  const data = body?.data as CrmTypeAddEventData | undefined;
  const typeId = Number(data?.FIELDS?.ID);
  if (!Number.isInteger(typeId) || typeId <= 0) {
    return ignored(c, '/events/crm-type-add', 'NO_TYPE_ID', body?.auth);
  }

  const result = await callMethod<{ type?: { entityTypeId?: number } } | null>(
    c.env,
    auth.portal,
    'crm.type.get',
    { id: typeId },
  );
  const entityTypeId = result?.type?.entityTypeId;
  if (!entityTypeId) return ignored(c, '/events/crm-type-add', 'NO_ENTITY_TYPE_ID', body?.auth);

  await bindDynamicCrmTabPlacement(c.env, auth.portal, entityTypeId);
  return c.text('ok', 200);
});
