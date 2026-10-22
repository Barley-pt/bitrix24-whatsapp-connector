import { callMethod, BitrixError } from './bitrix';
import { setConnectorVersion, updatePortalBotId } from './db';
import { isEnforced, snapshot } from './license';
import { listSessions } from './sessions';
import type { Env, PortalRow } from './types';
import { nowSec } from './util';

/**
 * Generic speech bubble rather than the WhatsApp glyph: the mark is a registered trademark and
 * Bitrix renders it as the channel icon inside the customer's Contact Center. The brand green
 * stays as the ICON.COLOR background.
 */
const GLYPH =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<path fill="#ffffff" d="M12 3.2c-5 0-9 3.5-9 7.9 0 2.3 1.1 4.4 2.9 5.8L5 21.2l4.5-1.8c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-7.9s-4-8.6-9-8.6z"/>' +
  '</svg>';

const dataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/**
 * CRM entity detail tabs the click-to-chat widget (src/crm.ts, routes/install.ts's /crm/tab)
 * appears in. One shared handler; PLACEMENT itself tells the handler which entity type it is.
 */
const CRM_TAB_PLACEMENTS = [
  'CRM_LEAD_DETAIL_TAB',
  'CRM_DEAL_DETAIL_TAB',
  'CRM_CONTACT_DETAIL_TAB',
  'CRM_COMPANY_DETAIL_TAB',
];

/**
 * Register (or update) the Open Channel connector for this portal, plus the CRM detail-tab
 * placements the click-to-chat widget lives in.
 *
 * imconnector.register upserts on ID, so re-running it is safe. We still gate on
 * CONNECTOR_VERSION so a normal app open does not burn a REST call on every load; bump the var
 * to force every portal to re-register on its next open.
 *
 * `force` skips that gate, and the install paths (routes/install.ts's POST /install, events.ts's
 * ONAPPINSTALL) always pass it. Bitrix drops an app's connector and placements when it is
 * uninstalled, so a remembered connector_version describes a registration that no longer exists -
 * the gate then reads "already at version 5, nothing to do" and the connector never comes back.
 * db.ts's markUninstalled clears the column to avoid exactly this, but that only helps when
 * ONAPPUNINSTALL was actually received and authenticated; a portal whose application_token never
 * arrived rejects that event too, so the stale version survives the whole uninstall/reinstall
 * cycle. Confirmed live twice: 2026-08-05, and again 2026-08-11 on b24-ynumvs.bitrix24.com.br,
 * where a reinstall left Contact Center with no connector at all. An install is unambiguous
 * evidence that Bitrix's side is empty, so it re-registers unconditionally rather than trusting
 * bookkeeping that a failed event could have skipped.
 *
 * Requires application OAuth context - a portal webhook token returns
 * WRONG_AUTH_TYPE ("Application context required").
 */
export async function ensureConnectorRegistered(
  env: Env,
  portal: PortalRow,
  { force = false }: { force?: boolean } = {},
): Promise<boolean> {
  const target = Number(env.CONNECTOR_VERSION);
  if (!force && portal.connector_version === target) return false;

  // Group messaging (CHAT_GROUP: true) requires the license feature group_conversations.
  const lic = isEnforced(env) ? await snapshot(env, portal).catch(() => null) : null;
  const chatGroup = lic?.features?.group_conversations === true;

  await callMethod(env, portal, 'imconnector.register', {
    ID: env.CONNECTOR_ID,
    NAME: env.CONNECTOR_NAME,
    ICON: {
      DATA_IMAGE: dataUri(GLYPH),
      COLOR: '#25D366',
      SIZE: '90%',
      POSITION: 'center',
    },
    ICON_DISABLED: {
      DATA_IMAGE: dataUri(GLYPH),
      COLOR: '#99adb3',
      SIZE: '90%',
      POSITION: 'center',
    },
    PLACEMENT_HANDLER: `${env.PUBLIC_URL}/connector/settings`,
    // 1:1 vs group mode is the license feature group_conversations, not a statement about how
    // Bitrix finds the chat: the Open Line session is looked up by CONNECTOR + LINE + chat.id in
    // BOTH modes (user.id additionally participates while CHAT_GROUP is false), which is exactly
    // why chat.id has to be stable per contact - see inbound.ts's canonicalChatId and the live
    // duplicate-chat evidence in schema.sql's chat_id comment.
    CHAT_GROUP: chatGroup,
  });

  for (const placement of CRM_TAB_PLACEMENTS) {
    await bindCrmTab(env, portal, placement);
  }
  await bindDynamicCrmTabPlacements(env, portal);
  await bindAudioRecorder(env, portal);
  await registerGarciaBot(env, portal);

  await setConnectorVersion(env, portal.id, target);
  return true;
}

