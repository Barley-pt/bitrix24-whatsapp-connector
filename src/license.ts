import { getPortalById } from './db';
import type { Env, LicenseEnvelope, LicenseRow, PortalRow } from './types';
import { fromBase64, nowSec } from './util';

/**
 * Maestro (acp-license-manager) client, Workers-native.
 *
 * This is a port of the companion app's server/lib/license/{verify,licenseClient}.ts (Node,
 * filesystem cache) to Cloudflare Workers (Web Crypto, D1 cache via the `licenses` table - one
 * row per portal, already scoped by portal_id in schema.sql). The signing side lives in
 * acp-license-manager/src/signing.ts; canonicalJson/canonicalPayload below MUST stay byte-for-byte
 * identical to that source (and to the companion app's copy) or every signature fails to verify.
 *
 * Model: one product per app (`env.LICENSE_PRODUCT`, "garcia-relay" for this app - see
 * wrangler.jsonc), many licenses under it, one activation per portal. Fail-closed: no key, no
 * envelope, or a signature that does not verify all mean unlicensed.
 */

const STALE_AFTER_MS = 12 * 60 * 60 * 1000; // Maestro's recommended re-validate cadence.
const REQUEST_TIMEOUT_MS = 10_000;

/* ---------- canonical signing (must match acp-license-manager/src/signing.ts) ---------- */

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`;
}

/** Exported for tests only - lets a test sign a fixture envelope with a locally generated keypair
 * using the exact same canonicalization verifyEnvelope checks against. */
export function canonicalPayload(e: LicenseEnvelope): string {
  return canonicalJson({
    customer_name: e.customer_name ?? null,
    expires_at: e.expires_at ?? null,
    features: e.features ?? {},
    grace_days: e.grace_days,
    issued_at: e.issued_at,
    license_key: e.license_key,
    portal_domain: e.portal_domain,
    product: e.product,
    signed_at: e.signed_at,
    status: e.status,
    tier: e.tier,
  });
}

// Importing a key is not free; cache it per isolate, keyed by the raw base64 (rotation-safe).
const publicKeyCache = new Map<string, CryptoKey | null>();

async function importPublicKey(publicKeyB64: string): Promise<CryptoKey | null> {
  if (!publicKeyB64 || publicKeyB64.startsWith('REPLACE_WITH') || publicKeyB64.startsWith('<')) return null;
  if (publicKeyCache.has(publicKeyB64)) return publicKeyCache.get(publicKeyB64) ?? null;
  let key: CryptoKey | null;
  try {
    key = await crypto.subtle.importKey('spki', fromBase64(publicKeyB64), { name: 'Ed25519' }, false, ['verify']);
  } catch {
    key = null;
  }
  publicKeyCache.set(publicKeyB64, key);
  return key;
}

/**
 * True when the envelope's Ed25519 signature is valid AND bound to this exact
 * (product, portal_domain) - the binding is what stops a signed envelope from being copied to a
 * different portal or product.
 */
export async function verifyEnvelope(
  publicKeyB64: string,
  envelope: LicenseEnvelope,
  expected: { product: string; portalDomain: string },
): Promise<boolean> {
  if (!envelope || !envelope.signature) return false;
  if (envelope.product !== expected.product) return false;
  if (envelope.portal_domain !== expected.portalDomain) return false;
  const key = await importPublicKey(publicKeyB64);
  if (!key) return false;
  try {
    return await crypto.subtle.verify(
      { name: 'Ed25519' },
      key,
      fromBase64(envelope.signature),
      new TextEncoder().encode(canonicalPayload(envelope)),
    );
  } catch {
    return false;
  }
}

export const isEnforced = (env: Env): boolean => env.LICENSE_ENFORCE === 'true';

/* ---------- D1 persistence ---------- */

async function getRow(env: Env, portalId: string): Promise<LicenseRow | null> {
  return env.DB.prepare('SELECT * FROM licenses WHERE portal_id = ?').bind(portalId).first<LicenseRow>();
}

/** Verified envelope -> upsert the full cache row. */
async function storeEnvelope(env: Env, portalId: string, envelope: LicenseEnvelope): Promise<void> {
  const expiresAt = envelope.expires_at ? Math.floor(Date.parse(envelope.expires_at) / 1000) : null;
  const signedAt = Math.floor(Date.parse(envelope.signed_at) / 1000);
  await env.DB.prepare(
    `INSERT INTO licenses (portal_id, license_key, tier, status, expires_at, grace_days, signed_at, features, envelope, last_checked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(portal_id) DO UPDATE SET
       license_key     = excluded.license_key,
       tier            = excluded.tier,
       status          = excluded.status,
       expires_at      = excluded.expires_at,
       grace_days      = excluded.grace_days,
       signed_at       = excluded.signed_at,
       features        = excluded.features,
       envelope        = excluded.envelope,
       last_checked_at = excluded.last_checked_at`,
  )
    .bind(
      portalId,
      envelope.license_key,
      envelope.tier,
      envelope.status,
      expiresAt,
      envelope.grace_days,
      signedAt,
      JSON.stringify(envelope.features ?? {}),
      JSON.stringify(envelope),
      nowSec(),
    )
    .run();
}

/**
 * An authoritative negative (REVOKED / EXPIRED / INVALID_KEY / PRODUCT_MISMATCH) drops the cached
 * envelope immediately - no grace period for those, mirroring the companion app's clearCache.
 * INVALID_KEY/PRODUCT_MISMATCH also drop the stored key itself (it does not belong to this
 * portal); REVOKED/EXPIRED keep it so an admin can see what was revoked/expired.
 */
async function storeFailure(
  env: Env,
  portalId: string,
  error: string,
  keepKey: string | null,
): Promise<void> {
  const status = error === 'REVOKED' ? 'revoked' : error === 'EXPIRED' ? 'expired' : 'unlicensed';
  await env.DB.prepare(
    `INSERT INTO licenses (portal_id, license_key, status, envelope, features, last_checked_at)
     VALUES (?, ?, ?, NULL, NULL, ?)
     ON CONFLICT(portal_id) DO UPDATE SET
       license_key     = excluded.license_key,
       status          = excluded.status,
       envelope        = NULL,
       features        = NULL,
       last_checked_at = excluded.last_checked_at`,
  )
    .bind(portalId, keepKey, status, nowSec())
    .run();
}

/* ---------- transport ---------- */

interface MaestroResponse {
  valid?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

async function post(env: Env, pathname: string, body: Record<string, unknown>): Promise<MaestroResponse> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.LICENSE_SERVER_URL.replace(/\/+$/, '')}${pathname}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    return (await res.json().catch(() => ({}))) as MaestroResponse;
  } finally {
    clearTimeout(t);
  }
}

/** instance_id is informational on Maestro's side (analytics on the activations row) - the
 * portal's own stable D1 id is a fine, zero-storage choice. */
function baseBody(env: Env, portal: PortalRow, licenseKey: string): Record<string, unknown> {
  return {
    license_key: licenseKey,
    product: env.LICENSE_PRODUCT,
    portal_domain: portal.bitrix_domain,
    instance_id: portal.id,
    app_version: env.APP_VERSION,
  };
}

export interface LicenseResult {
  ok: boolean;
  error?: string;
  message?: string;
  offline?: boolean;
  envelope?: LicenseEnvelope;
}

async function handleResponse(
  env: Env,
  portal: PortalRow,
  json: MaestroResponse,
  licenseKeyAttempted: string,
): Promise<LicenseResult> {
  if (json.valid) {
    const envelope = json as unknown as LicenseEnvelope;
    const ok = await verifyEnvelope(env.LICENSE_PUBLIC_KEY, envelope, {
      product: env.LICENSE_PRODUCT,
      portalDomain: portal.bitrix_domain,
    });
    if (!ok) {
      return { ok: false, error: 'BAD_SIGNATURE', message: 'License response failed signature verification.' };
    }
    await storeEnvelope(env, portal.id, envelope);
    return { ok: true, envelope };
  }

  const error = json.error ?? 'SERVER_ERROR';
  if (error === 'REVOKED' || error === 'EXPIRED' || error === 'INVALID_KEY' || error === 'PRODUCT_MISMATCH') {
    const keepKey = error === 'INVALID_KEY' || error === 'PRODUCT_MISMATCH' ? null : licenseKeyAttempted;
    await storeFailure(env, portal.id, error, keepKey);
  }
  return { ok: false, error, message: json.message ?? 'License check failed.' };
}

/** Claim a license key on this portal (binds a seat). */
export async function activate(env: Env, portal: PortalRow, licenseKey: string): Promise<LicenseResult> {
  const key = licenseKey.trim().toUpperCase();
  if (!key) return { ok: false, error: 'BAD_REQUEST', message: 'A license key is required.' };
  try {
    return await handleResponse(env, portal, await post(env, '/v1/activate', baseBody(env, portal, key)), key);
  } catch (err) {
    return { ok: false, error: 'NETWORK', message: err instanceof Error ? err.message : String(err) };
  }
}

/** Re-check the stored key. On network failure the cached envelope stays in force until grace expires. */
export async function validate(env: Env, portal: PortalRow): Promise<LicenseResult> {
  const row = await getRow(env, portal.id);
  if (!row?.license_key) return { ok: false, error: 'NO_KEY', message: 'No license key on file for this portal.' };
  try {
    return await handleResponse(
      env,
      portal,
      await post(env, '/v1/validate', baseBody(env, portal, row.license_key)),
      row.license_key,
    );
  } catch (err) {
    return { ok: false, offline: true, error: 'NETWORK', message: err instanceof Error ? err.message : String(err) };
  }
}

/** Release this portal's seat and forget the cached row. Best-effort network call. */
export async function deactivate(env: Env, portal: PortalRow): Promise<void> {
  const row = await getRow(env, portal.id);
  if (row?.license_key) {
    try {
      await post(env, '/v1/deactivate', baseBody(env, portal, row.license_key));
    } catch {
      /* best effort - the seat can also be reclaimed server-side via the Maestro admin */
    }
  }
  await env.DB.prepare('DELETE FROM licenses WHERE portal_id = ?').bind(portal.id).run();
}

/**
 * Cache-first freshness. Skips the network entirely when there is no key to check, and trusts a
 * cache younger than `staleAfterMs`. Called from the cron (scheduled handler) and can also be
 * called from a request path without blocking the response via ctx.waitUntil.
 */
export async function ensureFresh(env: Env, portal: PortalRow, staleAfterMs = STALE_AFTER_MS): Promise<void> {
  const row = await getRow(env, portal.id);
  if (!row?.license_key) return;
  if (nowSec() - row.last_checked_at < staleAfterMs / 1000) return;
  await validate(env, portal);
}

/** Revalidates every portal that has a license key on file. Used by the cron trigger. */
export async function refreshAllPortals(env: Env): Promise<void> {
  const { results } = await env.DB.prepare(
    `SELECT p.* FROM portals p
     JOIN licenses l ON l.portal_id = p.id
     WHERE l.license_key IS NOT NULL AND p.status = 'active'`,
  ).all<PortalRow>();

  for (const portal of results) {
    await ensureFresh(env, portal).catch((err) => {
      console.error(
        JSON.stringify({
          msg: 'license refresh failed',
          portalId: portal.id,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    });
  }
}

/* ---------- read model ---------- */

export interface LicenseSnapshot {
  hasKey: boolean;
  licensed: boolean;
  tier: LicenseEnvelope['tier'] | null;
  status: string;
  expiresAt: number | null;
  graceRemainingDays: number;
  features: Record<string, unknown>;
  lastCheckedAt: number | null;
}

const UNLICENSED: Omit<LicenseSnapshot, 'hasKey' | 'status' | 'lastCheckedAt'> = {
  licensed: false,
  tier: null,
  expiresAt: null,
  graceRemainingDays: 0,
  features: {},
};

/**
 * Cache-only, synchronous-cost read: re-verifies the stored envelope's signature (never trusts D1
 * blindly - defense in depth, same reasoning as the companion app re-verifying its disk cache on
 * load) and recomputes expiry/grace from it. Does not hit the network; call ensureFresh first if a
 * refresh is warranted.
 */
export async function snapshot(env: Env, portal: PortalRow): Promise<LicenseSnapshot> {
  const row = await getRow(env, portal.id);
  if (!row) return { ...UNLICENSED, hasKey: false, status: 'unlicensed', lastCheckedAt: null };
  if (!row.envelope) {
    return { ...UNLICENSED, hasKey: row.license_key !== null, status: row.status, lastCheckedAt: row.last_checked_at };
  }

  let envelope: LicenseEnvelope;
  try {
    envelope = JSON.parse(row.envelope) as LicenseEnvelope;
  } catch {
    return { ...UNLICENSED, hasKey: true, status: 'unlicensed', lastCheckedAt: row.last_checked_at };
  }

  const validSig = await verifyEnvelope(env.LICENSE_PUBLIC_KEY, envelope, {
    product: env.LICENSE_PRODUCT,
    portalDomain: portal.bitrix_domain,
  });
  if (!validSig) {
    return { ...UNLICENSED, hasKey: true, status: 'unlicensed', lastCheckedAt: row.last_checked_at };
  }

  const graceDays = Number(envelope.grace_days) || 0;
  const signedAtMs = Date.parse(envelope.signed_at);
  const graceMs = graceDays * 86_400_000;
  const withinGrace = Number.isFinite(signedAtMs) && Date.now() <= signedAtMs + graceMs;
  const notExpired = !envelope.expires_at || Date.parse(envelope.expires_at) > Date.now();
  const licensed = envelope.status === 'active' && notExpired && withinGrace;
  const graceRemainingDays = Number.isFinite(signedAtMs)
    ? Math.max(0, Math.ceil((signedAtMs + graceMs - Date.now()) / 86_400_000))
    : 0;

  return {
    hasKey: true,
    licensed,
    tier: envelope.tier,
    status: envelope.status,
    expiresAt: row.expires_at,
    graceRemainingDays,
    features: envelope.features ?? {},
    lastCheckedAt: row.last_checked_at,
  };
}

/** Convenience wrapper for callers that only have a portal_id (e.g. the queue consumer). */
export async function snapshotByPortalId(env: Env, portalId: string): Promise<LicenseSnapshot | null> {
  const portal = await getPortalById(env, portalId);
  if (!portal) return null;
  return snapshot(env, portal);
}
