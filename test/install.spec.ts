import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { decrypt } from '../src/crypto';
import worker from '../src/index';
import { parsePlacementOptions } from '../src/routes/install';
import type { OutboundQueueMessage, PortalRow } from '../src/types';
import { applySchema, frameForm, frameRequest, resetDb } from './helpers';

const REST_ORIGIN = 'https://your-portal.bitrix24.com';

async function call(request: Request): Promise<Response> {
  const ctx = createExecutionContext();
  const res = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

/** One event.bind per entry in connector.ts's EVENT_HANDLERS. */
const BOUND_EVENTS = 5;
/** One placement.bind for each CRM_TAB_PLACEMENTS entry in connector.ts plus one for the IM_TEXTAREA audio recorder. */
const CRM_TAB_PLACEMENTS = 4;

/**
 * Everything ensureConnectorRegistered does. Split out from mockSetupCalls because the install
 * paths now re-register unconditionally (see `force` there), so tests that supply their own
 * event.bind behaviour still need the registration half mocked ahead of it.
 *
 * `types` mocks crm.type.list's response - connector.ts's bindDynamicCrmTabPlacements binds one
 * extra placement.bind per Smart Process (SPA) type the portal has, so tests that don't care about
 * SPA types default to none.
 */
function mockRegisterCalls(types: number[] = []) {
  const origin = fetchMock.get(REST_ORIGIN);
  origin
    .intercept({ path: '/rest/imconnector.register', method: 'POST' })
    .reply(200, { result: true });
  origin
    .intercept({ path: '/rest/placement.bind', method: 'POST' })
    .reply(200, { result: true })
    .times(CRM_TAB_PLACEMENTS);
  // IM_TEXTAREA audio recorder placement
  origin
    .intercept({ path: '/rest/placement.bind', method: 'POST' })
    .reply(200, { result: true })
    .times(1);
  // Garcia chatbot registration (connector.ts's registerGarciaBot)
  origin
    .intercept({ path: '/rest/imbot.v2.Bot.register', method: 'POST' })
    .reply(200, { result: { bot: { id: 999 } } });
  origin
    .intercept({ path: '/rest/crm.type.list', method: 'POST' })
    .reply(200, { result: { types: types.map((entityTypeId) => ({ entityTypeId })) } });
  if (types.length > 0) {
    origin
      .intercept({ path: '/rest/placement.bind', method: 'POST' })
      .reply(200, { result: true })
      .times(types.length);
  }
  return origin;
}

/**
 * `selfTest` covers connector.ts's verifyEventDelivery, which persistAndSetup fires only while a
 * portal still has no application_token on file - so it applies to the iframe paths (/install, /,
 * /crm/tab) before any ONAPPINSTALL has landed, and never to the /events/* routes, which don't go
 * through persistAndSetup at all. It costs one extra event.bind (ONAPPTEST) plus the event.test
 * call itself.
 */
function mockSetupCalls({
  register = true,
  types = [] as number[],
  selfTest = false,
}: { register?: boolean; types?: number[]; selfTest?: boolean } = {}) {
  const origin = register ? mockRegisterCalls(types) : fetchMock.get(REST_ORIGIN);
  origin
    .intercept({ path: '/rest/event.bind', method: 'POST' })
    .reply(200, { result: true })
    .times(selfTest ? BOUND_EVENTS + 1 : BOUND_EVENTS);
  if (selfTest) {
    origin.intercept({ path: '/rest/event.test', method: 'POST' }).reply(200, { result: 1 });
  }
}

const portal = () =>
  env.DB.prepare('SELECT * FROM portals WHERE member_id = ?').bind('member-1').first<PortalRow>();

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

describe('parsePlacementOptions', () => {
  it('extracts the LINE id Bitrix sends as a string', () => {
    expect(parsePlacementOptions('{"CONNECTOR":"whatsapp_connector","LINE":"12"}')).toEqual({
      lineId: 12,
    });
  });

  it('returns null when no line has been picked yet', () => {
    expect(parsePlacementOptions(undefined)).toBeNull();
    expect(parsePlacementOptions('{}')).toBeNull();
  });

  it('returns null rather than throwing on malformed JSON', () => {
    expect(parsePlacementOptions('not json')).toBeNull();
  });

  it('rejects a non-positive or non-integer LINE', () => {
    expect(parsePlacementOptions('{"LINE":"0"}')).toBeNull();
    expect(parsePlacementOptions('{"LINE":"abc"}')).toBeNull();
    expect(parsePlacementOptions('{"LINE":"1.5"}')).toBeNull();
  });
});

describe('POST /install', () => {
  it('persists the portal, encrypts tokens and registers the connector', async () => {
    mockSetupCalls({ selfTest: true });

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('installFinish');

    const row = await portal();
    expect(row).not.toBeNull();
    expect(row?.bitrix_domain).toBe('your-portal.bitrix24.com');
    expect(row?.client_endpoint).toBe('https://your-portal.bitrix24.com/rest/');
    expect(row?.connector_version).toBe(1);
    expect(row?.status).toBe('active');

    // Tokens must never be readable straight out of D1.
    expect(row?.access_token).not.toBe('access-token-1');
    expect(await decrypt(row?.access_token as string, env.TOKEN_ENC_KEY)).toBe('access-token-1');
    expect(await decrypt(row?.refresh_token as string, env.TOKEN_ENC_KEY)).toBe('refresh-token-1');

    // The iframe path cannot know the application token.
    expect(row?.application_token).toBeNull();
  });

  it('reads DOMAIN/PROTOCOL/LANG/APP_SID from the query string, matching real Bitrix requests', async () => {
    // Regression test: Bitrix splits fields across the URL query string and the POST body rather
    // than putting everything in one place. Reading the body alone (the original implementation)
    // silently drops DOMAIN and rejects every real install while unit tests using an all-in-body
    // FormData kept passing - exactly what happened in production on 2026-08-05.
    mockSetupCalls({ selfTest: true });

    const res = await call(frameRequest('https://relay.test/install'));

    expect(res.status).toBe(200);
    const row = await portal();
    expect(row?.bitrix_domain).toBe('your-portal.bitrix24.com');
    expect(await decrypt(row?.access_token as string, env.TOKEN_ENC_KEY)).toBe('access-token-1');
  });

  it('re-registers the connector on every install, even at an unchanged version', async () => {
    // The CONNECTOR_VERSION gate is deliberately bypassed here (ensureConnectorRegistered's
    // `force`). Bitrix drops the connector and its placements on uninstall, so on the reinstall
    // that follows, a connector_version left over from before describes a registration that no
    // longer exists - honouring it leaves Contact Center permanently empty, which is what
    // happened live on 2026-08-11. markUninstalled clears the column for this reason, but it only
    // runs if ONAPPUNINSTALL was received and authenticated, and a portal with no
    // application_token rejects that event too. So an install cannot trust its own bookkeeping.
    //
    // The gate itself still applies everywhere else - see the ONAPPUPDATE test below, which
    // deliberately mocks no imconnector.register at all.
    mockSetupCalls({ selfTest: true });
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));
    expect((await portal())?.connector_version).toBe(1);

    // A full second set of register/placement.bind interceptors: all of it must run again.
    mockSetupCalls({ selfTest: true });
    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(200);
    expect((await portal())?.connector_version).toBe(1);
  });

  it('re-activates the connector on every Line a session was already bound to', async () => {
    // imconnector.register brings the connector back deactivated on every Line, so without this
    // a reinstall leaves it registered but routing nothing: the operator's message fails inside
    // Bitrix, no ONIMCONNECTORMESSAGEADD is emitted, and the Worker is never invoked. Confirmed
    // live 2026-08-11 - `wrangler tail` saw zero requests while an Open Line reply errored
    // instantly, and D1 still claimed connector_active = 1.
    mockSetupCalls({ selfTest: true });
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));

    const portalId = (await portal())?.id as string;
    await env.DB.prepare(
      `INSERT INTO whatsapp_sessions (id, portal_id, bitrix_line_id, connector_active, status, created_at)
       VALUES (?, ?, ?, 1, 'connected', 0)`,
    )
      .bind('session-1', portalId, 4)
      .run();
    // Never bound to a Line, so it must not produce an activate call of its own.
    await env.DB.prepare(
      `INSERT INTO whatsapp_sessions (id, portal_id, bitrix_line_id, connector_active, status, created_at)
       VALUES (?, ?, NULL, 0, 'need_scan', 0)`,
    )
      .bind('session-2', portalId)
      .run();

    const activated: number[] = [];
    mockRegisterCalls()
      .intercept({
        path: '/rest/imconnector.activate',
        method: 'POST',
        body: (raw) => {
          activated.push((JSON.parse(raw as string) as { LINE: number }).LINE);
          return true;
        },
      })
      .reply(200, { result: true });
    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/event.bind', method: 'POST' })
      .reply(200, { result: true })
      .times(BOUND_EVENTS + 1);
    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/event.test', method: 'POST' })
      .reply(200, { result: 1 });

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(200);
    // Deduped: undici runs a body matcher more than once per request, which is why the
    // placement.bind test above asserts with toContain rather than on exact call counts. The
    // point here is the set of Lines touched - 4 and only 4, never the unbound session.
    expect([...new Set(activated)]).toEqual([4]);
  });

  it('completes the install even when a bound Line can no longer be activated', async () => {
    // A Line deleted or deactivated since it was bound must not take the whole install down with
    // it - everything that matters has already run by that point.
    mockSetupCalls({ selfTest: true });
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));

    const portalId = (await portal())?.id as string;
    await env.DB.prepare(
      `INSERT INTO whatsapp_sessions (id, portal_id, bitrix_line_id, connector_active, status, created_at)
       VALUES (?, ?, ?, 1, 'connected', 0)`,
    )
      .bind('session-1', portalId, 99)
      .run();

    mockRegisterCalls()
      .intercept({ path: '/rest/imconnector.activate', method: 'POST' })
      .reply(200, { error: 'ERROR_CORE', error_description: 'Open line not found' });
    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/event.bind', method: 'POST' })
      .reply(200, { result: true })
      .times(BOUND_EVENTS + 1);
    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/event.test', method: 'POST' })
      .reply(200, { result: 1 });

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(200);
  });

  it('binds one CRM_DYNAMIC_<id>_DETAIL_TAB placement per Smart Process type the portal has', async () => {
    let bound: string[] = [];
    const origin = fetchMock.get(REST_ORIGIN);
    origin
      .intercept({ path: '/rest/imconnector.register', method: 'POST' })
      .reply(200, { result: true });
    origin
      .intercept({ path: '/rest/crm.type.list', method: 'POST' })
      .reply(200, { result: { types: [{ entityTypeId: 1036 }, { entityTypeId: 1044 }] } });
    origin
      .intercept({
        path: '/rest/placement.bind',
        method: 'POST',
        body: (raw) => {
          bound.push((JSON.parse(raw as string) as { PLACEMENT: string }).PLACEMENT);
          return true;
        },
      })
      .reply(200, { result: true })
      .times(CRM_TAB_PLACEMENTS + 1 + 2);
    origin
      .intercept({ path: '/rest/imbot.v2.Bot.register', method: 'POST' })
      .reply(200, { result: { bot: { id: 999 } } });
    origin
      .intercept({ path: '/rest/event.bind', method: 'POST' })
      .reply(200, { result: true })
      .times(BOUND_EVENTS);

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(200);
    expect(bound).toContain('CRM_DYNAMIC_1036_DETAIL_TAB');
    expect(bound).toContain('CRM_DYNAMIC_1044_DETAIL_TAB');
  });

  it('treats "Handler already binded" as success rather than a 500', async () => {
    // Regression test: event.bind is not version-gated like imconnector.register, so it fires
    // again on every open. Bitrix's real response to re-binding an unchanged handler is
    // ERROR_CORE / "Handler already binded" - confirmed live 2026-08-05, and NOT in the
    // documented error list, which is exactly why the original code (matching on `err.code`,
    // a generic ERROR_CORE shared with unrelated failures) never caught it and every second
    // app open 500'd in production.
    mockSetupCalls({ selfTest: true });
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));

    // A second install re-registers unconditionally now, so the registration half has to be
    // mocked too. BOUND_EVENTS + 1: the ONAPPTEST binding verifyEventDelivery adds is re-bound on
    // this second install as well, and has to tolerate "already binded" for the same reason.
    const origin = mockRegisterCalls();
    origin
      .intercept({ path: '/rest/event.bind', method: 'POST' })
      .reply(200, {
        error: 'ERROR_CORE',
        error_description: 'Unable to set event handler: Handler already binded',
      })
      .times(BOUND_EVENTS + 1);
    origin.intercept({ path: '/rest/event.test', method: 'POST' }).reply(200, { result: 1 });

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(200);
    expect(await res.text()).toContain('installFinish');
  });

  it('still surfaces an unrelated event.bind failure', async () => {
    mockSetupCalls({ selfTest: true });
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));

    // Registration runs first and succeeds; the very first event.bind is what fails, so
    // verifyEventDelivery is never reached and needs no mocks of its own.
    mockRegisterCalls()
      .intercept({ path: '/rest/event.bind', method: 'POST' })
      .reply(200, { error: 'NO_AUTH_FOUND', error_description: 'Wrong authorization data' });

    const res = await call(
      new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
    );

    expect(res.status).toBe(500);
  });

  it('rejects a payload without Bitrix auth fields', async () => {
    const body = new FormData();
    body.set('DOMAIN', 'your-portal.bitrix24.com');

    const res = await call(new Request('https://relay.test/install', { method: 'POST', body }));

    expect(res.status).toBe(400);
    expect(await portal()).toBeNull();
  });
});

