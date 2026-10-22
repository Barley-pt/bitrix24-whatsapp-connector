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
import { issueSession } from '../src/session';
import type { OutboundQueueMessage } from '../src/types';
import { applySchema, resetDb } from './helpers';

const WASENDER = 'https://wasender.test';
const BITRIX = 'https://member-1.bitrix24.com';

const CREATED = {
  id: 106487,
  name: 'ACP UAE',
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

async function seedSession(): Promise<{ portalId: string; sessionId: string }> {
  const portal = await seedPortal();
  fetchMock
    .get(WASENDER)
    .intercept({ path: '/api/whatsapp-sessions', method: 'POST' })
    .reply(200, { success: true, data: CREATED });

  const res = await apiCall('/api/sessions', 'member-1', {
    method: 'POST',
    body: JSON.stringify({ name: 'ACP UAE', phoneNumber: '+971557801481' }),
  });
  const sessionId = ((await res.json()) as { session: { id: string } }).session.id;
  return { portalId: portal.id, sessionId };
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

async function seedChatMap(sessionId: string, waJid: string, waPhone: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, bitrix_chat_id, last_message_at)
     VALUES (?, ?, ?, ?, 1767, 1700000000)`,
  )
    .bind(crypto.randomUUID(), sessionId, waJid, waPhone)
    .run();
}

const messageLogRow = (sessionId: string, bitrixMessageId: number) =>
  env.DB
    .prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND direction = 'outbound' AND bitrix_message_id = ?",
    )
    .bind(sessionId, bitrixMessageId)
    .first<{ id: string; status: string; error: string | null; wa_message_id: string | null }>();

function outboundMessage(portalId: string, overrides: Partial<OutboundQueueMessage> = {}): OutboundQueueMessage {
  return {
    portalId,
    lineId: 12,
    waJid: '123@lid',
    bitrixChatId: 1807,
    bitrixMessageId: 86497,
    text: '[b]Klaus Weber:[/b] [br]Guten Tag!',
    ...overrides,
  };
}

function batchOf(queue: string, bodies: OutboundQueueMessage[]) {
  return createMessageBatch<OutboundQueueMessage>(
    queue,
    bodies.map((body, i) => ({ id: `msg-${i}`, timestamp: new Date(), attempts: 1, body })),
  );
}

async function runQueue(batch: ReturnType<typeof batchOf>) {
  const ctx = createExecutionContext();
  await worker.queue(batch, env, ctx);
  return getQueueResult(batch, ctx);
}

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

describe('processOutboundMessage: happy path', () => {
  it('strips BBCode, sends via Wasender, confirms delivery, and logs sent', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    let sendBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/send-message',
        method: 'POST',
        body: (raw) => {
          sendBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: { msgId: 555111, jid: '+971500000000', status: 'in_progress' } });

    let deliveryBody: Record<string, unknown> = {};
    fetchMock
      .get(BITRIX)
      .intercept({
        path: '/rest/imconnector.send.status.delivery',
        method: 'POST',
        body: (raw) => {
          deliveryBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { result: { SUCCESS: true, DATA: [] } });

    const result = await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(sendBody.to).toBe('+971500000000');
    // The literal space between [/b] and [br] in Bitrix's own text survives stripping - only the
    // tags themselves are removed, not surrounding whitespace.
    expect(sendBody.text).toBe('Klaus Weber: \nGuten Tag!');

    expect(deliveryBody.CONNECTOR).toBe('acp_whatsapp');
    expect(deliveryBody.LINE).toBe(12);
    const [msg] = deliveryBody.MESSAGES as [Record<string, unknown>];
    expect(msg.im).toStrictEqual({ chat_id: 1807, message_id: 86497 });
    expect(msg.chat).toStrictEqual({ id: '123@lid' });
    expect((msg.message as Record<string, unknown>).id).toStrictEqual(['555111']);

    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('sent');
    expect(log?.wa_message_id).toBe('555111');

    // Recorded so inbound.ts's detectOutboundEcho can recognize a later messages.upsert echo of
    // this exact send and skip reposting it to Bitrix.
    const echoRow = await env.DB.prepare(
      'SELECT echo_jid, echo_phone, echo_text FROM message_log WHERE id = ?',
    )
      .bind(log!.id)
      .first<{ echo_jid: string; echo_phone: string; echo_text: string }>();
    // normalizeEchoText collapses the [/b]/[br] whitespace run (a space + a newline) to one
    // space - it must match exactly how inbound.ts normalizes the upsert text it compares against.
    expect(echoRow).toStrictEqual({
      echo_jid: '123@lid',
      echo_phone: '+971500000000',
      echo_text: 'Klaus Weber: Guten Tag!',
    });
  });

  // The event's chat.id is the id the chat was created with (chat_map.chat_id). Once the contact
  // writes from their other jid, wa_jid moves on - resolving by wa_jid alone would then fail
  // NO_CHAT_MAP for every operator reply in that chat.
  it('resolves the contact by chat_id after their wa_jid has flipped to another jid', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await env.DB.prepare(
      `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, chat_id, bitrix_chat_id, last_message_at)
       VALUES (?, ?, '971500000000@s.whatsapp.net', '+971500000000', '123@lid', 1767, 1700000000)`,
    )
      .bind(crypto.randomUUID(), sessionId)
      .run();

    let sendBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/send-message',
        method: 'POST',
        body: (raw) => {
          sendBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: { msgId: 555112, jid: '+971500000000', status: 'in_progress' } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.status.delivery', method: 'POST' })
      .reply(200, { result: { SUCCESS: true, DATA: [] } });

    const result = await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId, { waJid: '123@lid' })]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    expect(sendBody.to).toBe('+971500000000');
    expect((await messageLogRow(sessionId, 86497))?.status).toBe('sent');
  });

  it('is idempotent under duplicate delivery of the same Bitrix message', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/send-message', method: 'POST' })
      .reply(200, { success: true, data: { msgId: 555111, jid: '+971500000000', status: 'in_progress' } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.status.delivery', method: 'POST' })
      .reply(200, { result: { SUCCESS: true, DATA: [] } });

    await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId)]));
    const result = await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const rows = await env.DB.prepare(
      "SELECT * FROM message_log WHERE session_id = ? AND direction = 'outbound'",
    )
      .bind(sessionId)
      .all();
    expect(rows.results).toHaveLength(1);
  });
});

describe('processOutboundMessage: attachments', () => {
  const PHOTO = {
    link: '/bitrix/tools/disk/uf.php?attachedId=42&auth=sig',
    name: 'photo.jpg',
    type: 'image',
  };

  /** The one send + one delivery confirmation every attachment case here ends in. */
  function interceptSendAndDelivery(): { body: () => Record<string, unknown> } {
    let sendBody: Record<string, unknown> = {};
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/send-message',
        method: 'POST',
        body: (raw) => {
          sendBody = JSON.parse(raw as string);
          return true;
        },
      })
      .reply(200, { success: true, data: { msgId: 555111, jid: '+971500000000', status: 'in_progress' } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.status.delivery', method: 'POST' })
      .reply(200, { result: { SUCCESS: true, DATA: [] } });
    return { body: () => sendBody };
  }

  it('sends an image through the media proxy, with the reply text as its caption', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    const sent = interceptSendAndDelivery();
    const result = await runQueue(
      batchOf('acpzap-outbound', [outboundMessage(portalId, { files: [PHOTO] })]),
    );

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const body = sent.body();
    expect(body.to).toBe('+971500000000');
    // Wasender fetches this URL itself, so it must be ours and public - never the Bitrix link,
    // which is portal-relative here and would not resolve for anyone outside the portal.
    expect(body.imageUrl).toMatch(/^https:\/\/relay\.test\/media\/[\w-]+\.[\w-]+$/);
    // One captioned bubble rather than a separate text message followed by a bare image.
    expect(body.text).toBe('Klaus Weber: \nGuten Tag!');
    expect(body.fileName).toBeUndefined();

    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('sent');
    expect(log?.wa_message_id).toBe('555111');
  });

  it('sends an unrecognized file type as a document, keeping its name', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    const sent = interceptSendAndDelivery();
    await runQueue(
      batchOf('acpzap-outbound', [
        outboundMessage(portalId, { text: '', files: [{ link: '/x.pdf', name: 'report.pdf' }] }),
      ]),
    );

    const body = sent.body();
    expect(body.documentUrl).toMatch(/^https:\/\/relay\.test\/media\//);
    expect(body.fileName).toBe('report.pdf');
    expect(body.text).toBeUndefined();
    expect(await messageLogRow(sessionId, 86497).then((r) => r?.status)).toBe('sent');
  });

  it('sends the reply text separately when the only attachment is a voice note', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    const bodies: Array<Record<string, unknown>> = [];
    fetchMock
      .get(WASENDER)
      .intercept({
        path: '/api/send-message',
        method: 'POST',
        body: (raw) => {
          bodies.push(JSON.parse(raw as string));
          return true;
        },
      })
      .reply(200, { success: true, data: { msgId: 555111, jid: '+971500000000', status: 'in_progress' } })
      .times(2);
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.status.delivery', method: 'POST' })
      .reply(200, { result: { SUCCESS: true, DATA: [] } });

    await runQueue(
      batchOf('acpzap-outbound', [
        outboundMessage(portalId, { files: [{ link: '/note.ogg', name: 'note.ogg' }] }),
      ]),
    );

    // A WhatsApp voice note has nowhere to put a caption, so the text goes first as its own
    // message rather than being dropped. undici can run a body matcher more than once for the
    // same request, so consecutive identical captures are collapsed rather than counted.
    const sends = bodies.filter(
      (body, i) => i === 0 || JSON.stringify(body) !== JSON.stringify(bodies[i - 1]),
    );
    expect(sends).toHaveLength(2);
    expect(sends[0]).toStrictEqual({ to: '+971500000000', text: 'Klaus Weber: \nGuten Tag!' });
    expect(sends[1]?.audioUrl).toMatch(/^https:\/\/relay\.test\/media\//);
    expect(sends[1]?.text).toBeUndefined();
  });

  it('streams the attachment from Bitrix when Wasender fetches the proxy URL', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    const sent = interceptSendAndDelivery();
    await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId, { files: [PHOTO] })]));
    const proxyUrl = sent.body().imageUrl as string;

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/bitrix/tools/disk/uf.php', query: { attachedId: '42', auth: 'sig' } })
      .reply(200, 'JPEGBYTES', { headers: { 'content-type': 'image/jpeg' } });

    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request(proxyUrl), env, ctx);
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/jpeg');
    // A signed URL is a bearer credential for that one file - nothing in between may keep it.
    expect(res.headers.get('cache-control')).toBe('no-store, private');
    expect(await res.text()).toBe('JPEGBYTES');
  });

  it('refuses a proxy token whose signature does not verify', async () => {
    const ctx = createExecutionContext();
    const res = await worker.fetch(new Request('https://relay.test/media/abc.def'), env, ctx);
    await waitOnExecutionContext(ctx);
    expect(res.status).toBe(404);
  });
});

describe('processOutboundMessage: no chat mapping', () => {
  it('marks message_log failed without attempting to send', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    // No seedChatMap call - this contact was never mapped by an inbound message.

    const result = await runQueue(batchOf('acpzap-outbound', [outboundMessage(portalId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('NO_CHAT_MAP');
  });
});

describe('processOutboundMessage: nothing to send', () => {
  it('records EMPTY_MESSAGE without calling Wasender when the text strips to nothing', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    // No Wasender interceptor is registered on purpose: afterEach's assertNoPendingInterceptors
    // would fail if one were, and disableNetConnect turns any real send attempt into an error. The
    // send must not happen at all - Wasender rejects a request with neither text nor media, and a
    // reply that strips to "" would otherwise burn all five retries on it.
    const result = await runQueue(
      batchOf('acpzap-outbound', [outboundMessage(portalId, { text: '[br]' })]),
    );

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('EMPTY_MESSAGE');
  });
});

describe('processOutboundMessage: rate limiting', () => {
  it('retries with the delay Wasender reports, leaving message_log pending', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/send-message', method: 'POST' })
      .reply(429, { success: false, message: 'Too Many Requests' }, {
        headers: { 'x-ratelimit-limit': '1', 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '42' },
      });

    // getQueueResult().retryMessages doesn't surface delaySeconds in this SDK version, even
    // though the runtime API accepts it (confirmed live via debug logging) - spy on the message's
    // own retry() to check what index.ts actually called it with, instead of the harness summary.
    const batch = batchOf('acpzap-outbound', [outboundMessage(portalId)]);
    const retrySpy = vi.spyOn(batch.messages[0]!, 'retry');
    const ctx = createExecutionContext();
    await worker.queue(batch, env, ctx);
    const result = await getQueueResult(batch, ctx);

    expect(retrySpy).toHaveBeenCalledWith({ delaySeconds: 42 });
    expect(result.explicitAcks).toStrictEqual([]);
    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('pending');
  });

  it('paces the account-protection rejection, which is not a 429 and carries no reset header', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/send-message', method: 'POST' })
      .reply(422, {
        success: false,
        message: 'You have account protection enabled. You can only send 1 message every 5 seconds.',
      });

    const batch = batchOf('acpzap-outbound', [outboundMessage(portalId)]);
    const retrySpy = vi.spyOn(batch.messages[0]!, 'retry');
    const ctx = createExecutionContext();
    await worker.queue(batch, env, ctx);
    await getQueueResult(batch, ctx);

    // Without this, retries fire roughly a second apart and simply trip the same guard again -
    // four of the six attempts on 2026-08-18 21:48 UTC died this way rather than on the real fault.
    expect(retrySpy).toHaveBeenCalledWith({ delaySeconds: 6 });
    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('pending');
  });
});

describe('acpzap-outbound-dlq consumer', () => {
  it('marks message_log failed once Cloudflare gives up retrying', async () => {
    const { portalId, sessionId } = await seedSession();
    await bindToLine(sessionId, 12);
    await seedChatMap(sessionId, '123@lid', '+971500000000');

    const result = await runQueue(batchOf('acpzap-outbound-dlq', [outboundMessage(portalId)]));

    expect(result.explicitAcks).toStrictEqual(['msg-0']);
    const log = await messageLogRow(sessionId, 86497);
    expect(log?.status).toBe('failed');
    expect(log?.error).toBe('DEAD_LETTERED');
  });
});
