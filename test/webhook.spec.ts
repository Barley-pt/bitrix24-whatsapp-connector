import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { issueSession } from '../src/session';
import type { InboundQueueMessage } from '../src/types';
import { applySchema, resetDb } from './helpers';

const WASENDER = 'https://wasender.test';

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

async function apiCall(path: string, memberId: string, init: RequestInit = {}) {
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

async function seedSession(): Promise<{ sessionId: string; webhookToken: string }> {
  await seedPortal();
  fetchMock
    .get(WASENDER)
    .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
    .reply(200, { success: true, data: CREATED });

  const res = await apiCall('/api/sessions', 'member-1', {
    method: 'POST',
    body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
  });
  const sessionId = ((await res.json()) as { session: { id: string } }).session.id;

  const row = await env.DB.prepare('SELECT webhook_token FROM whatsapp_sessions WHERE id = ?')
    .bind(sessionId)
    .first<{ webhook_token: string }>();
  return { sessionId, webhookToken: row!.webhook_token };
}

async function postWebhook(token: string, body: unknown, signature = 'webhook-secret-xyz') {
  const ctx = createExecutionContext();
  const res = await worker.fetch(
    new Request(`https://relay.test/webhook/${token}`, {
      method: 'POST',
      headers: {
        'X-Edge-Auth': 'test-edge-secret',
        'x-webhook-signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }),
    env,
    ctx,
  );
  await waitOnExecutionContext(ctx);
  return res;
}

const messagesReceived = (overrides: Record<string, unknown> = {}) => ({
  event: 'messages.received',
  timestamp: 1700000000,
  data: {
    messages: {
      key: { id: 'wamid-1', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971500000000' },
      messageBody: 'hi',
      ...overrides,
    },
  },
});

const messagesGroupReceived = (overrides: Record<string, unknown> = {}) => ({
  event: 'messages-group.received',
  timestamp: 1700000003,
  data: {
    messages: {
      key: {
        id: 'wamid-group-1',
        fromMe: false,
        remoteJid: '123456789-987654321@g.us',
        cleanedParticipantPn: '+971500000001',
      },
      messageBody: 'hey everyone',
      ...overrides,
    },
  },
});

async function setGroupMessagesEnabled(sessionId: string, enabled: boolean): Promise<void> {
  await env.DB.prepare('UPDATE whatsapp_sessions SET group_messages_enabled = ? WHERE id = ?')
    .bind(enabled ? 1 : 0, sessionId)
    .run();
}

const messagesUpsert = (fromMe: boolean, overrides: Record<string, unknown> = {}) => ({
  event: 'messages.upsert',
  timestamp: 1700000001,
  data: {
    messages: {
      key: { id: 'wamid-app-1', fromMe, remoteJid: '123@lid' },
      messageBody: 'be there in 10',
      ...overrides,
    },
  },
});

/**
 * The shape Wasender actually sends for messages.upsert per the Wasender API docs:
 * `data.messages` is an **array** (messages.received delivers a single object instead).
 */
const messagesUpsertArray = (...messages: Array<Record<string, unknown>>) => ({
  event: 'messages.upsert',
  timestamp: 1700000002,
  data: { messages },
});

// Queue.send() resolves QueueSendResponse, not void - a bare mockResolvedValue(undefined) fails
// typecheck even though vitest itself doesn't type-check mocks at runtime.
const FAKE_QUEUE_SEND_RESPONSE: QueueSendResponse = {
  metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
};

beforeAll(async () => {
  await applySchema();
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

beforeEach(resetDb);
afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
  vi.restoreAllMocks();
});

describe('POST /webhook/:token', () => {
  it('enqueues a messages.received event with a valid signature', async () => {
    const { sessionId, webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesReceived());

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [sent] = sendSpy.mock.calls[0] as [InboundQueueMessage];
    expect(sent.sessionId).toBe(sessionId);
    expect(sent.timestamp).toBe(1700000000);
    expect(sent.bindWaitCount).toBe(0);
    expect(sent.message.key.id).toBe('wamid-1');
    expect(sent.appSent).toBe(false);
  });

  it('rejects a wrong signature', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesReceived(), 'wrong-secret');

    expect(res.status).toBe(401);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('rejects a missing signature header', async () => {
    const { webhookToken } = await seedSession();
    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request(`https://relay.test/webhook/${webhookToken}`, {
        method: 'POST',
        headers: { 'X-Edge-Auth': 'test-edge-secret', 'Content-Type': 'application/json' },
        body: JSON.stringify(messagesReceived()),
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(401);
  });

  it('rejects a delivery with no X-Edge-Auth header, valid signature or not', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request(`https://relay.test/webhook/${webhookToken}`, {
        method: 'POST',
        headers: { 'x-webhook-signature': 'webhook-secret-xyz', 'Content-Type': 'application/json' },
        body: JSON.stringify(messagesReceived()),
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(403);
    expect(await res.json()).toStrictEqual({ error: 'FORBIDDEN' });
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('rejects a delivery whose X-Edge-Auth value is wrong', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const ctx = createExecutionContext();
    const res = await worker.fetch(
      new Request(`https://relay.test/webhook/${webhookToken}`, {
        method: 'POST',
        headers: {
          'X-Edge-Auth': 'not-the-edge-secret',
          'x-webhook-signature': 'webhook-secret-xyz',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagesReceived()),
      }),
      env,
      ctx,
    );
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(403);
    expect(await res.json()).toStrictEqual({ error: 'FORBIDDEN' });
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('rate limits a session past WEBHOOK_RATE_LIMIT_PER_MIN deliveries in one minute', async () => {
    const { sessionId, webhookToken } = await seedSession();
    vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    // Charge the current minute bucket to one below the limit directly rather than posting 239
    // times - the same row and the same counter the handler's upsert increments, minus the round
    // trips (and minus the risk of a slow loop straddling a minute boundary). The two deliveries
    // below are then the 240th, the last allowed one, and the 241st, the first one over.
    await env.DB.prepare('INSERT INTO webhook_rate (session_id, bucket_min, count) VALUES (?, ?, ?)')
      .bind(sessionId, Math.floor(Date.now() / 60000), 239)
      .run();

    expect((await postWebhook(webhookToken, messagesReceived())).status).toBe(200);

    const res = await postWebhook(webhookToken, messagesReceived());

    expect(res.status).toBe(429);
    expect(await res.json()).toStrictEqual({ error: 'RATE_LIMITED' });
  });

  it('lets a delivery through once the minute bucket rolls over', async () => {
    const { sessionId, webhookToken } = await seedSession();
    vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    // A full bucket for the *previous* minute must not count against this one.
    await env.DB.prepare('INSERT INTO webhook_rate (session_id, bucket_min, count) VALUES (?, ?, ?)')
      .bind(sessionId, Math.floor(Date.now() / 60000) - 1, 5000)
      .run();

    const res = await postWebhook(webhookToken, messagesReceived());

    expect(res.status).toBe(200);
  });

  it('404s for an unknown token', async () => {
    const res = await postWebhook('does-not-exist', messagesReceived());
    expect(res.status).toBe(404);
  });

  it('ignores a non-message event without enqueueing', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, { event: 'session.status', data: {} });

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('enqueues a fromMe: true messages.upsert delivery flagged as app-sent', async () => {
    const { sessionId, webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesUpsert(true));

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [sent] = sendSpy.mock.calls[0] as [InboundQueueMessage];
    expect(sent.sessionId).toBe(sessionId);
    expect(sent.appSent).toBe(true);
    expect(sent.message.key.id).toBe('wamid-app-1');
  });

  it('drops a fromMe: false messages.upsert delivery - messages.received already covers it', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesUpsert(false));

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('still enforces signature auth on a messages.upsert delivery', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesUpsert(true), 'wrong-secret');

    expect(res.status).toBe(401);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('enqueues the array-shaped messages.upsert payload (the live shape), one queue message per entry', async () => {
    const { sessionId, webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(
      webhookToken,
      messagesUpsertArray(
        { key: { id: 'wamid-app-a', fromMe: true, remoteJid: '123@lid' }, messageBody: 'first' },
        { key: { id: 'wamid-app-b', fromMe: true, remoteJid: '456@lid' }, messageBody: 'second' },
      ),
    );

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(2);
    const [first, second] = sendSpy.mock.calls.map(([m]) => m as InboundQueueMessage) as [
      InboundQueueMessage,
      InboundQueueMessage,
    ];
    expect(first.message.key.id).toBe('wamid-app-a');
    expect(first.appSent).toBe(true);
    expect(first.sessionId).toBe(sessionId);
    expect(second.message.key.id).toBe('wamid-app-b');
    expect(second.appSent).toBe(true);
  });

  it('enqueues only the fromMe entries of a mixed array-shaped messages.upsert delivery', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(
      webhookToken,
      messagesUpsertArray(
        { key: { id: 'wamid-in', fromMe: false, remoteJid: '123@lid' }, messageBody: 'customer says hi' },
        { key: { id: 'wamid-app-c', fromMe: true, remoteJid: '123@lid' }, messageBody: 'typed on phone' },
      ),
    );

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [sent] = sendSpy.mock.calls[0] as [InboundQueueMessage];
    expect(sent.message.key.id).toBe('wamid-app-c');
    expect(sent.appSent).toBe(true);
  });

  it('drops an all-incoming array-shaped messages.upsert delivery', async () => {
    const { webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(
      webhookToken,
      messagesUpsertArray({ key: { id: 'wamid-in', fromMe: false, remoteJid: '123@lid' }, messageBody: 'hi' }),
    );

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('enqueues a messages-group.received delivery by default (groups are on for a new number)', async () => {
    const { sessionId, webhookToken } = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    // Nothing flips the column here: a session provisioned just now carries the default of 1.
    const res = await postWebhook(webhookToken, messagesGroupReceived());

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [sent] = sendSpy.mock.calls[0] as [InboundQueueMessage];
    expect(sent.sessionId).toBe(sessionId);
    expect(sent.message.key.remoteJid).toBe('123456789-987654321@g.us');
  });

  it('drops a messages-group.received delivery once the number has been opted out', async () => {
    const { sessionId, webhookToken } = await seedSession();
    await setGroupMessagesEnabled(sessionId, false);
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesGroupReceived());

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('enqueues a messages-group.received delivery once the session has group messages enabled', async () => {
    const { sessionId, webhookToken } = await seedSession();
    await setGroupMessagesEnabled(sessionId, true);
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(webhookToken, messagesGroupReceived());

    expect(res.status).toBe(200);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [sent] = sendSpy.mock.calls[0] as [InboundQueueMessage];
    expect(sent.sessionId).toBe(sessionId);
    expect(sent.appSent).toBe(false);
    expect(sent.message.key.id).toBe('wamid-group-1');
    expect(sent.message.key.remoteJid).toBe('123456789-987654321@g.us');
  });

  it('drops a fromMe:true group upsert too when group messages are disabled (defense in depth)', async () => {
    const { sessionId, webhookToken } = await seedSession();
    // The default is on - the opt-out has to be explicit for this drop to be the behavior under test.
    await setGroupMessagesEnabled(sessionId, false);
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const res = await postWebhook(
      webhookToken,
      messagesUpsert(true, {
        key: { id: 'wamid-app-group-1', fromMe: true, remoteJid: '123456789-987654321@g.us' },
      }),
    );

    expect(res.status).toBe(200);
    expect(sendSpy).not.toHaveBeenCalled();
  });
});
