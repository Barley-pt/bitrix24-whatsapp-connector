import {
  createExecutionContext,
  createMessageBatch,
  env,
  fetchMock,
  getQueueResult,
  waitOnExecutionContext,
} from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { canonicalChatId, describeQuotedMessage, phoneFromJid, replyContext } from '../src/inbound';
import { issueSession } from '../src/session';
import type { InboundQueueMessage, LicenseEnvelope } from '../src/types';
import { applySchema, installFakeR2, resetDb, seedSignedLicense } from './helpers';

const WASENDER = 'https://wasender.test';
const BITRIX = 'https://member-1.bitrix24.com';

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

async function seedSession(): Promise<string> {
  await seedPortal();
  fetchMock
    .get(WASENDER)
    .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
    .reply(200, { success: true, data: CREATED });

  const res = await apiCall('/api/sessions', 'member-1', {
    method: 'POST',
    body: JSON.stringify({ name: 'Acme Support', phoneNumber: '+971557801481' }),
  });
  return ((await res.json()) as { session: { id: string } }).session.id;
}

async function bindToLine(sessionId: string, lineId: number): Promise<void> {
  fetchMock
    .get(BITRIX)
    .intercept({ path: '/rest/imconnector.activate', method: 'POST' })
    .reply(200, { result: true });

  const res = await apiCall(`/api/sessions/${sessionId}/bind`, 'member-1', {
    method: 'POST',
    body: JSON.stringify({ lineId }),
  });
  expect(res.status).toBe(200);
}

const messageLogRow = (sessionId: string, waMessageId: string) =>
  env.DB
    .prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND direction = 'inbound' AND wa_message_id = ?",
    )
    .bind(sessionId, waMessageId)
    .first<{ id: string; status: string; error: string | null }>();

// bitrix_chat_id has INTEGER affinity (schema.sql), so a numeric-looking string written to it
// reads back as a JS number, not the string CHAT_ID Bitrix's JSON response actually returns.
const chatMapRow = (sessionId: string, waJid: string) =>
  env.DB.prepare('SELECT * FROM chat_map WHERE session_id = ? AND wa_jid = ?')
    .bind(sessionId, waJid)
    .first<{
      bitrix_chat_id: number;
      wa_phone: string;
      wa_name: string | null;
      chat_id: string | null;
      wa_picture: string | null;
      chat_named: number;
    }>();

function inboundMessage(sessionId: string, overrides: Partial<InboundQueueMessage> = {}): InboundQueueMessage {
  return {
    sessionId,
    firstAttemptAt: Date.now(),
    bindWaitCount: 0,
    timestamp: 1700000000,
    appSent: false,
    message: {
      key: { id: 'wamid-1', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971500000000' },
      messageBody: 'hello there',
    },
    ...overrides,
  };
}

function groupInboundMessage(sessionId: string, overrides: Partial<InboundQueueMessage> = {}): InboundQueueMessage {
  return {
    sessionId,
    firstAttemptAt: Date.now(),
    bindWaitCount: 0,
    timestamp: 1700000010,
    appSent: false,
    message: {
      key: {
        id: 'wamid-group-1',
        fromMe: false,
        remoteJid: '123456789-987654321@g.us',
        cleanedParticipantPn: '+971500000001',
      },
      messageBody: 'hey everyone',
    },
    ...overrides,
  };
}

function appSentMessage(sessionId: string, overrides: Partial<InboundQueueMessage> = {}): InboundQueueMessage {
  return {
    sessionId,
    firstAttemptAt: Date.now(),
    bindWaitCount: 0,
    timestamp: 1700000002,
    appSent: true,
    message: {
      key: { id: 'wamid-app-1', fromMe: true, remoteJid: '123@lid' },
      messageBody: 'be there in 10',
    },
    ...overrides,
  };
}

async function seedChatMap(sessionId: string, waJid: string, waPhone: string, waName?: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, bitrix_chat_id, wa_name, last_message_at)
     VALUES (?, ?, ?, ?, 1767, ?, 1700000000)`,
  )
    .bind(crypto.randomUUID(), sessionId, waJid, waPhone, waName ?? null)
    .run();
}

/**
 * Seeds a 'sent' outbound message_log row the way outbound.ts itself would leave one, so
 * detectOutboundEcho (inbound.ts) has something to match a fromMe upsert against. created_at
 * uses the real clock, not the fixed epoch the rest of this file uses for message content,
 * because the echo match window is relative to nowSec().
 */
async function seedOutboundSent(
  sessionId: string,
  overrides: Partial<{ waJid: string; waPhone: string; text: string; createdAt: number }> = {},
): Promise<void> {
  const {
    waJid = '123@lid',
    waPhone = '+971500000000',
    text = 'be there in 10',
    createdAt = Math.floor(Date.now() / 1000),
  } = overrides;
  await env.DB.prepare(
    `INSERT INTO message_log
       (id, session_id, direction, wa_message_id, status, echo_jid, echo_phone, echo_text, created_at)
     VALUES (?, ?, 'outbound', '555111', 'sent', ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), sessionId, waJid, waPhone, text, createdAt)
    .run();
}

function batchOf(queue: string, bodies: InboundQueueMessage[]) {
  return createMessageBatch<InboundQueueMessage>(
    queue,
    bodies.map((body, i) => ({
      id: `msg-${i}`,
      timestamp: new Date(),
      attempts: 1,
      body,
    })),
  );
}

async function runQueue(batch: ReturnType<typeof batchOf>) {
  const ctx = createExecutionContext();
  await worker.queue(batch, env, ctx);
  return getQueueResult(batch, ctx);
}

// Return shape for a mocked env.INBOUND_QUEUE.send() - Queue.send() resolves QueueSendResponse,
// not void, so a bare `mockResolvedValue(undefined)` fails typecheck even though vitest itself
// doesn't type-check mocks at runtime.
const FAKE_QUEUE_SEND_RESPONSE: QueueSendResponse = {
  metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
};

