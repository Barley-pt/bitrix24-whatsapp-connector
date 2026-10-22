import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { resolveBranding } from '../src/brand';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { canonicalPayload } from '../src/license';
import { issueSession } from '../src/session';
import type { Env, LicenseEnvelope, PortalRow } from '../src/types';
import { toBase64 } from '../src/util';
import { applySchema, resetDb } from './helpers';

const PRODUCT = 'wa-connector'; // matches vitest.config.ts's LICENSE_PRODUCT
const SIGNED_AT = new Date();

/** Fresh Ed25519 keypair per test file - license.ts caches public keys by raw string. */
async function generateKeypair() {
  const { publicKey, privateKey } = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;
  const spki = (await crypto.subtle.exportKey('spki', publicKey)) as ArrayBuffer;
  return { privateKey, publicKeyB64: toBase64(new Uint8Array(spki)) };
}

function unsignedEnvelope(
  portal: PortalRow,
  features: Record<string, unknown>,
): Omit<LicenseEnvelope, 'signature'> {
  return {
    valid: true,
    license_key: 'ACP-TEST-TEST-TEST-TEST',
    product: PRODUCT,
    portal_domain: portal.bitrix_domain,
    tier: 'pro',
    status: 'active',
    expires_at: null,
    features,
    customer_name: 'Acme',
    grace_days: 7,
    issued_at: SIGNED_AT.toISOString(),
    // Signed now, not a fixed past date: licensed requires signed_at + grace_days to be in the
    // future (a hardcoded fixture would rot exactly like the expired test keys did).
    signed_at: SIGNED_AT.toISOString(),
  };
}

/** Store a signed envelope straight into D1's licenses cache (signature is re-verified on read). */
async function seedLicense(portal: PortalRow, features: Record<string, unknown>): Promise<void> {
  const { privateKey, publicKeyB64 } = await generateKeypair();
  (env as { LICENSE_PUBLIC_KEY: string }).LICENSE_PUBLIC_KEY = publicKeyB64;

  const unsigned = unsignedEnvelope(portal, features);
  const sig = await crypto.subtle.sign(
    { name: 'Ed25519' },
    privateKey,
    new TextEncoder().encode(canonicalPayload(unsigned as LicenseEnvelope)),
  );
  const envelope: LicenseEnvelope = { ...unsigned, signature: toBase64(new Uint8Array(sig)) };

  await env.DB.prepare(
    `INSERT INTO licenses (portal_id, license_key, tier, status, expires_at, grace_days, signed_at, features, envelope, last_checked_at)
     VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
  )
    .bind(
      portal.id,
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
}

async function seedPortal(memberId = 'member-1'): Promise<PortalRow> {
  return upsertPortal(env, {
    memberId,
    bitrixDomain: `${memberId}.bitrix24.com`,
    clientEndpoint: `https://${memberId}.bitrix24.com/rest/`,
    accessToken: 'a',
    refreshToken: 'r',
    applicationToken: 'app',
  });
}

type StateResponse = {
  branding: { poweredBy: string | null; connectorName: string; botName: string; supportUrl: string | null };
  license: { licensed: boolean; whiteLabel: boolean };
};

/**
 * GET /api/state, optionally with extra Worker bindings layered over the test env - the only way
 * to exercise BRAND_* overrides, since vitest.config.ts does not define them.
 */
async function apiState(extra: Partial<Record<string, string>> = {}): Promise<StateResponse> {
  const token = await issueSession(env, 'member-1');
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request('https://relay.test/api/state', {
      headers: { 'X-Edge-Auth': 'test-edge-secret', 'X-App-Session': token },
    }),
    { ...env, ...extra } as unknown as Env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  expect(res.status).toBe(200);
  return (await res.json()) as StateResponse;
}

beforeAll(applySchema);
beforeEach(resetDb);
afterEach(() => {
  // LICENSE_PUBLIC_KEY was swapped for a per-test keypair.
  (env as { LICENSE_PUBLIC_KEY: string }).LICENSE_PUBLIC_KEY = 'test-public-key';
});

describe('resolveBranding', () => {
  const base = {
    CONNECTOR_NAME: 'WhatsApp',
    BRAND_CONNECTOR_NAME: '',
    BRAND_BOT_NAME: '',
    BRAND_SUPPORT_URL: '',
  } as unknown as Env;

  it('free tier (no white label) forces ACP GROUP attribution', () => {
    const branding = resolveBranding(base, false);
    expect(branding.poweredBy).toBe('ACP GROUP');
    expect(branding.supportUrl).toBe('https://acp-24.com');
    expect(branding.connectorName).toBe('WhatsApp');
    expect(branding.botName).toBe('WhatsApp Audio');
  });

  it('white label drops the attribution and keeps the default names when no override is set', () => {
    const branding = resolveBranding(base, true);
    expect(branding.poweredBy).toBeNull();
    expect(branding.supportUrl).toBeNull();
    expect(branding.connectorName).toBe('WhatsApp');
    expect(branding.botName).toBe('WhatsApp Audio');
  });

  it('white label honors the BRAND_* overrides', () => {
    const branded = {
      ...base,
      BRAND_CONNECTOR_NAME: 'Acme Chat',
      BRAND_BOT_NAME: 'Acme Audio Bot',
      BRAND_SUPPORT_URL: 'https://example.com/support',
    } as unknown as Env;
    const branding = resolveBranding(branded, true);
    expect(branding).toEqual({
      poweredBy: null,
      connectorName: 'Acme Chat',
      botName: 'Acme Audio Bot',
      supportUrl: 'https://example.com/support',
    });
    // Overrides never apply to the free tier - its attribution and link are fixed.
    expect(resolveBranding(branded, false).connectorName).toBe('WhatsApp');
  });
});

describe('/api/state branding', () => {
  it('an unlicensed portal gets the free-tier attribution', async () => {
    await seedPortal();
    const state = await apiState();
    expect(state.license.licensed).toBe(false);
    expect(state.license.whiteLabel).toBe(false);
    expect(state.branding).toEqual({
      poweredBy: 'ACP GROUP',
      connectorName: 'WhatsApp',
      botName: 'WhatsApp Audio',
      supportUrl: 'https://acp-24.com',
    });
  });

  it('a licensed portal without white_label stays free-tier branded', async () => {
    const portal = await seedPortal();
    await seedLicense(portal, { max_numbers: 3 });
    const state = await apiState();
    expect(state.license.licensed).toBe(true);
    expect(state.license.whiteLabel).toBe(false);
    expect(state.branding.poweredBy).toBe('ACP GROUP');
  });

  it('licensed with white_label: attribution removed, BRAND_* overrides honored', async () => {
    const portal = await seedPortal();
    await seedLicense(portal, { white_label: true });

    const plain = await apiState();
    expect(plain.license.licensed).toBe(true);
    expect(plain.license.whiteLabel).toBe(true);
    expect(plain.branding).toEqual({
      poweredBy: null,
      connectorName: 'WhatsApp',
      botName: 'WhatsApp Audio',
      supportUrl: null,
    });

    const overridden = await apiState({
      BRAND_CONNECTOR_NAME: 'Acme Chat',
      BRAND_BOT_NAME: 'Acme Audio Bot',
      BRAND_SUPPORT_URL: 'https://example.com/support',
    });
    expect(overridden.branding).toEqual({
      poweredBy: null,
      connectorName: 'Acme Chat',
      botName: 'Acme Audio Bot',
      supportUrl: 'https://example.com/support',
    });
  });
});