function bindCrmTab(env: Env, portal: PortalRow, placement: string): Promise<void> {
  return bindIdempotent(env, portal, 'placement.bind', {
    PLACEMENT: placement,
    HANDLER: `${env.PUBLIC_URL}/crm/tab`,
    TITLE: 'WhatsApp',
  });
}

/**
 * Bind the CRM_DYNAMIC_<entityTypeId>_DETAIL_TAB placement for one Smart Process (SPA) type.
 * Exported for two callers: the bulk sweep below (registration time, every currently-known SPA
 * type) and events.ts's ONCRMTYPEADD handler (one at a time, the instant a new SPA type is
 * created - so a portal never has to wait for the next CONNECTOR_VERSION bump to get the tab on a
 * type that didn't exist yet when this portal last registered).
 */
export function bindDynamicCrmTabPlacement(
  env: Env,
  portal: PortalRow,
  entityTypeId: number,
): Promise<void> {
  return bindCrmTab(env, portal, `CRM_DYNAMIC_${entityTypeId}_DETAIL_TAB`);
}

/**
 * Smart Processes (SPA) don't share one placement the way Lead/Deal/Contact/Company do - Bitrix
 * registers CRM_DYNAMIC_<entityTypeId>_DETAIL_TAB per SPA type (confirmed against Bitrix's own
 * docs: "For dynamic CRM entities, specify the numeric identifier of the entity type"), so the
 * portal's current SPA types have to be discovered and bound individually. Only runs when
 * ensureConnectorRegistered's CONNECTOR_VERSION gate lets it through, same as everything else
 * here - a SPA type created after that is instead picked up live by the ONCRMTYPEADD handler.
 */
async function bindDynamicCrmTabPlacements(env: Env, portal: PortalRow): Promise<void> {
  const result = await callMethod<{ types?: Array<{ entityTypeId: number }> } | null>(
    env,
    portal,
    'crm.type.list',
    {},
  );
  for (const type of result?.types ?? []) {
    await bindDynamicCrmTabPlacement(env, portal, type.entityTypeId);
  }
}

/**
 * Re-binding an identical event/handler or placement/handler pair is an error, not a no-op -
 * confirmed live 2026-08-05 for event.bind's "Handler already binded", and contrary to the
 * documented error list, which has no such code. The code is a generic ERROR_CORE shared with
 * unrelated failures; the actual reason is only in the description, which is why matching on
 * `code` (the original version of this check) never caught it and every second app open 500'd.
 * placement.bind is the same rest/bind family, so the same tolerance is applied to it here
 * defensively even though re-binding placement.bind has not itself been observed live yet.
 */
async function bindIdempotent(
  env: Env,
  portal: PortalRow,
  method: string,
  params: Record<string, unknown>,
): Promise<void> {
  try {
    await callMethod(env, portal, method, params);
  } catch (err) {
    if (err instanceof BitrixError && /already\s*binded/i.test(err.description)) return;
    throw err;
  }
}

/**
 * Bind this connector to a specific Open Line, so Bitrix starts routing that Line's messages
 * through it. Called once an operator picks a WhatsApp number in the connector-settings
 * placement widget.
 */
export async function activateConnector(env: Env, portal: PortalRow, lineId: number): Promise<void> {
  await callMethod(env, portal, 'imconnector.activate', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: lineId,
    ACTIVE: 1,
  });
}

/**
 * Confirms an outbound send back to Bitrix, marking the operator's message delivered/read in the
 * Open Line. Required after every successful send - per Bitrix's own docs for
 * ONIMCONNECTORMESSAGEADD, not optional cleanup.
 */
export async function confirmDelivery(
  env: Env,
  portal: PortalRow,
  params: { lineId: number; bitrixChatId: number; bitrixMessageId: number; waJid: string; waMessageId: string },
): Promise<void> {
  await callMethod(env, portal, 'imconnector.send.status.delivery', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: params.lineId,
    MESSAGES: [
      {
        im: { chat_id: params.bitrixChatId, message_id: params.bitrixMessageId },
        message: { id: [params.waMessageId], date: nowSec() },
        chat: { id: params.waJid },
      },
    ],
  });
}