const sendMessagesOk = (chatId = '1767') => ({
  result: {
    SUCCESS: true,
    DATA: {
      RESULT: [{ SUCCESS: true, session: { ID: '323', CHAT_ID: chatId } }],
    },
  },
});

beforeAll(async () => {
  await applySchema();
  // media.ts's staging bucket is not a real binding in tests (vitest.config.ts, R2 + isolated
  // storage); the in-memory stand-in has to be in place before any message is processed.
  installFakeR2(env);
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

beforeEach(resetDb);
afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
  vi.restoreAllMocks();
});

describe('processInboundMessage: session not yet bound to a Line', () => {
  it('re-enqueues itself instead of retrying via the queue', async () => {
    const sessionId = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const batch = batchOf('bwac-inbound', [inboundMessage(sessionId)]);
    const result = await runQueue(batch);

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(result.retryMessages).toStrictEqual([]);
    expect(sendSpy).toHaveBeenCalledTimes(1);
    const [requeued] = sendSpy.mock.calls[0] as [InboundQueueMessage, { delaySeconds: number }];
    expect(requeued.bindWaitCount).toBe(1);
    expect(requeued.sessionId).toBe(sessionId);

    expect(await messageLogRow(sessionId, 'wamid-1')).toBeNull();
  });

  it('gives up after 24h and marks message_log failed instead of re-enqueueing again', async () => {
    const sessionId = await seedSession();
    const sendSpy = vi.spyOn(env.INBOUND_QUEUE, 'send').mockResolvedValue(FAKE_QUEUE_SEND_RESPONSE);

    const stale = inboundMessage(sessionId, { firstAttemptAt: Date.now() - 25 * 60 * 60 * 1000 });
    const result = await runQueue(batchOf('bwac-inbound', [stale]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(sendSpy).not.toHaveBeenCalled();

    const row = await messageLogRow(sessionId, 'wamid-1');
    expect(row?.status).toBe('failed');
    expect(row?.error).toBe('NO_LINE_BOUND_TIMEOUT');
  });
});

describe('processInboundMessage: bound session, happy path', () => {
  it('sends to Bitrix, records the chat mapping, and marks message_log sent', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1767'));

    const result = await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(sentBody.CONNECTOR).toBe('whatsapp_connector');
    expect(sentBody.LINE).toBe(12);
    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({
      id: '+971500000000',
      phone: '+971500000000',
      // No contact-lookup mock here, so the lookup fails and the phone fallback applies.
      name: '+971500000000',
    });
    // A brand-new contact gets canonicalChatId(phone), not the raw remoteJid (a LID here): the
    // chat must be addressable by the same id whichever jid the contact writes from next, and it
    // matches what crm.ts's click-to-chat creates. Digits only even though cleanedSenderPn had '+'.
    expect(message.chat).toStrictEqual({ id: '971500000000@s.whatsapp.net' });
    expect((message.message as Record<string, unknown>).text).toBe('hello there');
    expect((message.message as Record<string, unknown>).date).toBe(1700000000);

    const log = await messageLogRow(sessionId, 'wamid-1');
    expect(log?.status).toBe('sent');

    const chat = await chatMapRow(sessionId, '123@lid');
    expect(chat?.bitrix_chat_id).toBe(1767);
    expect(chat?.wa_phone).toBe('+971500000000');
    expect(chat?.chat_id).toBe('971500000000@s.whatsapp.net');
  });

  it("resolves the contact's WhatsApp name via Wasender, sends it as user.name, and caches it in chat_map", async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/contacts/%2B971500000000', method: 'GET' })
      .reply(200, { success: true, data: { name: null, notify: 'Jane Doe', verifiedName: null } });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1767'));

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({ id: '+971500000000', phone: '+971500000000', name: 'Jane Doe' });

    const chat = await chatMapRow(sessionId, '123@lid');
    expect(chat?.wa_name).toBe('Jane Doe');
  });

  it('reuses the cached chat_map name on the next message without calling Wasender again', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000', 'Jane Doe');

    // No /api/contacts interceptor registered - a second lookup would hit disableNetConnect().
    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1767'));

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({ id: '+971500000000', phone: '+971500000000', name: 'Jane Doe' });
  });

  // Falling back to the phone number rather than to nothing: with no user.name Bitrix invents
  // "Guest", and the CRM tracker propagates it into the contact and the deal it creates. Confirmed
  // live on example 2026-08-12 - contact 902 "Guest", deal 976 "Guest - Whatsapp".
  it('falls back to the phone number as user.name when the Wasender contact lookup fails', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/contacts/%2B971500000000', method: 'GET' })
      .reply(404, { success: false, message: 'not found' });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1767'));

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({
      id: '+971500000000',
      phone: '+971500000000',
      // Normalised, not blindly prefixed - cleanedSenderPn may already carry the '+'.
      name: '+971500000000',
    });

    // The fallback is deliberately NOT cached - only a real name is. Caching it would pin the
    // contact to its phone number forever and stop a genuine name landing on a later message.
    const chat = await chatMapRow(sessionId, '123@lid');
    expect(chat?.wa_name).toBeNull();
  });

  it('decrypts media and re-hosts it in R2 before handing Bitrix the files[] url', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    let decryptBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/decrypt-media',
        method: 'POST',
        body: (raw) => {
          decryptBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, publicUrl: 'https://www.wasenderapi.com/api/decrypted-media/wamid-2' });
    // The temp URL is fetched once, right after decryption - that fetch IS the re-hosting step.
    fetchMock
      .get('https://www.wasenderapi.com')
      .intercept({ path: '/api/decrypted-media/wamid-2', method: 'GET' })
      .reply(200, 'JPEG-BYTES-ON-R2', { headers: { 'content-type': 'image/jpeg' } });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    const media = inboundMessage(sessionId, {
      message: {
        key: { id: 'wamid-2', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971500000000' },
        message: { imageMessage: { mimetype: 'image/jpeg', mediaKey: 'key-abc', url: 'enc://x' } },
      },
    });

    await runQueue(batchOf('bwac-inbound', [media]));

    expect((decryptBody as { data?: { messages?: { key?: { id?: string } } } }).data?.messages?.key?.id).toBe(
      'wamid-2',
    );
    const [message] = sentBody.MESSAGES as [{ message: { files: Array<{ url: string; name: string }> } }];
    // Wasender's temp URL never reaches Bitrix - the file points at this Worker instead.
    const [file] = message.message.files;
    expect(file?.name).toBe('image.jpeg');
    expect(file?.url).toMatch(/^https:\/\/relay\.test\/media\/inbound\/[0-9a-f]{8}-[0-9a-f-]{27}$/);

    // ...and that URL really serves the staged bytes with the metadata written at PUT time.
    const ctx = createExecutionContext();
    const served = await worker.fetch(new Request(file!.url), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(served.status).toBe(200);
    expect(served.headers.get('content-type')).toBe('image/jpeg');
    expect(served.headers.get('content-disposition')).toContain('filename="image.jpeg"');
    expect(await served.text()).toBe('JPEG-BYTES-ON-R2');
  });

  it('finds media nested in a view-once envelope, and uses its caption as the text', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypt-media', method: 'POST' })
      .reply(200, { success: true, publicUrl: 'https://www.wasenderapi.com/api/decrypted-media/wamid-3' });
    // Deliberately NO interceptor for www.wasenderapi.com: disableNetConnect turns the re-host
    // fetch into a failure, which is exactly the fallback case - stageInboundMedia returns null and
    // buildFiles hands Bitrix the temp URL rather than dropping the attachment (asserted below).

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    // A view-once photo (a disappearing-messages chat nests the same way under
    // ephemeralMessage). A flat `imageMessage in message` check finds nothing here, which
    // delivered the message to Bitrix with no attachment at all.
    await runQueue(
      batchOf('bwac-inbound', [
        inboundMessage(sessionId, {
          message: {
            key: { id: 'wamid-3', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971500000000' },
            message: {
              viewOnceMessageV2: {
                message: {
                  imageMessage: { mimetype: 'image/jpeg', caption: 'the invoice', mediaKey: 'k' },
                },
              },
            },
          },
        }),
      ]),
    );

    const [message] = sentBody.MESSAGES as [
      { message: { text: string; files: Array<{ url: string; name: string }> } },
    ];
    // The fallback path: staging failed above, so Bitrix gets Wasender's own URL. Short-lived, but
    // an attachment beats a dropped one.
    expect(message.message.files).toStrictEqual([
      { url: 'https://www.wasenderapi.com/api/decrypted-media/wamid-3', name: 'image.jpeg' },
    ]);
    // A photo's comment rides on the media envelope, not on messageBody - without this the
    // operator sees the image with nothing written on it.
    expect(message.message.text).toBe('the invoice');
  });

  it('names a voice note by what it is', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypt-media', method: 'POST' })
      .reply(200, { success: true, publicUrl: 'https://www.wasenderapi.com/api/decrypted-media/wamid-4' });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    await runQueue(
      batchOf('bwac-inbound', [
        inboundMessage(sessionId, {
          message: {
            key: { id: 'wamid-4', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971500000000' },
            message: { audioMessage: { mimetype: 'audio/ogg; codecs=opus', ptt: true, mediaKey: 'k' } },
          },
        }),
      ]),
    );

    const [message] = sentBody.MESSAGES as [{ message: { files: Array<{ name: string }> } }];
    // The extension is what lets Bitrix's viewer play it inline instead of offering a download.
    expect(message.message.files[0]?.name).toBe('voice.ogg');
  });

  it('is idempotent under duplicate delivery of the same message', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    // Only one interceptor: a second imconnector.send.messages call would fail the test.
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, sendMessagesOk());

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));
    const result = await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const rows = await env.DB.prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND wa_message_id = 'wamid-1'",
    )
      .bind(sessionId)
      .all();
    expect(rows.results).toHaveLength(1);
  });

  it('retries via the queue on a genuine Bitrix failure, leaving message_log pending', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, { error: 'NOT_ACTIVE_LINE', error_description: 'inactive' });

    const result = await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    expect(result.retryMessages).toStrictEqual([{ msgId: 'msg-0' }]);
    expect(result.explicitAcks).toStrictEqual([]);

    const log = await messageLogRow(sessionId, 'wamid-1');
    expect(log?.status).toBe('pending');
  });
});

