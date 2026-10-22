import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { verifyEnvelope } from '../src/license';
import { issueSession } from '../src/session';
import type { LicenseRow } from '../src/types';
import {
  applySchema,
  generateLicenseKeypair,
  licenseFixture,
  resetDb,
  signLicenseEnvelope,
} from './helpers';

const MAESTRO = 'https://maestro.test';
const PRODUCT = 'wa-connector'; // matches vitest.config.ts's LICENSE_PRODUCT

async function seedPortal(memberId = 'member-1') {
  return upsertPortal(env, {
    memberId,
    bitrixDomain: `${memberId}.bitrix24.com`,
    clientEndpoint: `https://${memberId}.bitrix24.com/rest/`,
    accessToken: 'a',
    refreshToken: 'r',
    applicationToken: 'app',
  });
}

async function adminCall(path: string, init: RequestInit = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request(`https://relay.test${path}`, {
      ...init,
      headers: {
        'X-Edge-Auth': 'test-edge-secret',
        'X-Admin-Key': env.ADMIN_SECRET,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    }),
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return res;
}

async function apiState(memberId = 'member-1') {
  const token = await issueSession(env, memberId);
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request('https://relay.test/api/state', {
      headers: { 'X-Edge-Auth': 'test-edge-secret', 'X-App-Session': token },
    }),
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return res;
}

const licenseRow = (portalId: string) =>
  env.DB.prepare('SELECT * FROM licenses WHERE portal_id = ?').bind(portalId).first<LicenseRow>();

beforeAll(async () => {
  await applySchema();
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

beforeEach(resetDb);
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe('canonical signing (must match acp-license-manager)', () => {
  it('verifies a correctly signed envelope', async () => {
    const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
    const envelope = await signLicenseEnvelope(privateKey, licenseFixture());

    const ok = await verifyEnvelope(publicKeyB64, envelope, {
      product: PRODUCT,
      portalDomain: 'member-1.bitrix24.com',
    });
    expect(ok).toBe(true);
  });

  it('rejects a tampered field even though the signature blob is unchanged', async () => {
    const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
    const envelope = await signLicenseEnvelope(privateKey, licenseFixture());
    const tampered = { ...envelope, tier: 'lifetime' as const };

    expect(
      await verifyEnvelope(publicKeyB64, tampered, { product: PRODUCT, portalDomain: 'member-1.bitrix24.com' }),
    ).toBe(false);
  });

  it('rejects an envelope signed for a different portal (anti-copy binding)', async () => {
    const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
    const envelope = await signLicenseEnvelope(privateKey, licenseFixture({ portal_domain: 'other.bitrix24.com' }));

    expect(
      await verifyEnvelope(publicKeyB64, envelope, { product: PRODUCT, portalDomain: 'member-1.bitrix24.com' }),
    ).toBe(false);
  });

  it('rejects a signature made with a different key', async () => {
    const { publicKeyB64 } = await generateLicenseKeypair();
    const other = await generateLicenseKeypair();
    const envelope = await signLicenseEnvelope(other.privateKey, licenseFixture());

    expect(
      await verifyEnvelope(publicKeyB64, envelope, { product: PRODUCT, portalDomain: 'member-1.bitrix24.com' }),
    ).toBe(false);
  });
});

describe('/admin/portals/:domain/license', () => {
  it('rejects requests without the admin secret', async () => {
    await seedPortal();
    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request('https://relay.test/admin/portals/member-1.bitrix24.com/license', {
        headers: { 'X-Edge-Auth': 'test-edge-secret' },
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it('rejects the wrong admin secret', async () => {
    await seedPortal();
    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request('https://relay.test/admin/portals/member-1.bitrix24.com/license', {
        headers: { 'X-Edge-Auth': 'test-edge-secret', 'X-Admin-Key': 'nope' },
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it('activates a key, verifies the signature, and persists the envelope to D1', async () => {
    const portal = await seedPortal();
    const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
    (env as { LICENSE_PUBLIC_KEY: string }).LICENSE_PUBLIC_KEY = publicKeyB64;

    const envelope = await signLicenseEnvelope(privateKey, licenseFixture());
    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(MAESTRO)
      .intercept({
        path: '/v1/activate',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, envelope);

    const res = await adminCall('/admin/portals/member-1.bitrix24.com/license', {
      method: 'POST',
      body: JSON.stringify({ licenseKey: 'acp-test-test-test-test' }),
    });

    expect(res.status).toBe(200);
    expect(sentBody.license_key).toBe('ACP-TEST-TEST-TEST-TEST'); // uppercased before sending
    expect(sentBody.product).toBe(PRODUCT);
    expect(sentBody.portal_domain).toBe('member-1.bitrix24.com');

    const row = await licenseRow(portal.id);
    expect(row?.license_key).toBe('ACP-TEST-TEST-TEST-TEST');
    expect(row?.tier).toBe('pro');
    expect(row?.status).toBe('active');
    expect(JSON.parse(row?.features ?? '{}')).toEqual({ max_numbers: 3, max_conversations_per_month: 100 });

    // /api/state must reflect it, re-verified from the stored envelope.
    const state = (await (await apiState()).json()) as { license: Record<string, unknown> };
    expect(state.license.tier).toBe('pro');
    expect(state.license.licensed).toBe(true);
    expect(state.license.maxNumbers).toBe(3);
    expect(state.license.maxConversationsPerMonth).toBe(100);
  });

  it('does not persist an envelope whose signature fails verification', async () => {
    const portal = await seedPortal();
    // LICENSE_PUBLIC_KEY stays the vitest.config.ts placeholder, which cannot verify anything.
    const { privateKey } = await generateLicenseKeypair();
    const envelope = await signLicenseEnvelope(privateKey, licenseFixture());

    fetchMock.get(MAESTRO).intercept({ path: '/v1/activate', method: 'POST' }).reply(200, envelope);

    const res = await adminCall('/admin/portals/member-1.bitrix24.com/license', {
      method: 'POST',
      body: JSON.stringify({ licenseKey: 'ACP-TEST-TEST-TEST-TEST' }),
    });

    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toBe('BAD_SIGNATURE');
    expect(await licenseRow(portal.id)).toBeNull();
  });

  it('clears the cached envelope on an authoritative REVOKED response', async () => {
    const portal = await seedPortal();
    const { privateKey, publicKeyB64 } = await generateLicenseKeypair();
    (env as { LICENSE_PUBLIC_KEY: string }).LICENSE_PUBLIC_KEY = publicKeyB64;

    // First, a real activation.
    const envelope = await signLicenseEnvelope(privateKey, licenseFixture());
    fetchMock.get(MAESTRO).intercept({ path: '/v1/activate', method: 'POST' }).reply(200, envelope);
    await adminCall('/admin/portals/member-1.bitrix24.com/license', {
      method: 'POST',
      body: JSON.stringify({ licenseKey: 'ACP-TEST-TEST-TEST-TEST' }),
    });
    expect((await licenseRow(portal.id))?.envelope).not.toBeNull();

    // Then Maestro revokes it; a revalidate must drop the cache immediately (no grace).
    fetchMock
      .get(MAESTRO)
      .intercept({ path: '/v1/validate', method: 'POST' })
      .reply(403, { valid: false, error: 'REVOKED', message: 'License revoked.' });

    const res = await adminCall('/admin/portals/member-1.bitrix24.com/license/revalidate', { method: 'POST' });
    expect(res.status).toBe(400);

    const row = await licenseRow(portal.id);
    expect(row?.status).toBe('revoked');
    expect(row?.envelope).toBeNull();
    expect(row?.license_key).toBe('ACP-TEST-TEST-TEST-TEST'); // kept, unlike INVALID_KEY

    const state = (await (await apiState()).json()) as { license: Record<string, unknown> };
    expect(state.license.licensed).toBe(false);
  });

  it('404s for a domain with no active portal', async () => {
    const res = await adminCall('/admin/portals/nowhere.bitrix24.com/license');
    expect(res.status).toBe(404);
  });
});
