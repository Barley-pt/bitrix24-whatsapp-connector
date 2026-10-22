import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { decrypt } from '../src/crypto';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { issueSession } from '../src/session';
import type { SessionRow } from '../src/types';
import { applySchema, resetDb, seedSignedLicense } from './helpers';

const WASENDER = 'https://wasender.test';

// No `status` field: confirmed live 2026-08-05 that creation never returns one — a fresh session
// has never attempted to connect, so there is nothing to report yet (see docs/wasenderapi.md).
const CREATED = {
  id: 106487,
  name: 'Acme Support',
  phone_number: '+971557801481',
  api_key: 'session-api-key-abc',
  webhook_secret: 'webhook-secret-xyz',
  webhook_url: null,
  webhook_enabled: true,
  webhook_events: [],
};

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

async function call(path: string, memberId: string, init: RequestInit = {}) {
  const token = await issueSession(env, memberId);
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request(`https://relay.test${path}`, {
      ...init,
      headers: {
        'X-Edge-Auth': 'test-edge-secret',
        'X-App-Session': token,
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

const rows = () =>
  env.DB.prepare('SELECT * FROM whatsapp_sessions').all<SessionRow>().then((r) => r.results);

beforeAll(async () => {
  await applySchema();
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

beforeEach(resetDb);
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe('POST /api/sessions', () => {
  it('provisions upstream and stores both credentials encrypted', async () => {
    await seedPortal();

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/whatsapp-sessions',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: CREATED });

    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { session: Record<string, unknown> };
    expect(body.session.phone_number).toBe('+971557801481');
    // Wasender returns no status on creation; the row starts out disconnected.
    expect(body.session.status).toBe('disconnected');
    // The UI must never receive credentials.
    expect(JSON.stringify(body)).not.toContain('session-api-key-abc');
    expect(JSON.stringify(body)).not.toContain('webhook-secret-xyz');

    const [row] = await rows();
    expect(row?.wasender_session_id).toBe('106487');
    expect(row?.wasender_api_key).not.toBe('session-api-key-abc');
    expect(await decrypt(row?.wasender_api_key as string, env.TOKEN_ENC_KEY)).toBe('session-api-key-abc');
    expect(await decrypt(row?.webhook_secret as string, env.TOKEN_ENC_KEY)).toBe('webhook-secret-xyz');

    // The registered webhook URL has to carry this session's own token.
    expect(sentBody.webhook_url).toBe(`${env.PUBLIC_URL}/webhook/${row?.webhook_token}`);
    expect(sentBody.webhook_events).toContain('messages.received');
    // messages.upsert is also subscribed, for app-sent messages - see wasender.ts's
    // WEBHOOK_EVENTS comment for why, and inbound.ts for how the resulting echo of our own
    // outbound sends is suppressed.
    expect(sentBody.webhook_events).toContain('messages.upsert');
    // Always subscribed regardless of group_messages_enabled - ignore_groups is what actually
    // gates delivery (see wasender.ts's WEBHOOK_EVENTS comment).
    expect(sentBody.webhook_events).toContain('messages-group.received');
    // A brand new number provisions with groups ignored until the customer opts in via POST
    // /api/sessions/:id/group-messages.
    expect(sentBody.ignore_groups).toBe(true);
  });

  it('rejects a phone number that is not E.164 before calling upstream', async () => {
    await seedPortal();

    // No interceptor registered: any upstream call would fail the test.
    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '00971557801481' }),
    });

    expect(res.status).toBe(400);
    expect(await rows()).toHaveLength(0);
  });

  it('surfaces the session limit error instead of persisting a half-made row', async () => {
    await seedPortal();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(422, {
        success: false,
        error: 'You have reached your WhatsApp session limit. Please upgrade your plan.',
      });

    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });

    expect(res.status).toBe(502);
    expect((await res.json() as { message: string }).message).toMatch(/session limit/i);
    expect(await rows()).toHaveLength(0);
  });

  it('requires a valid app session', async () => {
    await seedPortal();
    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request('https://relay.test/api/sessions', {
        method: 'POST',
        body: '{}',
        headers: { 'X-Edge-Auth': 'test-edge-secret' },
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/sessions/:id/bind', () => {
  const REST_ORIGIN = 'https://member-1.bitrix24.com';

  async function seedSession() {
    await seedPortal();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED });

    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });
    return ((await res.json()) as { session: { id: string } }).session.id;
  }

  it('activates the connector for that line and persists the binding', async () => {
    const id = await seedSession();

    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/imconnector.activate', method: 'POST' })
      .reply(200, { result: true });

    const res = await call(`/api/sessions/${id}/bind`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ lineId: 12 }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { session: { bitrix_line_id: number; connector_active: number } };
    expect(body.session.bitrix_line_id).toBe(12);
    expect(body.session.connector_active).toBe(1);

    const [row] = await rows();
    expect(row?.bitrix_line_id).toBe(12);
    expect(row?.connector_active).toBe(1);
  });

  it('moves the line off any session that previously held it', async () => {
    await seedPortal();
    // Distinct upstream ids: whatsapp_sessions.wasender_session_id is unique, so both sessions
    // provisioning as CREATED.id would collide on insert.
    const CREATED_2 = { ...CREATED, id: 106488, phone_number: '+971557801482' };

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED });
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED_2 });

    const firstRes = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support 1', phoneNumber: '+971557801481' }),
    });
    const first = ((await firstRes.json()) as { session: { id: string } }).session.id;

    const secondRes = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support 2', phoneNumber: '+971557801482' }),
    });
    const second = ((await secondRes.json()) as { session: { id: string } }).session.id;

    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/imconnector.activate', method: 'POST' })
      .reply(200, { result: true })
      .times(2);

    await call(`/api/sessions/${first}/bind`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ lineId: 12 }),
    });
    await call(`/api/sessions/${second}/bind`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ lineId: 12 }),
    });

    const all = await rows();
    const firstRow = all.find((r) => r.id === first);
    const secondRow = all.find((r) => r.id === second);
    expect(firstRow?.bitrix_line_id).toBeNull();
    expect(firstRow?.connector_active).toBe(0);
    expect(secondRow?.bitrix_line_id).toBe(12);
    expect(secondRow?.connector_active).toBe(1);
  });

  it('rejects a missing or invalid lineId before calling upstream', async () => {
    const id = await seedSession();

    const res = await call(`/api/sessions/${id}/bind`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ lineId: 'not-a-number' }),
    });

    expect(res.status).toBe(400);
    expect((await rows())[0]?.bitrix_line_id).toBeNull();
  });

  it('404s for a session that does not belong to this portal', async () => {
    const id = await seedSession();
    await seedPortal('member-2');

    const res = await call(`/api/sessions/${id}/bind`, 'member-2', {
      method: 'POST',
      body: JSON.stringify({ lineId: 12 }),
    });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/sessions/:id/group-messages', () => {
  async function seedSession() {
    await seedPortal();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED });

    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });
    return ((await res.json()) as { session: { id: string } }).session.id;
  }

  it('enables groups: syncs ignore_groups:false upstream and persists the column', async () => {
    const id = await seedSession();

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/whatsapp-sessions/106487',
        method: 'PUT',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: CREATED });

    const res = await call(`/api/sessions/${id}/group-messages`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    });

    expect(res.status).toBe(200);
    expect(sentBody.ignore_groups).toBe(false);
    const body = (await res.json()) as { session: { group_messages_enabled: number } };
    expect(body.session.group_messages_enabled).toBe(1);
    expect((await rows())[0]?.group_messages_enabled).toBe(1);
  });

  it('disables groups: syncs ignore_groups:true upstream', async () => {
    const id = await seedSession();

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/whatsapp-sessions/106487',
        method: 'PUT',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: CREATED });

    const res = await call(`/api/sessions/${id}/group-messages`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ enabled: false }),
    });

    expect(res.status).toBe(200);
    expect(sentBody.ignore_groups).toBe(true);
    expect((await rows())[0]?.group_messages_enabled).toBe(0);
  });

  it('rejects a non-boolean enabled before calling upstream', async () => {
    const id = await seedSession();

    const res = await call(`/api/sessions/${id}/group-messages`, 'member-1', {
      method: 'POST',
      body: JSON.stringify({ enabled: 'yes' }),
    });

    expect(res.status).toBe(400);
  });

  it('404s for a session that does not belong to this portal', async () => {
    const id = await seedSession();
    await seedPortal('member-2');

    const res = await call(`/api/sessions/${id}/group-messages`, 'member-2', {
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    });

    expect(res.status).toBe(404);
  });

  describe('license enforcement (LICENSE_ENFORCE=true)', () => {
    async function seedLicense(portalId: string | undefined, domain: string, groupConversations: boolean) {
      await seedSignedLicense(portalId, {
        portal_domain: domain,
        features: { group_conversations: groupConversations },
      });
    }

    // Never inside beforeAll/afterAll - see inbound.spec.ts's identical helper for why.
    function withEnforcement<T>(fn: () => Promise<T>): Promise<T> {
      (env as { LICENSE_ENFORCE: string }).LICENSE_ENFORCE = 'true';
      return fn().finally(() => {
        (env as { LICENSE_ENFORCE: string }).LICENSE_ENFORCE = 'false';
      });
    }

    it('blocks enabling groups when the plan does not include group_conversations', async () => {
      const id = await seedSession();
      const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
        .bind('member-1')
        .first<{ id: string }>();
      await seedLicense(portal?.id, 'member-1.bitrix24.com', false);

      // No PUT interceptor registered - a call upstream would fail the test.
      const res = await withEnforcement(() =>
        call(`/api/sessions/${id}/group-messages`, 'member-1', {
          method: 'POST',
          body: JSON.stringify({ enabled: true }),
        }),
      );

      expect(res.status).toBe(402);
      expect((await rows())[0]?.group_messages_enabled).toBe(0);
    });

    it('allows enabling groups when the plan includes group_conversations', async () => {
      const id = await seedSession();
      const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
        .bind('member-1')
        .first<{ id: string }>();
      await seedLicense(portal?.id, 'member-1.bitrix24.com', true);

      fetchMock
        .get(WASENDER)
        .intercept({ path: '/api/whatsapp-sessions/106487', method: 'PUT' })
        .reply(200, { success: true, data: CREATED });

      const res = await withEnforcement(() =>
        call(`/api/sessions/${id}/group-messages`, 'member-1', {
          method: 'POST',
          body: JSON.stringify({ enabled: true }),
        }),
      );

      expect(res.status).toBe(200);
      expect((await rows())[0]?.group_messages_enabled).toBe(1);
    });

    it('never blocks disabling groups, even when the plan lacks the feature', async () => {
      const id = await seedSession();
      const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
        .bind('member-1')
        .first<{ id: string }>();
      await seedLicense(portal?.id, 'member-1.bitrix24.com', false);

      fetchMock
        .get(WASENDER)
        .intercept({ path: '/api/whatsapp-sessions/106487', method: 'PUT' })
        .reply(200, { success: true, data: CREATED });

      const res = await withEnforcement(() =>
        call(`/api/sessions/${id}/group-messages`, 'member-1', {
          method: 'POST',
          body: JSON.stringify({ enabled: false }),
        }),
      );

      expect(res.status).toBe(200);
    });
  });
});