describe('processInboundMessage: group message routing', () => {
  it('addresses a group as a single Bitrix user keyed by the group JID, named via getGroupMetadata', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/groups/123456789-987654321%40g.us/metadata', method: 'GET' })
      .reply(200, { success: true, data: { jid: '123456789-987654321@g.us', subject: 'Sales Team' } });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1768'));

    const result = await runQueue(batchOf('bwac-inbound', [groupInboundMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    // Never the participant's own phone (+971500000001) - the group JID is the identity, so
    // every member's message threads into the same chat regardless of who sent it.
    expect(message.user).toStrictEqual({
      id: '123456789-987654321@g.us',
      phone: '123456789-987654321@g.us',
      name: 'Sales Team',
      // The group JID isn't a real phone number - without this, Bitrix's default phone
      // validation rejects the message with a bare per-entry SUCCESS: false.
      skip_phone_validate: 'Y',
    });
    expect(message.chat).toStrictEqual({ id: '123456789-987654321@g.us' });

    const chat = await chatMapRow(sessionId, '123456789-987654321@g.us');
    expect(chat?.wa_phone).toBe('123456789-987654321@g.us');
    expect(chat?.wa_name).toBe('Sales Team');
  });

  it('labels a group generically when the group metadata lookup fails', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/groups/123456789-987654321%40g.us/metadata', method: 'GET' })
      .reply(404, { success: false, message: 'not found' });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk('1768'));

    await runQueue(batchOf('bwac-inbound', [groupInboundMessage(sessionId)]));

    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    // A group's waPhone is its JID, not a number worth showing anyone - hence a generic label
    // rather than the phone fallback a one-to-one chat gets.
    expect(message.user).toStrictEqual({
      id: '123456789-987654321@g.us',
      phone: '123456789-987654321@g.us',
      name: 'WhatsApp group',
      skip_phone_validate: 'Y',
    });
  });
});

