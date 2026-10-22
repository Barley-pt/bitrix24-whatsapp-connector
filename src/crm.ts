import { callMethod } from './bitrix';
import { canonicalChatId, upsertChatMap } from './inbound';
import type { Env, PortalRow } from './types';
import { nowSec, uuid } from './util';

/**
 * Entity types the click-to-chat CRM detail tab (connector.ts's CRM_TAB_PLACEMENTS and
 * bindDynamicCrmTabPlacements) supports. 'dynamic' covers every Smart Process (SPA) type -
 * Bitrix registers one CRM_DYNAMIC_<entityTypeId>_DETAIL_TAB placement per SPA type rather than a
 * single shared one, so which specific SPA type a tab opened for travels alongside it as
 * `entityTypeId` (see CrmTabPlacement, app-shell.ts).
 */
export const CRM_ENTITY_TYPES = ['lead', 'deal', 'contact', 'company', 'dynamic'] as const;
export type CrmEntityType = (typeof CRM_ENTITY_TYPES)[number];

export function isCrmEntityType(value: string | null | undefined): value is CrmEntityType {
  return !!value && (CRM_ENTITY_TYPES as readonly string[]).includes(value);
}

/**
 * Digits only, matching Wasender's cleanedSenderPn/cleanedParticipantPn convention (no leading
 * '+', no formatting) - see docs/wasenderapi.md. This is the same shape chat_map.wa_phone and
 * imconnector.send.messages' user.id/phone already use everywhere else in this codebase.
 */
export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

interface MultifieldValue {
  VALUE?: string;
}

async function entityPhones(
  env: Env,
  portal: PortalRow,
  method: string,
  id: number,
): Promise<string[]> {
  const result = await callMethod<{ PHONE?: MultifieldValue[] } | null>(env, portal, method, { id });
  const phones = (result?.PHONE ?? [])
    .map((p) => (p.VALUE ? normalizePhoneDigits(p.VALUE) : ''))
    .filter(Boolean);
  return [...new Set(phones)];
}

/** Which `crm.*.get` call holds the client's own fields. 0 or absent means "not linked". */
type ClientRef = { method: string; id: number };

/** contactId/companyId, wherever they came from - contact wins when both are set. */
function pickClient(contactId: number, companyId: number): ClientRef | null {
  if (Number.isInteger(contactId) && contactId > 0) return { method: 'crm.contact.get', id: contactId };
  if (Number.isInteger(companyId) && companyId > 0) return { method: 'crm.company.get', id: companyId };
  return null;
}

/**
 * The record that actually carries the client's phone number *and* display name.
 *
 * Lead/Contact/Company carry both directly. A Deal carries neither - it resolves through the
 * deal's primary contact, falling back to its company when there is no linked contact. A Smart
 * Process (SPA) item is the same, via whichever Contact/Company its "Client" field points at (only
 * present when the SPA type has isClientEnabled: 'Y' - crm.type.list). crm.item.get nests fields
 * under `item` and uses camelCase (contactId/companyId), unlike crm.deal.get's legacy
 * CONTACT_ID/COMPANY_ID - the two cannot share a parser despite meaning the same thing.
 */
async function clientRef(
  env: Env,
  portal: PortalRow,
  entityType: CrmEntityType,
  entityId: number,
  entityTypeId?: number,
): Promise<ClientRef | null> {
  if (entityType === 'deal') {
    const deal = await callMethod<{ CONTACT_ID?: string; COMPANY_ID?: string } | null>(
      env,
      portal,
      'crm.deal.get',
      { id: entityId },
    );
    return pickClient(Number(deal?.CONTACT_ID), Number(deal?.COMPANY_ID));
  }

  if (entityType === 'dynamic') {
    if (!entityTypeId) return null;
    const response = await callMethod<{ item?: { contactId?: number; companyId?: number } } | null>(
      env,
      portal,
      'crm.item.get',
      { entityTypeId, id: entityId },
    );
    return pickClient(Number(response?.item?.contactId), Number(response?.item?.companyId));
  }

  return { method: `crm.${entityType}.get`, id: entityId };
}

