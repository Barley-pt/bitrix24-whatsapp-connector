import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { normalizePhoneDigits } from '../src/crm';
import { upsertPortal } from '../src/db';
import worker from '../src/index';
import { parseCrmTabPlacement } from '../src/routes/install';
import { issueSession } from '../src/session';
import { applySchema, resetDb } from './helpers';

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

const chatMapRow = (sessionId: string, wa_phone: string) =>
  env.DB.prepare('SELECT * FROM chat_map WHERE session_id = ? AND wa_phone = ?')
    .bind(sessionId, wa_phone)
    .first<{ bitrix_chat_id: number; wa_jid: string }>();

const conversationsInitiated = (portalId: string) =>
  env.DB.prepare('SELECT conversations_initiated FROM usage_counters WHERE portal_id = ?')
    .bind(portalId)
    .first<{ conversations_initiated: number }>();

beforeAll(async () => {
  await applySchema();
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

beforeEach(resetDb);
afterEach(() => fetchMock.assertNoPendingInterceptors());

describe('normalizePhoneDigits', () => {
  it('strips everything but digits', () => {
    expect(normalizePhoneDigits('+971 55-780 1481')).toBe('971557801481');
    expect(normalizePhoneDigits('(971) 557801481')).toBe('971557801481');
  });
});

describe('parseCrmTabPlacement', () => {
  it('maps each placement to its entity type and reads the entity id', () => {
    expect(parseCrmTabPlacement('CRM_LEAD_DETAIL_TAB', '{"ID":"42"}')).toEqual({
      entityType: 'lead',
      entityId: 42,
    });
    expect(parseCrmTabPlacement('CRM_DEAL_DETAIL_TAB', '{"ID":"7"}')).toEqual({
      entityType: 'deal',
      entityId: 7,
    });
    expect(parseCrmTabPlacement('CRM_CONTACT_DETAIL_TAB', '{"ID":"7"}')?.entityType).toBe('contact');
    expect(parseCrmTabPlacement('CRM_COMPANY_DETAIL_TAB', '{"ID":"7"}')?.entityType).toBe('company');
  });

  it('returns null for an unknown placement or a malformed/missing id', () => {
    expect(parseCrmTabPlacement('CRM_LEAD_LIST_MENU', '{"ID":"42"}')).toBeNull();
    expect(parseCrmTabPlacement('CRM_LEAD_DETAIL_TAB', undefined)).toBeNull();
    expect(parseCrmTabPlacement('CRM_LEAD_DETAIL_TAB', 'not json')).toBeNull();
    expect(parseCrmTabPlacement('CRM_LEAD_DETAIL_TAB', '{"ID":"0"}')).toBeNull();
  });

  it('recognizes a Smart Process placement and carries its entityTypeId', () => {
    expect(parseCrmTabPlacement('CRM_DYNAMIC_1036_DETAIL_TAB', '{"ID":"55"}')).toEqual({
      entityType: 'dynamic',
      entityId: 55,
      entityTypeId: 1036,
    });
  });

  it('returns null for a malformed dynamic placement code', () => {
    expect(parseCrmTabPlacement('CRM_DYNAMIC_DETAIL_TAB', '{"ID":"55"}')).toBeNull();
    expect(parseCrmTabPlacement('CRM_DYNAMIC_abc_DETAIL_TAB', '{"ID":"55"}')).toBeNull();
  });
});

describe('GET /api/crm/context', () => {
  it('resolves a lead’s own PHONE and reports no existing conversation', async () => {
    const sessionId = await seedSession();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.lead.get', method: 'POST' })
      .reply(200, { result: { ID: '42', PHONE: [{ VALUE: '+971 55 780 1481' }] } });

    const res = await apiCall('/api/crm/context?entityType=lead&entityId=42', 'member-1');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { phones: string[]; sessions: Array<{ id: string; matches: unknown[] }> };
    expect(body.phones).toEqual(['971557801481']);
    expect(body.sessions.find((s) => s.id === sessionId)?.matches).toEqual([]);
  });

  it('resolves a deal’s phone via its linked contact', async () => {
    await seedSession();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.deal.get', method: 'POST' })
      .reply(200, { result: { ID: '7', CONTACT_ID: '99', COMPANY_ID: '0' } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.contact.get', method: 'POST' })
      .reply(200, { result: { ID: '99', PHONE: [{ VALUE: '+971557801481' }] } });

    const res = await apiCall('/api/crm/context?entityType=deal&entityId=7', 'member-1');
    expect(res.status).toBe(200);
    expect((await res.json() as { phones: string[] }).phones).toEqual(['971557801481']);
  });

  it('resolves a Smart Process item’s phone via its linked Client contact', async () => {
    await seedSession();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.item.get', method: 'POST' })
      .reply(200, { result: { item: { id: 55, contactId: 99, companyId: 0 } } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.contact.get', method: 'POST' })
      .reply(200, { result: { ID: '99', PHONE: [{ VALUE: '+971557801481' }] } });

    const res = await apiCall(
      '/api/crm/context?entityType=dynamic&entityId=55&entityTypeId=1036',
      'member-1',
    );
    expect(res.status).toBe(200);
    expect((await res.json() as { phones: string[] }).phones).toEqual(['971557801481']);
  });

  it('rejects a dynamic entity request missing entityTypeId', async () => {
    await seedPortal();
    const res = await apiCall('/api/crm/context?entityType=dynamic&entityId=55', 'member-1');
    expect(res.status).toBe(400);
  });

  it('surfaces an existing conversation as a match rather than a fresh phone lookup only', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await env.DB.prepare(
      `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, bitrix_chat_id, bitrix_line_id, last_message_at)
       VALUES (?, ?, '971557801481@s.whatsapp.net', '971557801481', 1807, 12, 1700000000)`,
    )
      .bind(crypto.randomUUID(), sessionId)
      .run();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.contact.get', method: 'POST' })
      .reply(200, { result: { ID: '99', PHONE: [{ VALUE: '+971557801481' }] } });

    const res = await apiCall('/api/crm/context?entityType=contact&entityId=99', 'member-1');
    const body = (await res.json()) as { sessions: Array<{ id: string; matches: Array<{ bitrixChatId: number }> }> };
    expect(body.sessions.find((s) => s.id === sessionId)?.matches).toEqual([
      { phone: '971557801481', bitrixChatId: 1807, lastMessageAt: 1700000000 },
    ]);
  });

  it('rejects an unknown entity type', async () => {
    await seedPortal();
    const res = await apiCall('/api/crm/context?entityType=invoice&entityId=1', 'member-1');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/crm/start', () => {
  it('reopens an existing conversation without calling Bitrix again', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await env.DB.prepare(
      `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, bitrix_chat_id, bitrix_line_id, last_message_at)
       VALUES (?, ?, '971557801481@s.whatsapp.net', '971557801481', 1807, 12, 1700000000)`,
    )
      .bind(crypto.randomUUID(), sessionId)
      .run();

    // No imconnector.send.messages interceptor registered - a call would fail the test.
    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone: '+971557801481' }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ bitrixChatId: 1807 });
  });

  it('starts a fresh chat instead of reopening one stranded on a previous Open Line', async () => {
    // Bitrix pins a chat to the line it was opened on and never migrates it - the id is baked
    // into the CRM contact's own `imol|whatsapp_connector|<LINE>|...` identifier. So once a number is
    // re-bound, every chat_map row from the old line points at a conversation the operator can no
    // longer send through: the reply fails inside Bitrix and emits no connector event at all.
    // Confirmed live 2026-08-11 on contact 884, stranded on a line 6 that had been deactivated.
    // A row with NULL bitrix_line_id (written before that column existed) is excluded the same
    // way, for the same reason - it cannot be proven to belong to the line in use now.
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const portal = await seedPortal();

    await env.DB.prepare(
      `INSERT INTO chat_map (id, session_id, wa_jid, wa_phone, bitrix_chat_id, bitrix_line_id, last_message_at)
       VALUES (?, ?, '971557801481@s.whatsapp.net', '971557801481', 1807, 6, 1700000000)`,
    )
      .bind(crypto.randomUUID(), sessionId)
      .run();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/imconnector.send.messages', method: 'POST' })
      .reply(200, {
        result: { SUCCESS: true, DATA: { RESULT: [{ SUCCESS: true, session: { ID: '901', CHAT_ID: '2222' } }] } },
      });

    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone: '+971557801481' }),
    });

    // 2222, not the stranded 1807.
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ bitrixChatId: 2222 });

    // The row is repointed at the live line, so the next open reuses it normally.
    const row = await env.DB.prepare(
      'SELECT bitrix_chat_id, bitrix_line_id FROM chat_map WHERE session_id = ?',
    )
      .bind(sessionId)
      .first<{ bitrix_chat_id: number; bitrix_line_id: number }>();
    expect(row).toEqual({ bitrix_chat_id: 2222, bitrix_line_id: 12 });
    expect(portal).toBeTruthy();
  });

  it('starts a new conversation with a synthetic opener when none exists yet', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    const portal = await seedPortal();

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
      .reply(200, {
        result: { SUCCESS: true, DATA: { RESULT: [{ SUCCESS: true, session: { ID: '323', CHAT_ID: '1767' } }] } },
      });

    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone: '+971557801481' }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ bitrixChatId: 1767 });

    expect(sentBody.LINE).toBe(12);
    const message = (sentBody.MESSAGES as Array<{ message: { text: string; disable_crm?: string } }>)[0];
    expect(message?.message.text).toBe('SYSTEM MESSAGE: Chat session opened for +971557801481');
    // disable_crm turns off the whole CRM tracker, not just lead creation - that is what attaches
    // the deal, saves the contact and routes to the responsible person, and suppressing it left
    // these chats looking like empty stubs. Lead creation is the line's CRM_CREATE setting's job.
    expect(message?.message.disable_crm).toBeUndefined();

    const row = await chatMapRow(sessionId, '971557801481');
    expect(row?.bitrix_chat_id).toBe(1767);
    expect((await conversationsInitiated(portal.id))?.conversations_initiated).toBe(1);
  });

  // A connector user Bitrix was never given a name for has nothing to be called, so the chat is
  // created as "Guest - <line name>" - visibly different from an inbound chat, which has always
  // passed a name (inbound.ts). The name comes from the CRM record the tab was opened on.
  it('names the customer from the CRM record the tab was opened on', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedPortal();

    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.deal.get', method: 'POST' })
      .reply(200, { result: { ID: '7608', CONTACT_ID: '9506', COMPANY_ID: '0' } });
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.contact.get', method: 'POST' })
      .reply(200, { result: { ID: '9506', NAME: 'Raísa', LAST_NAME: 'Moreira' } });

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
      .reply(200, {
        result: { SUCCESS: true, DATA: { RESULT: [{ SUCCESS: true, session: { ID: '323', CHAT_ID: '1767' } }] } },
      });

    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        phone: '+971557801481',
        entityType: 'deal',
        entityId: 7608,
      }),
    });

    expect(res.status).toBe(201);
    const user = (sentBody.MESSAGES as Array<{ user: { id: string; name?: string } }>)[0]?.user;
    expect(user?.name).toBe('Raísa Moreira');
  });

  it('still opens a chat when the customer has no resolvable name', async () => {
    const sessionId = await seedSession();
    await bindToLine(sessionId, 12);
    await seedPortal();

    // No linked contact or company - nothing to name the chat after, which must not be fatal.
    fetchMock
      .get(BITRIX)
      .intercept({ path: '/rest/crm.deal.get', method: 'POST' })
      .reply(200, { result: { ID: '7608', CONTACT_ID: '0', COMPANY_ID: '0' } });

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
      .reply(200, {
        result: { SUCCESS: true, DATA: { RESULT: [{ SUCCESS: true, session: { ID: '323', CHAT_ID: '1767' } }] } },
      });

    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone: '+971557801481', entityType: 'deal', entityId: 7608 }),
    });

    expect(res.status).toBe(201);
    const user = (sentBody.MESSAGES as Array<{ user: { id: string; name?: string } }>)[0]?.user;
    // The phone number, never nothing - an absent name is what makes Bitrix invent "Guest".
    expect(user?.name).toBe('+971557801481');
    expect(user?.id).toBe('971557801481');
  });

  it('refuses to start a conversation on a session with no Open Line bound', async () => {
    const sessionId = await seedSession();

    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone: '+971557801481' }),
    });

    expect(res.status).toBe(409);
  });

  it('rejects a request missing sessionId or phone', async () => {
    await seedPortal();
    const res = await apiCall('/api/crm/start', 'member-1', {
      method: 'POST',
      body: JSON.stringify({ phone: '+971557801481' }),
    });
    expect(res.status).toBe(400);
  });
});