/**
 * Registers `times` one-shot imconnector.send.messages interceptors and collects each request's
 * single MESSAGES[0] entry, in call order. Captured in the reply callback, not a `body` matcher:
 * undici evaluates body matchers once per candidate interceptor, so with several registered a
 * matcher fires more often than requests are actually made.
 */
function captureSendMessages(times: number): Array<Record<string, unknown>> {
  const sent: Array<Record<string, unknown>> = [];
  for (let i = 0; i < times; i++) {
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, (opts) => {
        sent.push((JSON.parse(opts.body as string).MESSAGES as Array<Record<string, unknown>>)[0]!);
        return sendMessagesOk('1767');
      });
  }
  return sent;
}

const chatMapRowsForPhone = (sessionId: string) =>
  env.DB.prepare('SELECT wa_jid, chat_id, wa_phone FROM chat_map WHERE session_id = ?')
    .bind(sessionId)
    .all<{ wa_jid: string; chat_id: string | null; wa_phone: string }>()
    .then((r) => r.results);

// WhatsApp addresses one contact under two jids over time - the phone jid and the privacy LID - and
// can switch mid-conversation. Passing the raw remoteJid as chat.id made Bitrix open a second chat
// on the switch (line 2: chats 5398 + 5400 for 5511999999999; line 3: 160777 + 160779
// for 971500000000, three minutes apart) and the operator's open chat went silent.
describe('processInboundMessage: one Bitrix chat per contact across jid changes', () => {
  it('posts a phone-jid message and a later LID-jid message for the same phone under the SAME chat.id', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const sent = captureSendMessages(2);

    await runQueue(
      batchOf('bwac-inbound', [
        inboundMessage(sessionId, {
          message: {
            key: {
              id: 'wamid-phone',
              fromMe: false,
              remoteJid: '971500000000@s.whatsapp.net',
              cleanedSenderPn: '971500000000',
            },
            messageBody: 'first, from the phone jid',
          },
        }),
      ]),
    );
    await runQueue(
      batchOf('bwac-inbound', [
        inboundMessage(sessionId, {
          message: {
            key: { id: 'wamid-lid', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '971500000000' },
            messageBody: 'second, from the LID',
          },
        }),
      ]),
    );

    expect(sent).toHaveLength(2);
    expect(sent[0]!.chat).toStrictEqual({ id: '971500000000@s.whatsapp.net' });
    expect(sent[1]!.chat).toStrictEqual(sent[0]!.chat);
    expect((await messageLogRow(sessionId, 'wamid-lid'))?.status).toBe('sent');

    // One row for the contact: wa_jid follows the latest jid, chat_id never moves.
    expect(await chatMapRowsForPhone(sessionId)).toStrictEqual([
      { wa_jid: '123@lid', chat_id: '971500000000@s.whatsapp.net', wa_phone: '971500000000' },
    ]);
  });

  it('keeps posting a legacy LID-created chat under its LID after the contact switches to the phone jid', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    // A row written before chat_map.chat_id existed: chat_id NULL, wa_jid is what Bitrix knows.
    await seedChatMap(sessionId, '123@lid', '+971500000000', 'Jane Doe');
    const sent = captureSendMessages(1);

    await runQueue(
      batchOf('bwac-inbound', [
        inboundMessage(sessionId, {
          message: {
            key: {
              id: 'wamid-2',
              fromMe: false,
              remoteJid: '971500000000@s.whatsapp.net',
              cleanedSenderPn: '+971500000000',
            },
            messageBody: 'now from the phone jid',
          },
        }),
      ]),
    );

    expect(sent[0]!.chat).toStrictEqual({ id: '123@lid' });
    // chat_id is backfilled from the old wa_jid before wa_jid moves on, so the next message still
    // finds the original chat.
    expect(await chatMapRowsForPhone(sessionId)).toStrictEqual([
      { wa_jid: '971500000000@s.whatsapp.net', chat_id: '123@lid', wa_phone: '+971500000000' },
    ]);
  });

  it('keeps a group on its own jid as chat.id', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/groups/123456789-987654321%40g.us/metadata', method: 'GET' })
      .reply(404, { success: false });
    const sent = captureSendMessages(1);

    await runQueue(batchOf('bwac-inbound', [groupInboundMessage(sessionId)]));

    expect(sent[0]!.chat).toStrictEqual({ id: '123456789-987654321@g.us' });
  });

  it('canonicalChatId is digits-only @s.whatsapp.net, whatever the phone spelling', () => {
    expect(canonicalChatId('971500000000')).toBe('971500000000@s.whatsapp.net');
    expect(canonicalChatId('+971500000000')).toBe('971500000000@s.whatsapp.net');
    expect(phoneFromJid('5511964253002@s.whatsapp.net')).toBe('5511964253002');
    expect(phoneFromJid('5511964253002:12@s.whatsapp.net')).toBe('5511964253002');
    expect(phoneFromJid('37039881908374@lid')).toBeNull();
  });
});