/** Lead/Contact/Company carry PHONE directly. Deal and dynamic (SPA) resolve via linked Client. */
export async function resolveEntityPhones(
  env: Env,
  portal: PortalRow,
  entityType: CrmEntityType,
  entityId: number,
  entityTypeId?: number,
): Promise<string[]> {
  const ref = await clientRef(env, portal, entityType, entityId, entityTypeId);
  return ref ? entityPhones(env, portal, ref.method, ref.id) : [];
}

/**
 * What to call the customer in the Open Line.
 *
 * Without this the chat is created as "Guest - <line name>", because a connector user Bitrix has
 * never been given a name for has nothing else to be called - compare inbound.ts, which has always
 * passed `name` and whose chats are titled properly. It is cosmetic on its own, but it is the most
 * visible half of "the click-to-chat chat looks like an empty stub"; the other half is the CRM
 * tracker, see startConversation.
 *
 * A Company has only TITLE where a Contact/Lead has NAME/LAST_NAME, so fall back rather than
 * assume. Undefined (no client linked, or a nameless record) simply omits the field.
 */
export async function resolveClientName(
  env: Env,
  portal: PortalRow,
  entityType: CrmEntityType,
  entityId: number,
  entityTypeId?: number,
): Promise<string | undefined> {
  const ref = await clientRef(env, portal, entityType, entityId, entityTypeId);
  if (!ref) return undefined;

  const record = await callMethod<{ NAME?: string; LAST_NAME?: string; TITLE?: string } | null>(
    env,
    portal,
    ref.method,
    { id: ref.id },
  );

  const full = [record?.NAME, record?.LAST_NAME].filter(Boolean).join(' ').trim();
  return full || record?.TITLE?.trim() || undefined;
}

export interface ChatMatch {
  phone: string;
  bitrixChatId: number;
  lastMessageAt: number | null;
}

/**
 * Existing conversations for this session across any of the entity's phone numbers. Matched on
 * wa_phone rather than wa_jid: the jid a real WhatsApp conversation ends up using (often a LID,
 * not the phone itself - docs/wasenderapi.md) isn't known ahead of a real message moving, but the
 * phone is known the instant an operator opens the tab.
 *
 * Scoped to `lineId` - the Open Line the session feeds *today* - because Bitrix pins a chat to
 * the line it was opened on and never migrates it (schema.sql's bitrix_line_id). Without this,
 * re-binding a number to a different line leaves every earlier row looking like a live
 * conversation, and the widget reopens a chat on a line that may no longer even be active: the
 * operator's reply then fails instantly inside Bitrix, emitting no connector event at all, which
 * is close to undiagnosable from the outside. Excluding them means click-to-chat starts a fresh
 * chat on the current line instead, which is the only outcome that can actually work. Rows
 * predating the bitrix_line_id migration hold NULL and are excluded on the same reasoning.
 */
export async function findChatMatches(
  env: Env,
  sessionId: string,
  lineId: number,
  phones: string[],
): Promise<ChatMatch[]> {
  if (phones.length === 0) return [];
  // chat_map holds one row per contact (inbound.ts's upsertChatMap), so this yields at most one
  // match per phone. Both spellings are matched: an inbound-first row stores cleanedSenderPn
  // verbatim, which may carry a leading '+' (docs/wasenderapi.md), while `phones` here are digits
  // only. Missing that row would send the operator into startConversation, minting a second chat
  // under canonicalChatId while upsertChatMap (which does match the '+' row) kept the old chat_id.
  const spellings = [...new Set(phones.flatMap((p) => [p, `+${p}`]))];
  const placeholders = spellings.map(() => '?').join(',');
  const { results } = await env.DB.prepare(
    `SELECT wa_phone, bitrix_chat_id, last_message_at FROM chat_map
     WHERE session_id = ? AND bitrix_line_id = ? AND wa_phone IN (${placeholders})
       AND bitrix_chat_id IS NOT NULL
     ORDER BY last_message_at DESC`,
  )
    .bind(sessionId, lineId, ...spellings)
    .all<{ wa_phone: string; bitrix_chat_id: number; last_message_at: number | null }>();

  return results.map((r) => ({
    // Reported in the caller's own digits-only shape - the CRM tab matches on it (CrmTab.tsx).
    phone: normalizePhoneDigits(r.wa_phone),
    bitrixChatId: r.bitrix_chat_id,
    lastMessageAt: r.last_message_at,
  }));
}

