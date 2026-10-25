import { env } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { BitrixError, callMethod, refreshAccessToken } from '../src/bitrix';
import { upsertPortal } from '../src/db';
import { WasenderError, wasender } from '../src/wasender';
import { applySchema, resetDb } from './helpers';

/**
 * AbortSignal.timeout's 20 s can't be waited out in a test, so it is swapped for a signal that is
 * already aborted the way a real timeout aborts one, and fetch for a stub that honours the signal
 * like the runtime's does. A fetch made without a signal gets an ordinary 200 instead - which is
 * exactly what would make these tests fail if the signal were ever dropped again.
 */
function stubTimedOutFetch() {
  const timeoutSpy = vi
    .spyOn(AbortSignal, 'timeout')
    .mockImplementation(() => AbortSignal.abort(new DOMException('The operation timed out.', 'TimeoutError')));
  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
    const signal = init?.signal;
    if (signal?.aborted) throw signal.reason;
    return Response.json({ result: true, success: true, data: { msgId: 1 }, access_token: 'a', refresh_token: 'r' });
  });
  return { timeoutSpy, fetchSpy };
}

async function seedPortal() {
  return upsertPortal(env, {
    memberId: 'member-1',
    bitrixDomain: 'member-1.bitrix24.com',
    clientEndpoint: 'https://member-1.bitrix24.com/rest/',
    accessToken: 'a',
    refreshToken: 'r',
    applicationToken: 'app',
  });
}

beforeAll(applySchema);
beforeEach(resetDb);
afterEach(() => {
  vi.restoreAllMocks();
});

describe('outbound HTTP timeouts', () => {
  it('surfaces a timed-out Bitrix call as a retryable ERROR_TIMEOUT BitrixError', async () => {
    const portal = await seedPortal();
    const { timeoutSpy, fetchSpy } = stubTimedOutFetch();

    const err = await callMethod(env, portal, 'imconnector.send.status.delivery', {}).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(BitrixError);
    expect(err).toMatchObject({
      code: 'ERROR_TIMEOUT',
      description: 'HTTP request timed out after 20000ms',
      method: 'imconnector.send.status.delivery',
    });
    expect(timeoutSpy).toHaveBeenCalledWith(20_000);
    // Not mistaken for an expired token: no oauth refresh, just the one call.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('surfaces a timed-out oauth refresh as an ERROR_TIMEOUT BitrixError', async () => {
    const portal = await seedPortal();
    stubTimedOutFetch();

    const err = await refreshAccessToken(env, portal).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(BitrixError);
    expect(err).toMatchObject({
      code: 'ERROR_TIMEOUT',
      description: 'oauth.token.refresh timed out after 20000ms',
      method: 'oauth.token.refresh',
    });
  });

  it('surfaces a timed-out Wasender call as a retryable 504 WasenderError', async () => {
    const { timeoutSpy } = stubTimedOutFetch();

    const err = await wasender(env).sendText('session-api-key', '+971500000000', 'hi').catch((e: unknown) => e);

    expect(err).toBeInstanceOf(WasenderError);
    expect(err).toMatchObject({ status: 504, message: 'request timed out after 20000ms', retryable: true });
    expect(timeoutSpy).toHaveBeenCalledWith(20_000);
  });
});