describe('processInboundMessage: app-sent messages across jid changes', () => {
  it('matches an echo by phone when it arrives under a different jid than the send recorded', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    // The chat lives under the LID; outbound.ts recorded echo_jid = that LID.
    await seedChatMap(sessionId, '123@lid', '+971500000000');
    await seedOutboundSent(sessionId, { waJid: '123@lid', waPhone: '+971500000000' });

    // We send by phone, so Wasender echoes it back under the phone jid - no cleanedSenderPn.
    // No Bitrix interceptor: posting it would hit disableNetConnect and fail the test.
    const result = await runQueue(
      batchOf('bwac-inbound', [
        appSentMessage(sessionId, {
          message: {
            key: { id: 'wamid-echo', fromMe: true, remoteJid: '971500000000@s.whatsapp.net' },
            messageBody: 'be there in 10',
          },
        }),
      ]),
    );

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-echo')
      .first<{ status: string }>();
    expect(log?.status).toBe('echo');
    const outbound = await env.DB.prepare(
      "SELECT echo_message_id FROM message_log WHERE session_id = ? AND direction = 'outbound'",
    )
      .bind(sessionId)
      .first<{ echo_message_id: string }>();
    expect(outbound?.echo_message_id).toBe('wamid-echo');
  });

  it('posts a phone-typed message under an unseen jid into the existing chat instead of failing NO_PHONE_NUMBER', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000', 'Jane Doe');
    const sent = captureSendMessages(1);

    await runQueue(
      batchOf('bwac-inbound', [
        appSentMessage(sessionId, {
          message: {
            key: { id: 'wamid-app-2', fromMe: true, remoteJid: '971500000000@s.whatsapp.net' },
            messageBody: 'typed on the phone',
          },
        }),
      ]),
    );

    expect(sent[0]!.chat).toStrictEqual({ id: '123@lid' });
    expect((sent[0]!.user as Record<string, unknown>).id).toBe('+971500000000');
    const log = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-2')
      .first<{ status: string }>();
    expect(log?.status).toBe('sent');
  });
});

describe('processInboundMessage: chat naming and avatar', () => {
  it('names the chat once via imconnector.chat.name.set and sends the profile picture as user.picture', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/contacts/%2B971500000000', method: 'GET' })
      .reply(200, {
        success: true,
        data: { name: null, notify: 'Jane Doe', verifiedName: null, imgUrl: 'https://pps.whatsapp.net/jane.jpg' },
      });
    const sent = captureSendMessages(2);

    const renames: Array<Record<string, unknown>> = [];
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.chat.name.set', method: 'POST' })
      .reply(200, (opts) => {
        // callMethod adds the OAuth `auth` token to every body - not part of what is under test.
        const { auth: _auth, ...params } = JSON.parse(opts.body as string) as Record<string, unknown>;
        renames.push(params);
        return { result: true };
      });
    // One-shot on purpose (a persisted interceptor would leak into later tests). An unwanted second
    // rename would hit disableNetConnect and be swallowed by the best-effort catch - which logs, so
    // that warning is what proves it never happened.
    const warn = vi.spyOn(console, 'warn');

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));
    // Second message: name and picture come from chat_map (no second Wasender lookup is mocked),
    // and the unchanged name must not be re-sent to Bitrix.
    const second = inboundMessage(sessionId);
    second.message.key.id = 'wamid-2';
    await runQueue(batchOf('bwac-inbound', [second]));

    expect(renames).toStrictEqual([
      {
        CONNECTOR: 'whatsapp_connector',
        LINE: 12,
        CHAT_ID: '971500000000@s.whatsapp.net',
        NAME: 'Jane Doe',
        USER_ID: '+971500000000',
      },
    ]);
    expect(warn.mock.calls.flat().join(' ')).not.toContain('chat.name.set');
    expect(sent[0]!.user).toStrictEqual({
      id: '+971500000000',
      phone: '+971500000000',
      name: 'Jane Doe',
      picture: { url: 'https://pps.whatsapp.net/jane.jpg' },
    });
    expect((sent[1]!.user as Record<string, unknown>).picture).toStrictEqual({
      url: 'https://pps.whatsapp.net/jane.jpg',
    });
    expect((await chatMapRow(sessionId, '123@lid'))?.wa_picture).toBe('https://pps.whatsapp.net/jane.jpg');
  });

  it('titles a pre-existing chat on its next message, then leaves it alone', async () => {
    // A chat that existed before chat_named did: a row with a cached name, chat_named 0, and the
    // chat itself created under the LID jid (chat_id NULL, so it resolves back to wa_jid). Its next
    // message must title it - and record it, so the following one does not call Bitrix again.
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971****0000', 'Jane Doe');
    const renames: Array<Record<string, unknown>> = [];
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.chat.name.set', method: 'POST' })
      .reply(200, (opts) => {
        // callMethod adds the OAuth `auth` token to every body - not part of what is under test.
        const { auth: _auth, ...params } = JSON.parse(opts.body as string) as Record<string, unknown>;
        renames.push(params);
        return { result: true };
      });
    captureSendMessages(1);

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));
    const second = inboundMessage(sessionId);
    second.message.key.id = 'wamid-2';
    await runQueue(batchOf('bwac-inbound', [second]));

    expect(renames).toStrictEqual([
      {
        CONNECTOR: 'whatsapp_connector',
        LINE: 12,
        CHAT_ID: '123@lid',
        NAME: 'Jane Doe',
        USER_ID: '+971****0000',
      },
    ]);
    expect((await chatMapRow(sessionId, '123@lid'))?.chat_named).toBe(1);
  });

  it('does not rename the chat when only the +phone fallback is known, and omits user.picture', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/contacts/%2B971500000000', method: 'GET' })
      .reply(200, { success: true, data: { name: null, notify: null, verifiedName: null, imgUrl: null } });
    const sent = captureSendMessages(1);
    // No chat.name.set interceptor: a call would hit disableNetConnect. The spy proves none was made.
    const warn = vi.spyOn(console, 'warn');

    await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    expect(sent[0]!.user).toStrictEqual({ id: '+971500000000', phone: '+971500000000', name: '+971500000000' });
    expect(warn.mock.calls.flat().join(' ')).not.toContain('chat.name.set');
  });

  it('still delivers the message when imconnector.chat.name.set fails', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/contacts/%2B971500000000', method: 'GET' })
      .reply(200, { success: true, data: { notify: 'Jane Doe' } });
    captureSendMessages(1);
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.chat.name.set', method: 'POST' })
      .reply(400, { error: 'CHAT_RENAMING_FAILED', error_description: 'Chat not found' });

    const result = await runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(result.retryMessages).toStrictEqual([]);
    expect((await messageLogRow(sessionId, 'wamid-1'))?.status).toBe('sent');
    expect((await chatMapRow(sessionId, '123@lid'))?.wa_name).toBe('Jane Doe');
  });
});