describe('session scoping', () => {
  it('will not let one portal address another portal session', async () => {
    await seedPortal('member-1');
    await seedPortal('member-2');

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED });

    const created = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });
    const { session } = (await created.json()) as { session: { id: string } };

    // member-2 knows the id but must not reach it.
    const res = await call(`/api/sessions/${session.id}/status`, 'member-2');
    expect(res.status).toBe(404);
  });
});

describe('QR flow', () => {
  async function seedSession() {
    await seedPortal();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
      .reply(200, { success: true, data: CREATED });

    const res = await call('/api/sessions', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
    });
    return ((await res.json()) as { session: { id: string } }).session.id;
  }

  it('returns the QR that connect already supplied, without a second call', async () => {
    const id = await seedSession();

    // Only /connect is intercepted; falling through to /qrcode would fail the test.
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions/106487/connect', method: 'POST' })
      .reply(200, { success: true, data: { status: 'need_scan', qrCode: '2@abc123' } });

    const res = await call(`/api/sessions/${id}/qr`, 'member-1', { method: 'POST' });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'need_scan', qrCode: '2@abc123' });
    expect((await rows())[0]?.status).toBe('need_scan');
  });

  it('falls back to the qrcode endpoint when connect omits it', async () => {
    const id = await seedSession();
    const origin = fetchMock.get(WASENDER);
    origin
      .intercept({ path: '/api/whatsapp-sessions/106487/connect', method: 'POST' })
      .reply(200, { success: true, data: { status: 'need_scan' } });
    origin
      .intercept({ path: '/api/whatsapp-sessions/106487/qrcode', method: 'GET' })
      .reply(200, { success: true, data: { qrCode: '2@fallback' } });

    const res = await call(`/api/sessions/${id}/qr`, 'member-1', { method: 'POST' });
    expect((await res.json() as { qrCode: string }).qrCode).toBe('2@fallback');
  });

  it('passes a rate limit response through as 429', async () => {
    const id = await seedSession();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions/106487/connect', method: 'POST' })
      .reply(429, { success: false, message: 'Too Many Requests' });

    const res = await call(`/api/sessions/${id}/qr`, 'member-1', { method: 'POST' });

    expect(res.status).toBe(429);
    expect((await res.json() as { retryable: boolean }).retryable).toBe(true);
  });

  it('marks the session expired when Wasender no longer has it', async () => {
    const id = await seedSession();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/whatsapp-sessions/106487/connect', method: 'POST' })
      .reply(404, { success: false, message: 'Session not found' });

    const res = await call(`/api/sessions/${id}/qr`, 'member-1', { method: 'POST' });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'expired', qrCode: null, error: 'SESSION_GONE' });
    const [row] = await rows();
    expect(row?.status).toBe('expired');
    expect(row?.wasender_session_id).toBeNull();
  });

  it('records the status reported by /api/status', async () => {
    const id = await seedSession();
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/status', method: 'GET' })
      .reply(200, { status: 'connected' });

    const res = await call(`/api/sessions/${id}/status`, 'member-1');

    expect(await res.json()).toEqual({ status: 'connected' });
    expect((await rows())[0]?.status).toBe('connected');
  });
});