/**
 * Title the Open Line chat after the customer. `user.name` in imconnector.send.messages only names
 * the Bitrix *user* - the chat itself keeps Bitrix's default title until this is called, and
 * nothing in this codebase called it before, which is why every chat showed the generic title
 * rather than the customer's name.
 *
 * Bitrix finds the chat by CONNECTOR + LINE + CHAT_ID, so `chatId` must be the exact external
 * chat.id string send.messages was given (chat_map.chat_id - see inbound.ts's resolveChatId), and
 * `userId` the same value as that call's user.id: it is required while CHAT_GROUP is false and
 * takes part in the session search. A chat Bitrix cannot find answers CHAT_RENAMING_FAILED.
 *
 * Throws like any other callMethod; callers treat it as best-effort (a failed rename must never
 * fail message delivery).
 */
export async function setChatName(
  env: Env,
  portal: PortalRow,
  params: { lineId: number; chatId: string; userId: string; name: string },
): Promise<void> {
  await callMethod(env, portal, 'imconnector.chat.name.set', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: params.lineId,
    CHAT_ID: params.chatId,
    NAME: params.name,
    USER_ID: params.userId,
  });
}

/**
 * Re-activate the connector on every Open Line a session is already bound to.
 *
 * imconnector.register and imconnector.activate are separate calls, and until now only the
 * connector-settings widget's Save ever made the second one. So when Bitrix drops the connector on
 * uninstall, re-registering it (ensureConnectorRegistered above) brings it back *deactivated on
 * every line*, while D1 still reports connector_active = 1 for a line Bitrix no longer routes
 * anything through. The operator's message then fails inside Bitrix, no ONIMCONNECTORMESSAGEADD is
 * emitted, and this Worker is never invoked at all - confirmed live 2026-08-11, where
 * `wrangler tail` recorded zero requests while an Open Line reply errored instantly.
 *
 * That makes this the third piece of local bookkeeping that outlives the Bitrix state it
 * describes, after connector_version and application_token, so the install paths repair it the
 * same way: act on the binding the operator actually chose (bitrix_line_id) rather than on a
 * column asserting it is still live. bindLine always writes bitrix_line_id and connector_active
 * together (sessions.ts), so a non-null line id is the whole condition.
 *
 * Best-effort per line: an install must still complete if one Line has since been deleted or
 * deactivated. Everything that matters for the app to work has already run by this point, and the
 * operator can always re-Save in the widget - but the failure is logged rather than swallowed.
 */