describe('bwac-inbound-dlq consumer', () => {
  it('marks message_log failed once Cloudflare gives up retrying', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);

    const result = await runQueue(batchOf('bwac-inbound-dlq', [inboundMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 'wamid-1');
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('DEAD_LETTERED');
  });
});

describe('processInboundMessage: app-sent (messages.upsert, fromMe: true)', () => {
  it('recognizes an echo of a recent outbound send and does not post to Bitrix', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedOutboundSent(sessionId, { text: 'be there in 10' });

    const outboundRow = await env.DB.prepare(
      "SELECT id FROM message_log WHERE session_id = ? AND direction = 'outbound'",
    )
      .bind(sessionId)
      .first<{ id: string }>();

    // No Bitrix interceptor is registered - if the echo weren't recognized, the resulting
    // imconnector.send.messages call would hit disableNetConnect() and fail the test.
    const result = await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);

    const updatedOutbound = await env.DB.prepare('SELECT echo_message_id FROM message_log WHERE id = ?')
      .bind(outboundRow!.id)
      .first<{ echo_message_id: string | null }>();
    expect(updatedOutbound?.echo_message_id).toBe('wamid-app-1');

    const appRow = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-1')
      .first<{ status: string }>();
    expect(appRow?.status).toBe('echo');
  });

  it('recognizes the echo of a captionless image we just sent', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    // What outbound.ts writes for an image sent with no comment: there is no caption, so there is
    // no text to match on either.
    await seedOutboundSent(sessionId, { text: '' });

    // Again no Bitrix interceptor: treating this as a genuine app-sent message would post the
    // operator's own attachment straight back into the Open Line as [SENT FROM MOBILE].
    const result = await runQueue(
      batchOf('bwac-inbound', [
        appSentMessage(sessionId, {
          message: {
            key: { id: 'wamid-app-2', fromMe: true, remoteJid: '123@lid' },
            message: { imageMessage: { mimetype: 'image/jpeg', mediaKey: 'k' } },
          },
        }),
      ]),
    );

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const appRow = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-2')
      .first<{ status: string }>();
    expect(appRow?.status).toBe('echo');
  });

  it('does not treat a captionless image as an echo of an older send', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');
    // Five minutes old: inside the ten-minute text window, well outside the two-minute one that a
    // contentless media match is allowed. A photo taken on the phone later is not our send.
    await seedOutboundSent(sessionId, { text: '', createdAt: Math.floor(Date.now() / 1000) - 300 });

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypt-media', method: 'POST' })
      .reply(200, { success: true, publicUrl: 'https://www.wasenderapi.com/api/decrypted-media/wamid-app-3' });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, sendMessagesOk());

    await runQueue(
      batchOf('bwac-inbound', [
        appSentMessage(sessionId, {
          message: {
            key: { id: 'wamid-app-3', fromMe: true, remoteJid: '123@lid' },
            message: { imageMessage: { mimetype: 'image/jpeg', mediaKey: 'k' } },
          },
        }),
      ]),
    );

    const appRow = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-3')
      .first<{ status: string }>();
    expect(appRow?.status).toBe('sent');
  });

  it('is idempotent on redelivery of an already-matched echo (never posts to Bitrix)', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedOutboundSent(sessionId, { text: 'be there in 10' });

    await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));
    const result = await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const rows = await env.DB.prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND direction = 'app_outbound'",
    )
      .bind(sessionId)
      .all();
    expect(rows.results).toHaveLength(1);
  });

  it('posts a genuine app-sent message to Bitrix with the SENT FROM MOBILE label and disable_crm', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    const result = await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({
      id: '+971500000000',
      phone: '+971500000000',
      // No contact-lookup mock here, so the lookup fails and the phone fallback applies.
      name: '+971500000000',
    });
    expect(message.chat).toStrictEqual({ id: '123@lid' });
    const messageBlock = message.message as Record<string, unknown>;
    expect(messageBlock.text).toBe('[SENT FROM MOBILE] be there in 10');
    expect(messageBlock.disable_crm).toBe('Y');

    const log = await env.DB.prepare(
      "SELECT status FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-1')
      .first<{ status: string }>();
    expect(log?.status).toBe('sent');
  });

  it('includes the cached chat_map name in the SENT FROM MOBILE message.user', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000', 'Jane Doe');

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    const [message] = sentBody.MESSAGES as [Record<string, unknown>];
    expect(message.user).toStrictEqual({ id: '+971500000000', phone: '+971500000000', name: 'Jane Doe' });
  });

  it('is idempotent under duplicate delivery of the same app-sent message', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    // Only one interceptor: a second imconnector.send.messages call would fail the test.
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, sendMessagesOk());

    await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));
    const result = await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const rows = await env.DB.prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND direction = 'app_outbound'",
    )
      .bind(sessionId)
      .all();
    expect(rows.results).toHaveLength(1);
  });

  it('includes media via the same buildFiles path as customer-inbound messages', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypt-media', method: 'POST' })
      .reply(200, {
        success: true,
        publicUrl: 'https://www.wasenderapi.com/api/decrypted-media/wamid-app-2',
      });
    fetchMock
      .get('https://www.wasenderapi.com')
      .intercept({ path: '/api/decrypted-media/wamid-app-2', method: 'GET' })
      .reply(200, 'APP-JPEG-BYTES', { headers: { 'content-type': 'image/jpeg' } });

    let sentBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          sentBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, sendMessagesOk());

    const media = appSentMessage(sessionId, {
      message: {
        key: { id: 'wamid-app-2', fromMe: true, remoteJid: '123@lid' },
        message: { imageMessage: { mimetype: 'image/jpeg', mediaKey: 'key-abc', url: 'enc://x' } },
      },
    });

    await runQueue(batchOf('bwac-inbound', [media]));

    const [message] = sentBody.MESSAGES as [
      { message: { text: string; files: Array<{ url: string; name: string }> } },
    ];
    // No text on the message, so the SENT FROM MOBILE label stands alone.
    expect(message.message.text).toBe('SENT FROM MOBILE');
    // App-sent media goes through the same re-hosting as customer media: Bitrix gets a URL on this
    // Worker, never Wasender's temp one.
    const [file] = message.message.files;
    expect(file?.name).toBe('image.jpeg');
    expect(file?.url).toMatch(/^https:\/\/relay\.test\/media\/inbound\/[0-9a-f]{8}-[0-9a-f-]{27}$/);
  });

  it('terminal-logs NO_PHONE_NUMBER when the contact was never seen inbound (no chat_map entry)', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    // No seedChatMap call and no prior outbound send - nothing to resolve the contact phone from.

    const result = await runQueue(batchOf('bwac-inbound', [appSentMessage(sessionId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await env.DB.prepare(
      "SELECT status, error FROM message_log WHERE session_id = ? AND direction = 'app_outbound' AND wa_message_id = ?",
    )
      .bind(sessionId, 'wamid-app-1')
      .first<{ status: string; error: string | null }>();
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('NO_PHONE_NUMBER');
  });
});

describe('processInboundMessage: reply context (contextInfo)', () => {
  function contextMessage(
    sessionId: string,
    envelope: Record<string, unknown>,
    overrides: Partial<InboundQueueMessage> = {},
  ): InboundQueueMessage {
    return inboundMessage(sessionId, {
      message: {
        key: { id: 'wamid-ctx', fromMe: false, remoteJid: '123@lid', cleanedSenderPn: '+971****0000' },
        messageBody: 'hello there',
        message: envelope,
      },
      ...overrides,
    });
  }

  function captureSend() {
    const captured: Record<string, unknown>[] = [];
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.messages',
        method: 'POST',
        body: (raw) => {
          captured.push(JSON.parse(raw as string));
          return true;
        },
      })
      .reply(200, sendMessagesOk('1767'));
    return captured;
  }

  const sentMessage = (captured: Record<string, unknown>[]) => {
    const messages = captured[0]?.MESSAGES as
      | Array<{ message: { text: string; files: Array<{ url: string; name: string }> } }>
      | undefined;
    const entry = messages?.[0];
    if (!entry) throw new Error('no MESSAGES entry captured from imconnector.send.messages');
    return entry.message;
  };

  it('renders an ad reply: title and body as text, the plaintext thumbnail as an attachment', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const captured = captureSend();

    await runQueue(
      batchOf('bwac-inbound', [
        contextMessage(sessionId, {
          extendedTextMessage: {
            text: 'hello there',
            contextInfo: {
              stanzaId: 'SNE5U4M5OSPWHXHN1WBGV',
              participant: '971500000000@s.whatsapp.net',
              externalAdReply: {
                title: 'Acme Hospital - LASIK package',
                body: 'AED 5,900 all-in. Book today.',
                mediaType: 2,
                thumbnailUrl: 'https://scontent.xx.fbcdn.net/v/ad-thumb.jpg?_nc_cat=1',
              },
            },
          },
        }),
      ]),
    );

    const message = sentMessage(captured);
    expect(message.text).toBe(
      'In reply to ad: Acme Hospital - LASIK package\nAED 5,900 all-in. Book today.\nhello there',
    );
    expect(message.files).toStrictEqual([
      { url: 'https://scontent.xx.fbcdn.net/v/ad-thumb.jpg?_nc_cat=1', name: 'ad-thumbnail.jpg' },
    ]);
    expect((await messageLogRow(sessionId, 'wamid-ctx'))?.status).toBe('sent');
  });

  it('describes a quoted message in one line and does not re-attach its media', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const captured = captureSend();

    await runQueue(
      batchOf('bwac-inbound', [
        contextMessage(sessionId, {
          extendedTextMessage: {
            text: 'hello there',
            contextInfo: {
              stanzaId: 'SNEQUOTE',
              quotedMessage: {
                imageMessage: { mimetype: 'image/jpeg', caption: 'our LASIK catalogue' },
              },
            },
          },
        }),
      ]),
    );

    const message = sentMessage(captured);
    expect(message.text).toBe('Replied to: image "our LASIK catalogue"\nhello there');
    // The quoted image already sits in the chat timeline - re-attaching it would double it.
    expect(message.files).toStrictEqual([]);
  });

  it('finds contextInfo nested one wrapper level down (disappearing-messages chat)', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const captured = captureSend();

    await runQueue(
      batchOf('bwac-inbound', [
        contextMessage(sessionId, {
          ephemeralMessage: {
            message: {
              extendedTextMessage: {
                text: 'hello there',
                contextInfo: { quotedMessage: { conversation: 'price please' } },
              },
            },
          },
        }),
      ]),
    );

    expect(sentMessage(captured).text).toBe('Replied to: text "price please"\nhello there');
  });

  it('falls back to the ad title alone when the creative carries no body or thumbnail', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const captured = captureSend();

    await runQueue(
      batchOf('bwac-inbound', [
        contextMessage(sessionId, {
          extendedTextMessage: {
            text: 'hello there',
            contextInfo: { externalAdReply: { title: 'Ad title only', mediaType: 1 } },
          },
        }),
      ]),
    );

    const message = sentMessage(captured);
    expect(message.text).toBe('In reply to ad: Ad title only\nhello there');
    expect(message.files).toStrictEqual([]);
  });

  it('leaves a message without contextInfo exactly as it was delivered', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const captured = captureSend();

    await runQueue(
      batchOf('bwac-inbound', [
        contextMessage(sessionId, { extendedTextMessage: { text: 'hello there' } }),
      ]),
    );

    expect(sentMessage(captured).text).toBe('hello there');
    expect(sentMessage(captured).files).toStrictEqual([]);
  });
});

