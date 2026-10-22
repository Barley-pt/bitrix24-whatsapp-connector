import { createExecutionContext, env, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { issueSession } from '../src/session';
import type { Env } from '../src/types';
import { applySchema, resetDb } from './helpers';

/**
 * The edge gate (src/middleware/edgeAuth.ts) is opt-in: index.ts mounts it only while
 * EDGE_SECRET is configured, so a self-hosted deployment without a reverse proxy in front is
 * never bricked by a 403 on every request - while a deployment that DOES set the secret keeps
 * failing closed.
 */
async function call(path: string, headers: Record<string, string>, extra: Partial<Env> = {}) {
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request(`https://relay.test${path}`, { headers }),
    { ...env, ...extra } as Env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return res;
}

async function stateHeaders(overrides: Record<string, string> = {}) {
  await upsertPortal(env, {
    memberId: 'member-1',
    bitrixDomain: 'member-1.bitrix24.com',
    clientEndpoint: 'https://member-1.bitrix24.com/rest/',
    accessToken: 'a',
    refreshToken: 'r',
    applicationToken: 'app',
  });
  const token = await issueSession(env, 'member-1');
  return { 'X-App-Session': token, ...overrides };
}

beforeAll(applySchema);
beforeEach(resetDb);

describe('edge auth optionality', () => {
  it('serves /api/state without X-Edge-Auth when EDGE_SECRET is unset (no proxy in front)', async () => {
    const res = await call('/api/state', await stateHeaders(), { EDGE_SECRET: undefined });
    expect(res.status).toBe(200);
  });

  it('still fails closed on /admin when EDGE_SECRET is unset - routes keep their own auth', async () => {
    const res = await call('/admin/portals/nowhere.bitrix24.com/license', {}, {
      EDGE_SECRET: undefined,
    });
    expect(res.status).toBe(401); // no X-Admin-Key: admin auth, not the edge gate
  });

  it('403s /api/state without the header when EDGE_SECRET IS set', async () => {
    const res = await call('/api/state', await stateHeaders());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'FORBIDDEN' });
  });

  it('403s a mismatched X-Edge-Auth when EDGE_SECRET is set', async () => {
    const res = await call('/api/state', await stateHeaders({ 'X-Edge-Auth': 'wrong' }));
    expect(res.status).toBe(403);
  });

  it('serves /api/state with a matching X-Edge-Auth when EDGE_SECRET is set', async () => {
    const res = await call('/api/state', await stateHeaders({ 'X-Edge-Auth': 'test-edge-secret' }));
    expect(res.status).toBe(200);
  });
});
