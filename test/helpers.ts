import { env } from 'cloudflare:test';
// Imported as text so schema.sql stays the single source of truth for the D1 shape.
import schema from '../schema.sql?raw';
import { canonicalPayload } from '../src/license';
import type { LicenseEnvelope } from '../src/types';
import { toBase64 } from '../src/util';

/** Apply schema.sql to the in-memory test D1. */
export async function applySchema(): Promise<void> {
  // Strip comments to end-of-line before splitting: several comments contain a semicolon, which
  // would otherwise cut a CREATE TABLE in half. Safe here because no string literal in
  // schema.sql contains a double dash.
  const statements = schema
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

export async function resetDb(): Promise<void> {
  for (const table of [
    'message_log',
    'chat_map',
    'webhook_rate',
    'usage_counters',
    'whatsapp_sessions',
    'licenses',
    'portals',
  ]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}

export function frameForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const base: Record<string, string> = {
    DOMAIN: 'your-portal.bitrix24.com',
    PROTOCOL: '1',
    LANG: 'en',
    APP_SID: 'sid-1',
    AUTH_ID: 'access-token-1',
    AUTH_EXPIRES: '3600',
    REFRESH_ID: 'refresh-token-1',
    member_id: 'member-1',
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) form.set(k, v);
  return form;
}

/**
 * Build an /install request matching what Bitrix actually sends: DOMAIN/PROTOCOL/LANG/APP_SID as
 * URL query params, AUTH_ID/AUTH_EXPIRES/REFRESH_ID/member_id in the POST body. Observed live via
 * the nginx access log on 2026-08-05 - a plain form-in-body request (frameForm above) never
 * occurs against the real Bitrix24 Market install flow.
 */
export function frameRequest(url: string, overrides: Record<string, string> = {}): Request {
  const query: Record<string, string> = {
    DOMAIN: 'your-portal.bitrix24.com',
    PROTOCOL: '1',
    LANG: 'en',
    APP_SID: 'sid-1',
  };
  const body: Record<string, string> = {
    AUTH_ID: 'access-token-1',
    AUTH_EXPIRES: '3600',
    REFRESH_ID: 'refresh-token-1',
    member_id: 'member-1',
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (k in query) query[k] = v;
    else body[k] = v;
  }

  const form = new FormData();
  for (const [k, v] of Object.entries(body)) form.set(k, v);

  const target = new URL(url);
  for (const [k, v] of Object.entries(query)) target.searchParams.set(k, v);

  return new Request(target.toString(), { method: 'POST', body: form });
}
/* ---------- license fixtures (sign at test time - never ahead of time) ---------- */

/**
 * `licensed` requires signed_at + grace_days to be in the future, so any fixture with a hardcoded
 * signed_at expires the moment its grace window passes (the 2026-08-06 set died on 2026-08-13 and
 * took 5 tests with it). Everything below signs fixtures at test time against a per-call keypair,
 * so no spec ever needs a fixed timestamp again.
 */

/** Fresh Ed25519 keypair per call - license.ts caches public keys by the raw base64 string, so
 * every test that swaps env.LICENSE_PUBLIC_KEY gets its own isolated cache entry. */
export async function generateLicenseKeypair(): Promise<{ privateKey: CryptoKey; publicKeyB64: string }> {
  const { publicKey, privateKey } = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;
  const spki = (await crypto.subtle.exportKey('spki', publicKey)) as ArrayBuffer;
  return { privateKey, publicKeyB64: toBase64(new Uint8Array(spki)) };
}

/** Unsigned fixture envelope; issued_at/signed_at default to "now" so grace never lapses. */
export function licenseFixture(overrides: Partial<LicenseEnvelope> = {}): Omit<LicenseEnvelope, 'signature'> {
  const now = new Date().toISOString();
  return {
    valid: true,
    license_key: 'ACP-TEST-TEST-TEST-TEST',
    product: env.LICENSE_PRODUCT,
    portal_domain: 'member-1.bitrix24.com',
    tier: 'pro',
    status: 'active',
    expires_at: null,
    features: { max_numbers: 3, max_conversations_per_month: 100 },
    customer_name: 'Acme',
    grace_days: 7,
    issued_at: now,
    signed_at: now,
    ...overrides,
  };
}

/** Sign an unsigned fixture exactly the way acp-license-manager does (same canonical payload). */
export async function signLicenseEnvelope(
  privateKey: CryptoKey,
  envelope: Omit<LicenseEnvelope, 'signature'>,
): Promise<LicenseEnvelope> {
  const sig = await crypto.subtle.sign(
    { name: 'Ed25519' },
    privateKey,
    new TextEncoder().encode(canonicalPayload(envelope as LicenseEnvelope)),
  );
  return { ...envelope, signature: toBase64(new Uint8Array(sig)) };
}

/**
 * Sign a fresh fixture, install its public key as env's verifier, and store the envelope straight
 * in the licenses cache (signature is re-verified on read, so it has to really verify).
 * The LICENSE_ENFORCE=true suites use this to give a portal an active, verifiable license.
 */
export async function seedSignedLicense(
  portalId: string | undefined,
  overrides: Partial<LicenseEnvelope> = {},
): Promise<LicenseEnvelope> {
  const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
  (env as { LICENSE_PUBLIC_KEY: string }).LICENSE_PUBLIC_KEY = publicKeyB64;
  const envelope = await signLicenseEnvelope(privateKey, licenseFixture(overrides));

  await env.DB.prepare(
    `INSERT INTO licenses (portal_id, license_key, tier, status, expires_at, grace_days, signed_at, features, envelope, last_checked_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
  )
    .bind(
      portalId,
      envelope.license_key,
      envelope.tier,
      envelope.status,
      envelope.grace_days,
      Math.floor(Date.parse(envelope.signed_at) / 1000),
      JSON.stringify(envelope.features),
      JSON.stringify(envelope),
      Math.floor(Date.now() / 1000),
    )
    .run();
  return envelope;
}