describe('replyContext unit behaviour', () => {
  /** The `message` value of an InboundMessage carrying one extended-text envelope. */
  const envelope = (contextInfo: Record<string, unknown>) => ({
    extendedTextMessage: { text: 'hi', contextInfo },
  });

  it('returns null when the message carries no contextInfo', () => {
    expect(replyContext({ key: { id: 'x', fromMe: false, remoteJid: '1@lid' } })).toBeNull();
    expect(
      replyContext({
        key: { id: 'x', fromMe: false, remoteJid: '1@lid' },
        message: { conversation: 'plain text' },
      }),
    ).toBeNull();
  });

  it('ignores a base64 jpegThumbnail - Bitrix cannot fetch a data payload as a file URL', () => {
    const ctx = replyContext({
      key: { id: 'x', fromMe: false, remoteJid: '1@lid' },
      message: envelope({ externalAdReply: { title: 'Ad', jpegThumbnail: '/9j/4AAQ' } }),
    });
    expect(ctx?.text).toBe('In reply to ad: Ad');
    expect(ctx?.file).toBeUndefined();
  });

  it('keeps the extension of a thumbnail whose URL carries none', () => {
    const ctx = replyContext({
      key: { id: 'x', fromMe: false, remoteJid: '1@lid' },
      message: envelope({
        externalAdReply: { title: 'Ad', thumbnailUrl: 'https://cdn.example.com/thumb' },
      }),
    });
    expect(ctx?.file).toStrictEqual({
      url: 'https://cdn.example.com/thumb',
      name: 'ad-thumbnail.jpg',
    });
  });

  it('reports the contextInfo fields it saw, for the shape log', () => {
    const ctx = replyContext({
      key: { id: 'x', fromMe: false, remoteJid: '1@lid' },
      message: envelope({
        stanzaId: 'S1',
        externalAdReply: { title: 'Ad' },
        quotedMessage: { conversation: 'yo' },
      }),
    });
    expect(ctx?.fields.sort()).toStrictEqual(['externalAdReply', 'quotedMessage', 'stanzaId']);
    // Both kinds on one message (the common shape for a reply to an ad) render together.
    expect(ctx?.text).toBe('In reply to ad: Ad\nReplied to: text "yo"');
  });

  it('describes quoted messages of unknown shape by their envelope name instead of dropping them', () => {
    expect(describeQuotedMessage({ contactMessage: { displayName: 'Jane' } })).toBe('text');
    expect(describeQuotedMessage(undefined)).toBeNull();
  });
});