interface SendMessagesResult {
  SUCCESS: boolean;
  DATA?: {
    RESULT?: Array<{ SUCCESS: boolean; session?: { ID: string; CHAT_ID: string } }>;
  };
}

/**
 * Operator-initiated ("click to chat") conversation start, called from the CRM detail tab when no
 * existing chat_map match was found for the chosen phone (routes/api.ts, POST /api/crm/start).
 *
 * Bitrix's connector API has no "open a blank chat" primitive - imconnector.send.messages is the
 * only way to create a chat, and it always requires real message content attributed to the
 * external (customer) side; there is no separate "start a new chat, then let the operator type"
 * step. Mirroring how other WhatsApp connector apps solve this, a synthetic system-style opener is
 * sent instead of a real customer message, purely to make Bitrix create the chat/session - it is
 * never forwarded to WhatsApp itself.
 *
 * This deliberately does NOT pass `disable_crm: 'Y'`, despite that reading like the safe choice for
 * a chat opened from a CRM record that obviously must not spawn a duplicate lead. Per the method's
 * own documentation the flag "disables the CRM tracker for the message" - the whole tracker, not
 * just lead creation. The tracker is what attaches the deal, saves the contact's details, and
 * performs the responsible-person routing; measured against ChatApp on acp.bitrix24.com
 * 2026-08-11, it is what emits every system line in a healthy Open Line chat ("Deal attached to
 * conversation", "Contact information saved to the contact", "Enquiry redirected to <operator>
 * (CRM's responsible person)"). Suppressing it is what left click-to-chat chats looking like empty
 * stubs.
 *
 * The duplicate-entity worry the flag was guarding against is real but is handled by the tracker
 * itself: it creates a new entity only when it cannot match an existing one on the phone number,
 * and click-to-chat starts from a CRM record whose phone we just read, so there is always one to
 * match. The reference app demonstrates this - its chat reports "Deal attached to conversation"
 * against the pre-existing deal 7608 rather than creating a second one.
 *
 * That does put weight on the phone matching. On a line whose CRM_CREATE is not 'none' (line 4 on
 * b24-ynumvs is 'deal', where an unmatched conversation really does mint a deal - that is where
 * "Guest - Whatsapp" #976 came from) a formatting mismatch between `phone` here and the number on
 * the CRM record would show up as a duplicate deal per click. Worth watching on the first live
 * run against such a line.
 */
export async function startConversation(
  env: Env,
  portal: PortalRow,
  session: { id: string; bitrix_line_id: number | null },
  phone: string,
  /** Customer's display name. Falls back to the phone number - never left unset, see below. */
  displayName?: string,
): Promise<number> {
  if (!session.bitrix_line_id) {
    throw new Error('session is not bound to an Open Line');
  }

  // inbound.ts's canonicalChatId - the very same `<digits>@s.whatsapp.net` this has always used,
  // shared so a chat opened here and one the customer opens first can never disagree on chat.id.
  // Only reached when findChatMatches found no row for this phone; once the customer replies (under
  // any jid, LID included) inbound.ts resolves them by phone and posts under this same id.
  const jid = canonicalChatId(phone);
  const result = await callMethod<SendMessagesResult>(env, portal, 'imconnector.send.messages', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: session.bitrix_line_id,
    MESSAGES: [
      {
        // `name` is never omitted: with no name Bitrix invents "Guest", and the CRM tracker then
        // propagates that into the contact and the deal it creates ("Guest - Whatsapp"). The phone
        // number is a poor name but an unambiguous one - see inbound.ts's displayName.
        user: { id: phone, phone, name: displayName || `+${phone}` },
        message: {
          id: uuid(),
          date: nowSec(),
          text: `SYSTEM MESSAGE: Chat session opened for +${phone}`,
        },
        chat: { id: jid },
      },
    ],
  });

  const entry = result.DATA?.RESULT?.[0];
  if (!result.SUCCESS || !entry?.SUCCESS || !entry.session?.CHAT_ID) {
    throw new Error('imconnector.send.messages reported failure for a click-to-chat open');
  }

  await upsertChatMap(env, session.id, jid, phone, jid, entry.session.CHAT_ID, session.bitrix_line_id);
  return Number(entry.session.CHAT_ID);
}
