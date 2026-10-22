import { encrypt } from './crypto';
import type { Env, PortalRow } from './types';
import { nowSec, uuid } from './util';

export interface InstallInput {
  memberId: string;
  bitrixDomain: string;
  clientEndpoint: string;
  accessToken: string;
  refreshToken: string;
  /** Only the ONAPPINSTALL event carries this; the iframe install POST does not. */
  applicationToken?: string | null;
}

export async function getPortalByMemberId(env: Env, memberId: string): Promise<PortalRow | null> {
  return env.DB.prepare('SELECT * FROM portals WHERE member_id = ?').bind(memberId).first<PortalRow>();
}

/** The queue consumer only has a session's portal_id to work from, not a request-scoped portal. */
export async function getPortalById(env: Env, portalId: string): Promise<PortalRow | null> {
  return env.DB.prepare('SELECT * FROM portals WHERE id = ?').bind(portalId).first<PortalRow>();
}

/**
 * Admin lookup by domain (the operator knows a customer's Bitrix24 domain, not their member_id or portal
 * id). idx_portals_domain is not unique - a domain can be revisited across an uninstall/reinstall
 * - so this is scoped to the current active install, matching how every other portal lookup
 * treats 'uninstalled' rows as gone.
 */
export async function getPortalByDomain(env: Env, domain: string): Promise<PortalRow | null> {
  return env.DB.prepare("SELECT * FROM portals WHERE bitrix_domain = ? AND status = 'active'")
    .bind(domain)
    .first<PortalRow>();
}

/**
 * Upsert a portal from either install path.
 *
 * application_token is COALESCE'd so the iframe path (which never sends one) cannot wipe the
 * token the ONAPPINSTALL event stored - without it, event validation would break on every
 * subsequent app open.
 */
export async function upsertPortal(env: Env, input: InstallInput): Promise<PortalRow> {
  const [accessToken, refreshToken] = await Promise.all([
    encrypt(input.accessToken, env.TOKEN_ENC_KEY),
    encrypt(input.refreshToken, env.TOKEN_ENC_KEY),
  ]);
  const ts = nowSec();

  await env.DB.prepare(
    `INSERT INTO portals (id, member_id, bitrix_domain, client_endpoint, access_token,
                          refresh_token, application_token, installed_at, updated_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
     ON CONFLICT(member_id) DO UPDATE SET
       bitrix_domain     = excluded.bitrix_domain,
       client_endpoint   = excluded.client_endpoint,
       access_token      = excluded.access_token,
       refresh_token     = excluded.refresh_token,
       application_token = COALESCE(excluded.application_token, portals.application_token),
       updated_at        = excluded.updated_at,
       status            = 'active'`,
  )
    .bind(
      uuid(),
      input.memberId,
      input.bitrixDomain,
      input.clientEndpoint,
      accessToken,
      refreshToken,
      input.applicationToken ?? null,
      ts,
      ts,
    )
    .run();

  const portal = await getPortalByMemberId(env, input.memberId);
  if (!portal) throw new Error('portal upsert did not persist');
  return portal;
}

export async function updatePortalTokens(
  env: Env,
  portalId: string,
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  const [enc, ref] = await Promise.all([
    encrypt(accessToken, env.TOKEN_ENC_KEY),
    encrypt(refreshToken, env.TOKEN_ENC_KEY),
  ]);
  await env.DB.prepare(
    'UPDATE portals SET access_token = ?, refresh_token = ?, updated_at = ? WHERE id = ?',
  )
    .bind(enc, ref, nowSec(), portalId)
    .run();
}

/**
 * Self-heal path for a portal whose application_token never arrived (ONAPPINSTALL is not
 * guaranteed - see events.ts's authenticate()) or has rotated: written only after the caller has
 * separately proven ownership of a working access_token, never on the strength of this call alone.
 */
export async function updateApplicationToken(
  env: Env,
  portalId: string,
  applicationToken: string,
): Promise<void> {
  await env.DB.prepare('UPDATE portals SET application_token = ?, updated_at = ? WHERE id = ?')
    .bind(applicationToken, nowSec(), portalId)
    .run();
}

export async function setConnectorVersion(
  env: Env,
  portalId: string,
  version: number,
): Promise<void> {
  await env.DB.prepare('UPDATE portals SET connector_version = ?, updated_at = ? WHERE id = ?')
    .bind(version, nowSec(), portalId)
    .run();
}

export async function updatePortalBotId(
  env: Env,
  portalId: string,
  botId: number,
): Promise<void> {
  await env.DB.prepare('UPDATE portals SET garcia_bot_id = ?, updated_at = ? WHERE id = ?')
    .bind(botId, nowSec(), portalId)
    .run();
}

/**
 * connector_version is also cleared here, not just status: Bitrix removes an app's registered
 * connector on uninstall, so the version this portal remembered no longer reflects reality.
 * Without clearing it, a reinstall's upsert-on-member_id preserves the stale value and
 * ensureConnectorRegistered wrongly skips re-registering - confirmed live 2026-08-05, the
 * connector vanished from Contact Center after an uninstall/reinstall cycle.
 */
export async function markUninstalled(env: Env, memberId: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE portals SET status = 'uninstalled', connector_version = NULL, updated_at = ? WHERE member_id = ?",
  )
    .bind(nowSec(), memberId)
    .run();
}