describe('processInboundMessage: license enforcement (LICENSE_ENFORCE=true)', () => {
  async function seedLicense(
    portalId: string | undefined,
    domain: string,
    overrides: Partial<LicenseEnvelope> = {},
  ) {
    await seedSignedLicense(portalId, {
      portal_domain: domain,
      features: { max_conversations_per_month: 1 },
      ...overrides,
    });
  }

  // Session provisioning (seedSession) itself checks the license (api.ts's POST /api/sessions),
  // so all setup below runs with LICENSE_ENFORCE left at its default 'false' and only flips it on
  // right before the inbound message under test, via this helper - never inside beforeAll/afterAll,
  // so a setup step can never be blocked by the very enforcement the test means to exercise.
  function withEnforcement<T>(fn: () => Promise<T>): Promise<T> {
    (env as { LICENSE_ENFORCE: string }).LICENSE_ENFORCE = 'true';
    return fn().finally(() => {
      (env as { LICENSE_ENFORCE: string }).LICENSE_ENFORCE = 'false';
    });
  }

  it('allows the first conversation within the monthly cap', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
      .bind('member-1')
      .first<{ id: string }>();
    await seedLicense(portal?.id, 'member-1.bitrix24.com');

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, sendMessagesOk('1767'));

    const result = await withEnforcement(() => runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)])));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect((await messageLogRow(sessionId, 'wamid-1'))?.status).toBe('sent');

    const usage = await env.DB.prepare(
      'SELECT conversations_initiated FROM usage_counters WHERE portal_id = ?',
    )
      .bind(portal?.id)
      .first<{ conversations_initiated: number }>();
    expect(usage?.conversations_initiated).toBe(1);
  });

  it('blocks a new conversation once the monthly cap is reached, without calling Bitrix', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
      .bind('member-1')
      .first<{ id: string }>();
    await seedLicense(portal?.id, 'member-1.bitrix24.com');
    await env.DB.prepare(
      "INSERT INTO usage_counters (portal_id, period, conversations_initiated) VALUES (?, strftime('%Y-%m', 'now'), 1)",
    )
      .bind(portal?.id)
      .run();

    // No BITRIX interceptor registered - a call to imconnector.send.messages would fail the test.
    const result = await withEnforcement(() => runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)])));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 'wamid-1');
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('LICENSE_CONVERSATION_LIMIT');
    expect(await chatMapRow(sessionId, '123@lid')).toBeNull();
  });

  it('lets an existing conversation continue past the cap', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const portal = await env.DB.prepare('SELECT id FROM portals WHERE member_id = ?')
      .bind('member-1')
      .first<{ id: string }>();
    await seedLicense(portal?.id, 'member-1.bitrix24.com');
    await seedChatMap(sessionId, '123@lid', '+971500000000');
    await env.DB.prepare(
      "INSERT INTO usage_counters (portal_id, period, conversations_initiated) VALUES (?, strftime('%Y-%m', 'now'), 1)",
    )
      .bind(portal?.id)
      .run();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, sendMessagesOk('1767'));

    const result = await withEnforcement(() => runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)])));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect((await messageLogRow(sessionId, 'wamid-1'))?.status).toBe('sent');
  });

  it('blocks a new conversation when the portal is unlicensed', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    // No seedLicense call - the portal has no license row at all.

    const result = await withEnforcement(() => runQueue(batchOf('bwac-inbound', [inboundMessage(sessionId)])));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 'wamid-1');
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('LICENSE_INACTIVE');
  });
});