describe('event handlers', () => {
  function eventForm(event: string, auth: Record<string, string>): FormData {
    const form = new FormData();
    form.set('event', event);
    for (const [k, v] of Object.entries(auth)) form.set(`auth[${k}]`, v);
    return form;
  }

  const installAuth = {
    access_token: 'evt-access',
    refresh_token: 'evt-refresh',
    application_token: 'app-token-1',
    member_id: 'member-1',
    domain: 'your-portal.bitrix24.com',
    client_endpoint: 'https://your-portal.bitrix24.com/rest/',
  };

  it('ONAPPINSTALL stores the application token the iframe path cannot supply', async () => {
    mockSetupCalls();

    const res = await call(
      new Request('https://relay.test/events/install', {
        method: 'POST',
        body: eventForm('ONAPPINSTALL', installAuth),
      }),
    );

    expect(res.status).toBe(200);
    expect((await portal())?.application_token).toBe('app-token-1');
  });

  describe('ONAPPTEST self-heal', () => {
    /**
     * The deadlock this breaks: a portal with no application_token cannot authenticate any event,
     * and the only events that could supply one are themselves rejected. Confirmed live
     * 2026-08-10 on example.bitrix24.com.br - five days of operator replies discarded while
     * placements, the connector and inbound all looked healthy.
     */
    async function iframeInstallWithoutToken() {
      mockSetupCalls({ selfTest: true });
      await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));
      expect((await portal())?.application_token).toBeNull();
    }

    it('stores the application token delivered by the triggered ONAPPTEST', async () => {
      await iframeInstallWithoutToken();

      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(200, { result: '2026-08-05T10:00:00+03:00' });

      const res = await call(
        new Request('https://relay.test/events/test', {
          method: 'POST',
          body: eventForm('ONAPPTEST', { ...installAuth, application_token: 'recovered-token' }),
        }),
      );

      expect(res.status).toBe(200);
      expect((await portal())?.application_token).toBe('recovered-token');
    });

    it('will not let an unverified caller nominate the token every later event is checked against', async () => {
      await iframeInstallWithoutToken();

      // Anyone can learn a member_id, so the incoming application_token is never trusted on its
      // own - the caller has to prove it holds a working access_token first, exactly as
      // authenticate()'s own fallback does.
      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(401, { error: 'invalid_token', error_description: 'nope' });

      const res = await call(
        new Request('https://relay.test/events/test', {
          method: 'POST',
          body: eventForm('ONAPPTEST', { ...installAuth, application_token: 'attacker-token' }),
        }),
      );

      expect(res.status).toBe(200);
      expect((await portal())?.application_token).toBeNull();
    });

    it('does not re-run the self-test once a token is on file', async () => {
      mockSetupCalls();
      await call(
        new Request('https://relay.test/events/install', {
          method: 'POST',
          body: eventForm('ONAPPINSTALL', installAuth),
        }),
      );

      // No selfTest mocks: a healthy portal must not spend an event.bind + event.test on every
      // single app open. assertNoPendingInterceptors would catch the reverse mistake.
      mockSetupCalls();
      const res = await call(
        new Request('https://relay.test/install', { method: 'POST', body: frameForm() }),
      );

      expect(res.status).toBe(200);
    });
  });

  it('the iframe path does not wipe a stored application token', async () => {
    mockSetupCalls();
    await call(
      new Request('https://relay.test/events/install', {
        method: 'POST',
        body: eventForm('ONAPPINSTALL', installAuth),
      }),
    );

    mockSetupCalls();
    await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));

    expect((await portal())?.application_token).toBe('app-token-1');
  });

  it('ignores an ONAPPINSTALL that cannot prove it owns an existing portal', async () => {
    mockSetupCalls();
    await call(
      new Request('https://relay.test/events/install', {
        method: 'POST',
        body: eventForm('ONAPPINSTALL', installAuth),
      }),
    );

    const res = await call(
      new Request('https://relay.test/events/install', {
        method: 'POST',
        body: eventForm('ONAPPINSTALL', {
          ...installAuth,
          access_token: 'attacker-token',
          application_token: 'wrong-token',
        }),
      }),
    );

    expect(res.status).toBe(200);
    const row = await portal();
    expect(await decrypt(row?.access_token as string, env.TOKEN_ENC_KEY)).toBe('evt-access');
  });

  describe('ONAPPUPDATE', () => {
    const updateForm = (overrides: Record<string, string> = {}) =>
      eventForm('ONAPPUPDATE', {
        ...installAuth,
        access_token: 'rotated-access',
        application_token: 'app-token-2',
        ...overrides,
      });

    async function install() {
      mockSetupCalls();
      await call(
        new Request('https://relay.test/events/install', {
          method: 'POST',
          body: eventForm('ONAPPINSTALL', installAuth),
        }),
      );
    }

    it('accepts a rotated application token once the access token checks out', async () => {
      await install();

      // The token changed, so the handler proves the caller is Bitrix before trusting it.
      // No imconnector.register mock: CONNECTOR_VERSION is unchanged, so registration is skipped.
      const origin = fetchMock.get(REST_ORIGIN);
      origin
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(200, { result: '2026-08-05T10:00:00+03:00' });
      origin
        .intercept({ path: '/rest/event.bind', method: 'POST' })
        .reply(200, { result: true })
        .times(BOUND_EVENTS);

      const res = await call(
        new Request('https://relay.test/events/update', { method: 'POST', body: updateForm() }),
      );

      expect(res.status).toBe(200);
      const row = await portal();
      expect(row?.application_token).toBe('app-token-2');
      expect(await decrypt(row?.access_token as string, env.TOKEN_ENC_KEY)).toBe('rotated-access');
    });

    it('rejects a rotated token when the access token does not check out', async () => {
      await install();

      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(401, { error: 'invalid_token', error_description: 'nope' });

      const res = await call(
        new Request('https://relay.test/events/update', {
          method: 'POST',
          body: updateForm({ application_token: 'attacker-token' }),
        }),
      );

      expect(res.status).toBe(200);
      const row = await portal();
      expect(row?.application_token).toBe('app-token-1');
      expect(await decrypt(row?.access_token as string, env.TOKEN_ENC_KEY)).toBe('evt-access');
    });

    it('skips the verification call when the token is unchanged', async () => {
      await install();

      // No server.time interceptor: the matching token is proof enough on its own.
      const origin = fetchMock.get(REST_ORIGIN);
      origin
        .intercept({ path: '/rest/event.bind', method: 'POST' })
        .reply(200, { result: true })
        .times(BOUND_EVENTS);

      const res = await call(
        new Request('https://relay.test/events/update', {
          method: 'POST',
          body: updateForm({ application_token: 'app-token-1' }),
        }),
      );

      expect(res.status).toBe(200);
      expect((await portal())?.application_token).toBe('app-token-1');
    });

    it('ignores an update for a portal it has never seen', async () => {
      const res = await call(
        new Request('https://relay.test/events/update', {
          method: 'POST',
          body: updateForm({ member_id: 'member-unknown' }),
        }),
      );

      expect(res.status).toBe(200);
      expect(await portal()).toBeNull();
    });
  });

  it('uninstall requires a matching application token', async () => {
    mockSetupCalls();
    await call(
      new Request('https://relay.test/events/install', {
        method: 'POST',
        body: eventForm('ONAPPINSTALL', installAuth),
      }),
    );

    // A mismatched token now falls back to verifying the supplied access_token (authenticate(),
    // events.ts) instead of failing outright - an attacker forging this request has no genuine
    // access_token either, so server.time is mocked to reject it, same as the ONAPPUPDATE
    // "does not check out" case.
    fetchMock
      .get(REST_ORIGIN)
      .intercept({ path: '/rest/server.time', method: 'POST' })
      .reply(401, { error: 'invalid_token', error_description: 'nope' });

    await call(
      new Request('https://relay.test/events/uninstall', {
        method: 'POST',
        body: eventForm('ONAPPUNINSTALL', {
          member_id: 'member-1',
          application_token: 'wrong-token',
          domain: 'your-portal.bitrix24.com',
          access_token: 'x',
        }),
      }),
    );
    expect((await portal())?.status).toBe('active');

    await call(
      new Request('https://relay.test/events/uninstall', {
        method: 'POST',
        body: eventForm('ONAPPUNINSTALL', {
          member_id: 'member-1',
          application_token: 'app-token-1',
          domain: 'your-portal.bitrix24.com',
          access_token: 'x',
        }),
      }),
    );
    expect((await portal())?.status).toBe('uninstalled');
  });

  describe('ONIMCONNECTORMESSAGEADD', () => {
    function messageAddForm(overrides: Record<string, string> = {}) {
      const form = new FormData();
      form.set('event', 'ONIMCONNECTORMESSAGEADD');
      for (const [k, v] of Object.entries(installAuth)) form.set(`auth[${k}]`, v);
      const fields: Record<string, string> = {
        'data[LINE]': '12',
        'data[MESSAGES][0][im][chat_id]': '1807',
        'data[MESSAGES][0][im][message_id]': '86497',
        'data[MESSAGES][0][message][user_id]': '27',
        'data[MESSAGES][0][message][text]': '[b]Klaus Weber:[/b] [br]Guten Tag!',
        'data[MESSAGES][0][chat][id]': '123@lid',
        ...overrides,
      };
      for (const [k, v] of Object.entries(fields)) form.set(k, v);
      return form;
    }

    async function install() {
      mockSetupCalls();
      await call(
        new Request('https://relay.test/events/install', {
          method: 'POST',
          body: eventForm('ONAPPINSTALL', installAuth),
        }),
      );
    }

    it('enqueues one OutboundQueueMessage per MESSAGES item', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });

      const res = await call(
        new Request('https://relay.test/events/message-add', { method: 'POST', body: messageAddForm() }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).toHaveBeenCalledTimes(1);
      const [sent] = sendSpy.mock.calls[0] as [OutboundQueueMessage];
      expect(sent.lineId).toBe(12);
      expect(sent.waJid).toBe('123@lid');
      expect(sent.bitrixChatId).toBe(1807);
      expect(sent.bitrixMessageId).toBe(86497);
      expect(sent.text).toBe('[b]Klaus Weber:[/b] [br]Guten Tag!');
    });

    it('carries an operator attachment through to the queue message', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          // A photo attached with no comment: Bitrix sends an empty text, which before media
          // support was enqueued anyway and burned all five retries on an empty Wasender send.
          body: messageAddForm({
            'data[MESSAGES][0][message][text]': '',
            'data[MESSAGES][0][message][files][0][name]': 'photo.jpg',
            'data[MESSAGES][0][message][files][0][type]': 'image',
            'data[MESSAGES][0][message][files][0][link]': '/bitrix/tools/disk/uf.php?attachedId=42&auth=sig',
          }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).toHaveBeenCalledTimes(1);
      const [sent] = sendSpy.mock.calls[0] as [OutboundQueueMessage];
      expect(sent.text).toBe('');
      expect(sent.files).toStrictEqual([
        { link: '/bitrix/tools/disk/uf.php?attachedId=42&auth=sig', name: 'photo.jpg', type: 'image' },
      ]);
    });

    it('drops a message with neither text nor a readable attachment', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          // An attachment whose link is under a field name we don't know: nothing to send, and
          // the warning it logs is how that field name gets discovered.
          body: messageAddForm({
            'data[MESSAGES][0][message][text]': '',
            'data[MESSAGES][0][message][files][0][name]': 'photo.jpg',
            'data[MESSAGES][0][message][files][0][downloadPath]': '/somewhere',
          }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('drops an attachment-only reply whose text is nothing but BBCode', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          // The live regression (example.bitrix24.com.br, 2026-08-18 21:48 UTC): two PDFs whose
          // links parseFiles cannot read, and a text that is truthy here but strips to "". It used
          // to pass this guard as "has text" and then reach Wasender as an empty send, which is
          // rejected - five retries, a dead letter, and "message not delivered" in Bitrix.
          body: messageAddForm({
            'data[MESSAGES][0][message][text]': '[br]',
            'data[MESSAGES][0][message][files][0][name]': 'ATOrd_1grau.pdf',
            'data[MESSAGES][0][message][files][0][downloadPath]': '/somewhere',
          }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('ignores an event with a bad application_token', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });
      // A mismatched token now falls back to verifying the supplied access_token (authenticate(),
      // events.ts) - an attacker forging this request has no genuine access_token either.
      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(401, { error: 'invalid_token', error_description: 'nope' });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          body: messageAddForm({ 'auth[application_token]': 'wrong-token' }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('skips a malformed message item without enqueueing it', async () => {
      await install();
      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          body: messageAddForm({ 'data[MESSAGES][0][chat][id]': '' }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('self-heals a missing application_token via access_token verification', async () => {
      // Portal created via the iframe path only, so application_token is null - matching a
      // portal where ONAPPINSTALL never arrived. Confirmed live 2026-08-05: this happened across
      // two separate reinstalls, permanently blocking every event this portal ever sent.
      mockSetupCalls({ selfTest: true });
      await call(new Request('https://relay.test/install', { method: 'POST', body: frameForm() }));
      expect((await portal())?.application_token).toBeNull();

      const sendSpy = vi.spyOn(env.OUTBOUND_QUEUE, 'send').mockResolvedValue({
        metadata: { metrics: { backlogCount: 0, backlogBytes: 0, oldestMessageTimestamp: new Date(0) } },
      });
      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(200, { result: '2026-08-05T10:00:00+03:00' });

      const res = await call(
        new Request('https://relay.test/events/message-add', {
          method: 'POST',
          body: messageAddForm({ 'auth[application_token]': 'fresh-token-999' }),
        }),
      );

      expect(res.status).toBe(200);
      expect(sendSpy).toHaveBeenCalledTimes(1);
      // Self-healed: the next event's fast path (a plain token compare) now succeeds on its own.
      expect((await portal())?.application_token).toBe('fresh-token-999');
    });
  });

  describe('ONCRMTYPEADD', () => {
    async function install() {
      mockSetupCalls();
      await call(
        new Request('https://relay.test/events/install', {
          method: 'POST',
          body: eventForm('ONAPPINSTALL', installAuth),
        }),
      );
    }

    function typeAddForm(overrides: Record<string, string> = {}) {
      const form = new FormData();
      form.set('event', 'ONCRMTYPEADD');
      for (const [k, v] of Object.entries(installAuth)) form.set(`auth[${k}]`, v);
      const fields: Record<string, string> = { 'data[FIELDS][ID]': '37', ...overrides };
      for (const [k, v] of Object.entries(fields)) form.set(k, v);
      return form;
    }

    it('resolves the type id to entityTypeId and binds its placement live', async () => {
      await install();

      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/crm.type.get', method: 'POST' })
        .reply(200, { result: { type: { id: 37, entityTypeId: 1256 } } });

      let bound: Record<string, unknown> = {};
      fetchMock
        .get(REST_ORIGIN)
        .intercept({
          path: '/rest/placement.bind',
          method: 'POST',
          body: (raw) => {
            bound = JSON.parse(raw as string);
            return true;
          },
        })
        .reply(200, { result: true });

      const res = await call(
        new Request('https://relay.test/events/crm-type-add', { method: 'POST', body: typeAddForm() }),
      );

      expect(res.status).toBe(200);
      expect(bound.PLACEMENT).toBe('CRM_DYNAMIC_1256_DETAIL_TAB');
      expect(bound.HANDLER).toBe('https://relay.test/crm/tab');
    });

    it('ignores an event with a bad application_token', async () => {
      await install();
      fetchMock
        .get(REST_ORIGIN)
        .intercept({ path: '/rest/server.time', method: 'POST' })
        .reply(401, { error: 'invalid_token', error_description: 'nope' });

      // No crm.type.get/placement.bind interceptors: either call would fail the test.
      const res = await call(
        new Request('https://relay.test/events/crm-type-add', {
          method: 'POST',
          body: typeAddForm({ 'auth[application_token]': 'wrong-token' }),
        }),
      );

      expect(res.status).toBe(200);
    });

    it('ignores a malformed payload without a type id', async () => {
      await install();
      // No crm.type.get/placement.bind interceptors: either call would fail the test.
      const res = await call(
        new Request('https://relay.test/events/crm-type-add', {
          method: 'POST',
          body: typeAddForm({ 'data[FIELDS][ID]': '' }),
        }),
      );

      expect(res.status).toBe(200);
    });
  });
});