export async function reactivateBoundLines(env: Env, portal: PortalRow): Promise<void> {
  const sessions = await listSessions(env, portal.id);
  for (const session of sessions) {
    if (!session.bitrix_line_id) continue;
    try {
      await activateConnector(env, portal, session.bitrix_line_id);
    } catch (err) {
      console.error(
        JSON.stringify({
          msg: 'could not re-activate connector on a bound line',
          memberId: portal.member_id,
          sessionId: session.id,
          lineId: session.bitrix_line_id,
          error: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
}

/**
 * IM_TEXTAREA placement: mic button for recording audio in the Open Line chat toolbar.
 */
function bindAudioRecorder(env: Env, portal: PortalRow): Promise<void> {
  // Unbind first so updated OPTIONS (width/height) take effect on existing portals.
  // The bindIdempotent helper skips on "already binded", so a bare bind would not update.
  return callMethod(env, portal, 'placement.unbind', {
    PLACEMENT: 'IM_TEXTAREA',
    HANDLER: `${env.PUBLIC_URL}/widget/audio-record`,
  }).catch(() => {
    // ignore — the placement may not exist yet, that is fine
  }).then(() =>
    bindIdempotent(env, portal, 'placement.bind', {
      PLACEMENT: 'IM_TEXTAREA',
      HANDLER: `${env.PUBLIC_URL}/widget/audio-record`,
      TITLE: 'Audio (WhatsApp)',
      OPTIONS: {
        iconName: 'fa-microphone',
        context: 'LINES',
        role: 'USER',
        color: 'GREEN',
        width: 320,
        height: 300,
      },
    }),
  );
}

/**
 * Register the "Garcia" chatbot for posting audio-sent notifications.
 * Idempotent -- re-calling with the same code returns the existing bot.
 */
async function registerGarciaBot(env: Env, portal: PortalRow): Promise<void> {
  const result = await callMethod<{ bot: { id: number } }>(env, portal, 'imbot.v2.Bot.register', {
    fields: {
      code: 'garcia_audio_bot',
      type: 'bot',
      isSupportOpenline: true,
      eventMode: 'webhook',
      webhookUrl: `${env.PUBLIC_URL}/bot/garcia`,
      properties: { name: 'Garcia', workPosition: 'WhatsApp Audio', color: 'green' },
    },
  });
  if (result?.bot?.id) {
    await updatePortalBotId(env, portal.id, result.bot.id);
  }
}

/** Event handlers this app needs bound on every portal. */
const EVENT_HANDLERS: Array<{ event: string; path: string }> = [
  // Operator replies in the Open Line -> outbound to WhatsApp (phase 4).
  { event: 'ONIMCONNECTORMESSAGEADD', path: '/events/message-add' },
  // The only event that ever delivers application_token, which every other event is then
  // validated against (events.ts's authenticate). Bound here explicitly rather than relying
  // solely on the Market version card's "Installation event handler URL" field: that field is
  // typed by hand outside this repo, and when it is wrong the failure is total and silent -
  // confirmed live 2026-08-10 on b24-ynumvs.bitrix24.com.br, where every placement, the connector
  // and inbound all worked while application_token stayed NULL and five days of operator replies
  // were discarded. installFinish() is called only after this binding runs (routes/install.ts),
  // and ONAPPINSTALL fires immediately after that, so the handler is always in place in time.
  { event: 'ONAPPINSTALL', path: '/events/install' },
  // Publishing a new Market version fires this with a refreshed application_token. Without it,
  // every later event fails validation the moment a version ships.
  { event: 'ONAPPUPDATE', path: '/events/update' },
  { event: 'ONAPPUNINSTALL', path: '/events/uninstall' },
  // A new Smart Process (SPA) type created after this portal last registered would otherwise
  // never get the click-to-chat tab until the next CONNECTOR_VERSION bump - this closes that gap
  // live (events.ts's handler + bindDynamicCrmTabPlacement above).
  { event: 'ONCRMTYPEADD', path: '/events/crm-type-add' },
];

export async function bindEvents(env: Env, portal: PortalRow): Promise<void> {
  for (const { event, path } of EVENT_HANDLERS) {
    await bindIdempotent(env, portal, 'event.bind', { event, handler: `${env.PUBLIC_URL}${path}` });
  }
}

/**
 * Self-heal for a portal whose application_token never arrived, so outbound is dead and nothing
 * else can revive it: ONAPPINSTALL is the only source of that token, and authenticate()'s own
 * fallback needs an incoming event to carry an access_token - which the one event that would
 * (ONIMCONNECTORMESSAGEADD) cannot deliver while it is itself being rejected. That deadlock is
 * what this breaks.
 *
 * ONAPPTEST + event.test is Bitrix's own documented way to prove a handler receives events
 * (apidocs "How to Test Your Handler"). Two properties make it the right tool here rather than
 * just a diagnostic:
 *
 *  - The delivered payload carries the full auth block, application_token included, so
 *    /events/test can store what ONAPPINSTALL failed to deliver.
 *  - Because *we* trigger it through an authenticated REST call, the hit is always attributable to
 *    a user, so the auth block is never the truncated kind the docs warn about ("Authorization
 *    tokens are not always passed to the event handler. If the hit that initiated the event could
 *    not be linked to a specific Bitrix24 user, the tokens are not passed") - the delivery both
 *    proves and repairs itself.
 *
 * Fire and forget: Bitrix queues the event, so nothing useful can be awaited here. The token
 * lands within seconds and the next app open sees it. Callers run this only while
 * application_token is NULL, so a healthy portal never pays for it.
 */
export async function verifyEventDelivery(env: Env, portal: PortalRow): Promise<void> {
  await bindIdempotent(env, portal, 'event.bind', {
    event: 'ONAPPTEST',
    handler: `${env.PUBLIC_URL}/events/test`,
  });
  await callMethod(env, portal, 'event.test', {});
}
