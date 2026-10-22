import { decrypt, encrypt } from './crypto';
import type { Env, PortalRow, SessionRow } from './types';
import { nowSec, uuid } from './util';
import { type SessionStatus, WasenderError, wasender } from './wasender';

/**
 * Provisioning a number, end to end: create it under the master WasenderAPI account, then persist the
 * credentials it hands back. Wasender returns api_key and webhook_secret only at creation and on
 * the detail endpoint, so both are stored immediately or they are lost.
 */
export async function provisionSession(
  env: Env,
  portal: PortalRow,
  input: { name: string; phoneNumber: string },
): Promise<SessionRow> {
  const id = uuid();
  // Unguessable path segment so an inbound webhook can be attributed to this session before any
  // secret is compared. Generated before the API call because it forms the URL we register.
  const webhookToken = crypto.randomUUID().replace(/-/g, '');

  const createInput = {
    name: input.name,
    phoneNumber: input.phoneNumber,
    webhookUrl: `${env.PUBLIC_URL}/webhook/${webhookToken}`,
  };
  let created;
  try {
    created = await wasender(env).createSession(createInput);
  } catch (err) {
    if (!(err instanceof WasenderError && err.message.toLowerCase().includes('already taken'))) {
      throw err;
    }
    // The number is still held by a Wasender session whose D1 row was deleted (an orphan). Remove
    // it and retry once; if the retry fails too, that error propagates.
    await deleteOrphanedWasenderSession(env, input.phoneNumber);
    created = await wasender(env).createSession(createInput);
  }

  // Confirmed live 2026-08-05: creation never returns `status` (nothing to report before the
  // first connect attempt). Everything else here is required for the row to be usable, so a
  // missing one fails loudly instead of storing a broken row and hitting an opaque D1 error.
  const missing = (['id', 'phone_number', 'api_key', 'webhook_secret'] as const).filter(
    (key) => created[key] === undefined,
  );
  if (missing.length > 0) {
    throw new Error(
      `Wasender createSession response missing field(s): ${missing.join(', ')}. Raw: ${JSON.stringify(created)}`,
    );
  }

  const [apiKey, webhookSecret] = await Promise.all([
    encrypt(created.api_key, env.TOKEN_ENC_KEY),
    encrypt(created.webhook_secret, env.TOKEN_ENC_KEY),
  ]);

  await env.DB.prepare(
    `INSERT INTO whatsapp_sessions
       (id, portal_id, provisioning_mode, wasender_api_key, wasender_session_id, webhook_secret,
        webhook_token, phone_number, status, last_status_at, created_at)
     VALUES (?, ?, 'master', ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      portal.id,
      apiKey,
      String(created.id),
      webhookSecret,
      webhookToken,
      created.phone_number,
      created.status ?? 'disconnected',
      nowSec(),
      nowSec(),
    )
    .run();

  const row = await getSession(env, portal.id, id);
  if (!row) throw new Error('session insert did not persist');
  return row;
}

/**
 * Deletes the Wasender session holding `phoneNumber`, but only when no D1 row references it: a
 * session still tracked by any portal is live, and deleting it would silently break that tenant.
 * Numbers are compared on digits alone since Wasender may store them without the leading '+'.
 */
async function deleteOrphanedWasenderSession(env: Env, phoneNumber: string): Promise<void> {
  const digits = (value: string) => value.replace(/\D/g, '');
  const existing = await wasender(env).listSessions();
  const match = existing.find((s) => digits(s.phone_number) === digits(phoneNumber));
  if (!match) return;

  const tracked = await env.DB.prepare(
    'SELECT 1 FROM whatsapp_sessions WHERE wasender_session_id = ? LIMIT 1',
  )
    .bind(String(match.id))
    .first();
  if (tracked) return;

  await wasender(env).deleteSession(String(match.id));
}

export async function listSessions(env: Env, portalId: string): Promise<SessionRow[]> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM whatsapp_sessions WHERE portal_id = ? ORDER BY created_at',
  )
    .bind(portalId)
    .all<SessionRow>();
  return results;
}

/** Scoped by portal so one tenant can never address another tenant's session by id. */
export async function getSession(
  env: Env,
  portalId: string,
  sessionId: string,
): Promise<SessionRow | null> {
  return env.DB.prepare('SELECT * FROM whatsapp_sessions WHERE id = ? AND portal_id = ?')
    .bind(sessionId, portalId)
    .first<SessionRow>();
}

/**
 * The inbound webhook has no portal-scoped request to key off - webhook_token (unguessable,
 * unique) is the only thing it's handed, and is what attributes the POST to a tenant at all.
 */
export async function getSessionByWebhookToken(
  env: Env,
  webhookToken: string,
): Promise<SessionRow | null> {
  return env.DB.prepare('SELECT * FROM whatsapp_sessions WHERE webhook_token = ?')
    .bind(webhookToken)
    .first<SessionRow>();
}

/** The queue consumer re-resolves a session by id alone - the queue message only carries that. */
export async function getSessionById(env: Env, sessionId: string): Promise<SessionRow | null> {
  return env.DB.prepare('SELECT * FROM whatsapp_sessions WHERE id = ?')
    .bind(sessionId)
    .first<SessionRow>();
}

/**
 * ONIMCONNECTORMESSAGEADD carries LINE, not a session id - this is the outbound counterpart to
 * bindLine. Scoped to connector_active=1 so a stale line id an old binding left behind (bindLine
 * unbinds it on rebind, but defensively) can never match.
 */
export async function getSessionByLine(
  env: Env,
  portalId: string,
  lineId: number,
): Promise<SessionRow | null> {
  return env.DB.prepare(
    'SELECT * FROM whatsapp_sessions WHERE portal_id = ? AND bitrix_line_id = ? AND connector_active = 1',
  )
    .bind(portalId, lineId)
    .first<SessionRow>();
}

export async function setStatus(
  env: Env,
  sessionId: string,
  status: SessionStatus | string,
  error?: string | null,
): Promise<void> {
  await env.DB.prepare(
    'UPDATE whatsapp_sessions SET status = ?, last_error = ?, last_status_at = ? WHERE id = ?',
  )
    .bind(status, error ?? null, nowSec(), sessionId)
    .run();
}

/**
 * Bind a session to a Bitrix Open Line. A Line only routes to one connector session at a time, so
 * any other session on this portal already holding it is unbound first - otherwise both rows
 * would claim the same Line and outbound routing (which resolves a session from the Line) would
 * be ambiguous.
 */
export async function bindLine(
  env: Env,
  portalId: string,
  sessionId: string,
  lineId: number,
): Promise<SessionRow> {
  await env.DB.prepare(
    'UPDATE whatsapp_sessions SET bitrix_line_id = NULL, connector_active = 0 WHERE portal_id = ? AND bitrix_line_id = ? AND id != ?',
  )
    .bind(portalId, lineId, sessionId)
    .run();

  await env.DB.prepare(
    'UPDATE whatsapp_sessions SET bitrix_line_id = ?, connector_active = 1 WHERE id = ?',
  )
    .bind(lineId, sessionId)
    .run();

  const row = await getSession(env, portalId, sessionId);
  if (!row) throw new Error('session vanished during bind');
  return row;
}

/**
 * Persists the group-messages toggle locally. Callers (routes/api.ts's POST
 * /api/sessions/:id/group-messages) sync `ignore_groups` to Wasender first and only call this
 * once that succeeds, so this row is never out of step with what Wasender was actually told.
 */
export async function setGroupMessagesEnabled(env: Env, sessionId: string, enabled: boolean): Promise<void> {
  await env.DB.prepare('UPDATE whatsapp_sessions SET group_messages_enabled = ? WHERE id = ?')
    .bind(enabled ? 1 : 0, sessionId)
    .run();
}

export const sessionApiKey = (env: Env, row: SessionRow): Promise<string> => {
  if (!row.wasender_api_key) throw new Error('session has no stored api key');
  return decrypt(row.wasender_api_key, env.TOKEN_ENC_KEY);
};

/**
 * Ask Wasender for a QR and mirror the resulting state locally.
 *
 * `connect` usually returns the QR itself; the dedicated endpoint is only needed when it does
 * not. A connected session refuses both, which surfaces as a plain error rather than a QR.
 *
 * A 404 from connect means the session was deleted on Wasender's side (e.g. a trial that ended).
 * The row is marked expired and its upstream id cleared so the UI can offer re-provisioning
 * instead of retrying a session that will never come back.
 */
export async function requestQrCode(
  env: Env,
  row: SessionRow,
): Promise<{ status: SessionStatus; qrCode?: string }> {
  if (!row.wasender_session_id) throw new Error('session was never provisioned upstream');

  const client = wasender(env);
  let connected;
  try {
    connected = await client.connectSession(row.wasender_session_id);
  } catch (err) {
    if (err instanceof WasenderError && err.status === 404) {
      await env.DB.prepare(
        'UPDATE whatsapp_sessions SET status = ?, wasender_session_id = NULL, last_error = ?, last_status_at = ? WHERE id = ?',
      )
        .bind('expired', 'session no longer exists on Wasender', nowSec(), row.id)
        .run();
      return { status: 'expired' };
    }
    throw err;
  }

  let qrCode = connected.qrCode;
  if (!qrCode && connected.status === 'need_scan') {
    qrCode = await client.getQrCode(row.wasender_session_id);
  }

  await setStatus(env, row.id, connected.status);
  return { status: connected.status, qrCode };
}

/** Pull authoritative status from Wasender. Used by the UI while a QR is pending. */
export async function refreshStatus(env: Env, row: SessionRow): Promise<SessionStatus> {
  const apiKey = await sessionApiKey(env, row);
  try {
    const status = await wasender(env).getStatus(apiKey);
    await setStatus(env, row.id, status);
    return status;
  } catch (err) {
    // Session deleted from Wasender → mark as expired so the UI shows the real state.
    if (err instanceof WasenderError && err.status === 404) {
      await env.DB.prepare(
        'UPDATE whatsapp_sessions SET status = ?, wasender_session_id = NULL, last_error = ?, last_status_at = ? WHERE id = ?',
      ).bind('expired', 'Session deleted from Wasender', nowSec(), row.id).run();
      return 'expired';
    }
    throw err;
  }
}

/**
 * Live status for a whole list, so the UI never shows a dead session as connected. A session
 * Wasender can't answer for (unreachable, no stored key) keeps its D1 status rather than
 * breaking the list.
 */
export async function refreshSessionsStatus(
  env: Env,
  rows: SessionRow[],
): Promise<SessionRow[]> {
  return Promise.all(
    rows.map(async (row) => {
      try {
        return { ...row, status: await refreshStatus(env, row) };
      } catch {
        return row;
      }
    }),
  );
}

/** Remove upstream first: deleting our row first would orphan a live session under the master account's plan. */
export async function removeSession(env: Env, row: SessionRow): Promise<void> {
  if (row.wasender_session_id) {
    await wasender(env).deleteSession(row.wasender_session_id);
  }
  await env.DB.prepare('DELETE FROM whatsapp_sessions WHERE id = ?').bind(row.id).run();
}
