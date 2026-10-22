import { callMethod } from './bitrix';
import { setChatName } from './connector';
import { getPortalById } from './db';
import * as license from './license';
import { getSessionById, sessionApiKey } from './sessions';
import type { Env, InboundNoteQueueMessage, InboundQueueMessage, PortalRow, SessionRow } from './types';
import { conversationsThisMonth, recordConversationInitiated } from './usage';
import { normalizeEchoText, nowSec, uuid } from './util';
import { MEDIA_MESSAGE_KEYS, type InboundMessage, wasender } from './wasender';
import { transcribeAudio } from './transcription';

/**
 * message_log.direction values this file writes. Never 'outbound' - that's outbound.ts's. 'event'
 * rows exist only as the idempotency claim for a posted note (processInboundNote), keyed by its
 * eventId rather than a WhatsApp message id.
 */
type InboundDirection = 'inbound' | 'app_outbound' | 'event';

/** How far back to look for an outbound send an upsert echo might match. See detectOutboundEcho. */
const ECHO_MATCH_WINDOW_SECONDS = 10 * 60;
/**
 * The same window for a captionless media echo, where the only evidence is "we sent something to
 * this contact just now with no caption, and something with no caption just came back". Deliberately
 * far shorter than the text window: an unrelated photo taken on the phone a few minutes later must
 * not be mistaken for our own send, and unlike a text match there is no content to tell them apart.
 */
const MEDIA_ECHO_MATCH_WINDOW_SECONDS = 2 * 60;

/**
 * How long to keep re-enqueueing a message whose session isn't bound to an Open Line yet (see
 * connector-settings in ui/src/components/ConnectorSettings.tsx). Deliberately NOT driven by the
 * queue's own retry count / max_retries: that budget is reserved for genuine failures (Bitrix
 * down, auth broken) so those dead-letter quickly, while a merely-unbound session gets a full day
 * for an operator to notice and bind it.
 */
const BIND_WAIT_CUTOFF_MS = 24 * 60 * 60 * 1000;
const BIND_WAIT_DELAY_SECONDS = 5 * 60;

interface SendMessagesResult {
  SUCCESS: boolean;
  DATA?: {
    RESULT?: Array<{ SUCCESS: boolean; session?: { ID: string; CHAT_ID: string } }>;
  };
}

/** wa_jid ending in @g.us is a WhatsApp group - see schema.sql's wa_phone comment. */
const isGroupJid = (waJid: string): boolean => waJid.endsWith('@g.us');

/** A session past the holdForBind guard: its Open Line is known, so chat_map rows can record it. */
type BoundSession = SessionRow & { bitrix_line_id: number };

/**
 * One inbound WhatsApp message, end to end: wait for a Line binding if needed, decrypt any media,
 * call imconnector.send.messages, and record the mapping/log rows phase 4 will need.
 *
 * Returning normally means "ack this delivery" (covers both success and "handled by
 * re-enqueueing a fresh one" - see holdForBind). Throwing means "let Cloudflare Queues retry",
 * which is the only path that leads to the dead-letter queue.
 */
export async function processInboundMessage(
  env: Env,
  msg: InboundQueueMessage | InboundNoteQueueMessage,
): Promise<void> {
  if (msg.kind === 'note') {
    await processInboundNote(env, msg);
    return;
  }

  const session = await getSessionById(env, msg.sessionId);
  if (!session) return; // Deleted while this message was in flight - nothing to deliver to.

  if (session.bitrix_line_id === null) {
    await holdForBind(env, msg);
    return;
  }
  const bound: BoundSession = { ...session, bitrix_line_id: session.bitrix_line_id };

  if (msg.appSent) {
    await processAppSentMessage(env, bound, msg);
    return;
  }

  const waJid = msg.message.key.remoteJid;
  // A group (wa_jid ending @g.us) is addressed as a single Bitrix "user" identified by the
  // group's own JID, never by whichever participant sent a given message - see schema.sql's
  // wa_phone comment. cleanedSenderPn/cleanedParticipantPn are per-participant and would
  // otherwise scatter one group's messages across a different Bitrix chat per sender (CHAT_GROUP:
  // false in connector.ts threads by user.id, not chat.id).
  const waPhone = isGroupJid(waJid)
    ? waJid
    : (msg.message.key.cleanedSenderPn ?? msg.message.key.cleanedParticipantPn);
  const waMessageId = msg.message.key.id;

  if (!waPhone) {
    // Bitrix needs a real phone (or, for a group, the group JID) for user.id/phone - without one
    // there is nothing to build a chat from, and no amount of retrying changes that.
    await writeTerminalLog(env, session.id, 'inbound', waMessageId, 'NO_PHONE_NUMBER');
    return;
  }

  const claim = await claimMessageLog(env, session.id, 'inbound', waMessageId);
  if (!claim.proceed) return; // Already sent, or already given up on, by an earlier delivery.

  const portal = await getPortalById(env, session.portal_id);
  if (!portal) throw new Error(`session ${session.id} references missing portal ${session.portal_id}`);

  // The contact is identified by phone, never by jid: WhatsApp flips the same person between their
  // phone jid and their LID jid (per contact, at any point mid-conversation), so a jid-keyed lookup
  // treated the flip as a brand-new contact. See findContactChat.
  const contact = await findContactChat(env, session.id, waJid, [waPhone]);

  // A conversation is "new" iff no chat_map row exists yet for this contact - only new
  // conversations are gated by the license, exactly like max_numbers only gates provisioning a
  // brand new session rather than using an existing one. Checked before spending a Wasender
  // decrypt-media call or a Bitrix REST call.
  const isNewConversation = !contact;
  if (isNewConversation) {
    const blocked = await checkConversationQuota(env, portal, claim.id);
    if (blocked) return;
  }

  const files = await buildFiles(env, session, msg.message);
  // Reply context (the ad creative a customer answered, or the message they replied to) rides
  // contextInfo, which no previous version of this path ever read - the operator got the bare
  // text with no idea what it was answering. Rendered before the Bitrix call so the thumbnail's
  // 1h validity window (buildFiles/decryptMedia) is not extended either.
  const context = replyContext(msg.message);
  if (context?.file) files.push(context.file);
  if (context) {
    // Shape evidence, not content: the Wasender API docs document contextInfo only by example,
    // so the first real ad reply through production tells us whether externalAdReply really
    // carries a plaintext thumbnailUrl here or something else entirely.
    console.log(
      JSON.stringify({
        msg: 'inbound reply context rendered',
        sessionId: session.id,
        waMessageId,
        contextFields: context.fields,
        hasAdThumbnail: Boolean(context.file),
      }),
    );
  }

  // Phase 2: audio transcription hook.
  // When transcription is enabled and the inbound message carries audio,
  // transcribe it and prepend the text to the message before sending to Bitrix.
  if (files[0] && files.length > 0 && isAudioFile(files[0].name)) {
    const transcription = await transcribeAudio(files[0].url);
    // Phase 2: transcription result would be prepended to message text.
    // e.g. msg.message.messageBody = `[Transcrição: ${transcription}]\n${msg.message.messageBody ?? ''}`;
    void transcription; // consume lint: unused until Phase 2 wires it.
  }

  const { name: contactName, picture: contactPicture } = await resolveContact(
    env,
    session,
    waJid,
    waPhone,
    contact,
  );

  // The external chat.id Bitrix finds/creates the Open Line chat by (CONNECTOR+LINE+CHAT_ID; user.id
  // also participates while CHAT_GROUP is false). It used to be the raw remoteJid, so a contact
  // whose jid flipped from phone to LID got a SECOND Bitrix chat and the operator's open one went
  // silent - "my messages are sent but incoming never arrives". Observed on two lines: line 2,
  // 5511999999999 in chats 5398 (phone jid) + 5400 (LID); line 3, 971500000000 in 160777 + 160779, created
  // 3 minutes apart mid-conversation. Now: whatever id the chat was created with (chat_map.chat_id),
  // or the deterministic canonical id for a contact Bitrix has never seen.
  const chatId = contact ? resolveChatId(contact) : newChatId(waJid, waPhone);

  const result = await callMethod<SendMessagesResult>(env, portal, 'imconnector.send.messages', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: session.bitrix_line_id,
    MESSAGES: [
      {
        // There is no separate "start a new chat" call - the first message for an unseen chat.id
        // just becomes the first message of a new chat. Which is exactly why chat.id has to be
        // stable per contact (see chatId above).
        user: {
          id: waPhone,
          phone: waPhone,
          name: displayName(waJid, waPhone, contactName),
          // The Bitrix user object accepts picture: {url}. Omitted when no picture is known - a
          // missing avatar is cosmetic and must never cost the message.
          ...(contactPicture ? { picture: { url: contactPicture } } : {}),
          // waPhone is the group's JID for a group, not a real phone number - Bitrix's default
          // phone validation before saving to CRM would otherwise reject it outright (per-entry
          // SUCCESS: false below, with no error text to explain why).
          ...(isGroupJid(waJid) ? { skip_phone_validate: 'Y' } : {}),
        },
        message: {
          id: waMessageId,
          date: msg.timestamp,
          text: withReplyContext(messageText(msg.message), context),
          files,
        },
        chat: { id: chatId },
      },
    ],
  });

  const entry = result.DATA?.RESULT?.[0];
  if (!result.SUCCESS || !entry?.SUCCESS) {
    throw new Error(
      `imconnector.send.messages reported failure for message ${waMessageId}: ${JSON.stringify(entry ?? result)}`,
    );
  }

  if (entry.session?.CHAT_ID) {
    await upsertChatMap(
      env,
      session.id,
      waJid,
      waPhone,
      chatId,
      entry.session.CHAT_ID,
      session.bitrix_line_id,
      contactName,
      contactPicture,
    );
    if (isNewConversation) await recordConversationInitiated(env, portal.id);
  }

  await env.DB.prepare("UPDATE message_log SET status = 'sent' WHERE id = ?").bind(claim.id).run();

  // user.name only names the Bitrix *user*; the chat keeps Bitrix's default title until
  // imconnector.chat.name.set runs, which nothing here ever called before. Runs after the message
  // is already marked sent: a rename failure can never turn a delivered message into a retry.
  // A brand-new contact had no row at the lookup above, so it is re-read here - one extra SELECT
  // per new contact, and the row the upsert just wrote.
  await maybeRenameChat(
    env,
    portal,
    bound,
    contact ?? (await findContactChat(env, session.id, waJid, [waPhone])),
    contactName,
  );
}

/**
 * Title the Open Line chat after the customer (connector.ts's setChatName) whenever the chat still
 * needs it: a real name is known and the chat was either never titled or the name changed.
 * chat_map.chat_named records that the call ran, so every later message from an already-titled
 * chat costs nothing - and a chat that existed before chat_named did (chat_named 0) gets titled on
 * its next message, which is how every pre-existing chat finally shows the customer's name.
 *
 * Best-effort: the message it follows has already been delivered, so a failure (CHAT_RENAMING_FAILED
 * for a session Bitrix has closed, network, auth) is logged and swallowed, and chat_named stays 0
 * so the next message retries.
 */
async function maybeRenameChat(
  env: Env,
  portal: PortalRow,
  session: BoundSession,
  contact: Pick<ContactChatRow, 'id' | 'chat_id' | 'wa_jid' | 'wa_phone' | 'wa_name' | 'chat_named'> | null,
  name: string | undefined,
): Promise<void> {
  // displayName's "+phone" fallback is not a name worth titling a chat with, and a contact with no
  // row has no chat to title.
  if (!name || !contact?.wa_phone) return;
  if (contact.chat_named && name === contact.wa_name) return;

  const chatId = resolveChatId(contact);
  try {
    await setChatName(env, portal, {
      lineId: session.bitrix_line_id,
      chatId,
      userId: contact.wa_phone,
      name,
    });
    await env.DB.prepare('UPDATE chat_map SET chat_named = 1 WHERE id = ?').bind(contact.id).run();
  } catch (err) {
    console.warn(
      JSON.stringify({
        msg: 'imconnector.chat.name.set failed - chat keeps its previous title',
        sessionId: session.id,
        chatId,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

/**
 * The deterministic external chat.id for a contact Bitrix has never seen: the phone jid, digits
 * only. Byte-for-byte what crm.ts's startConversation (click-to-chat) has always created chats
 * with, so a conversation the operator opens and one the customer opens land on the same id - the
 * old remoteJid-as-chat.id guaranteed a second chat the moment a click-to-chat contact replied
 * under their LID. Digits only because cleanedSenderPn may or may not carry a leading '+'
 * (docs/wasenderapi.md) and a '+' would make it neither a real jid nor crm.ts's id.
 */
export function canonicalChatId(phone: string): string {
  return `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
}

/**
 * chat.id for a contact with no chat_map row yet. A group keeps its own jid: unlike a private
 * contact's, a group jid never flips, it is already what wa_phone holds for a group (schema.sql),
 * and every existing group chat in Bitrix was created under it.
 */
function newChatId(waJid: string, waPhone: string): string {
  return isGroupJid(waJid) ? waJid : canonicalChatId(waPhone);
}

/** The phone a phone jid embeds (`5511964253002@s.whatsapp.net`, device suffix dropped); null for LIDs/groups. */
export function phoneFromJid(jid: string): string | null {
  if (!jid.endsWith('@s.whatsapp.net')) return null;
  const digits = (jid.split('@')[0] ?? '').split(':')[0]?.replace(/\D/g, '') ?? '';
  return digits || null;
}

/**
 * Every spelling one phone may have been stored under in wa_phone: cleanedSenderPn arrives with or
 * without a leading '+' (docs/wasenderapi.md), crm.ts stores digits only, and nothing ever
 * normalised what was written. A group jid is matched verbatim.
 */
function phoneVariants(phones: Array<string | null | undefined>): string[] {
  const out = new Set<string>();
  for (const phone of phones) {
    if (!phone) continue;
    out.add(phone);
    if (phone.includes('@')) continue;
    const digits = phone.replace(/\D/g, '');
    if (digits) {
      out.add(digits);
      out.add(`+${digits}`);
    }
  }
  return [...out];
}

export interface ContactChatRow {
  id: string;
  chat_id: string | null;
  wa_jid: string;
  wa_phone: string | null;
  wa_name: string | null;
  wa_picture: string | null;
  chat_named: number | null;
  bitrix_line_id: number | null;
}

/**
 * WHERE fragment matching "this contact's row": by phone (any spelling), or by a jid it has been
 * seen under (wa_jid) or created with (chat_id). Phone is the identity; the jid arms only matter
 * when no phone is known (an app-sent upsert under a LID, a reaction note) or for a legacy row.
 */
function contactMatch(waJid: string | null, phones: Array<string | null | undefined>) {
  const variants = phoneVariants(phones);
  const arms: string[] = [];
  const binds: string[] = [];
  if (waJid) {
    arms.push('wa_jid = ?', 'chat_id = ?');
    binds.push(waJid, waJid);
  }
  if (variants.length) {
    arms.push(`wa_phone IN (${variants.map(() => '?').join(',')})`);
    binds.push(...variants);
  }
  return { sql: arms.length ? `(${arms.join(' OR ')})` : '0', binds };
}

/**
 * The one chat_map row for a contact, whichever jid this message happens to use. Newest first so
 * that, until DEPLOY.md's dedupe has run, a contact still holding two rows (one per jid) resolves
 * to the live conversation - the same row the dedupe keeps.
 */
export function findContactChat(
  env: Env,
  sessionId: string,
  waJid: string | null,
  phones: Array<string | null | undefined>,
): Promise<ContactChatRow | null> {
  const match = contactMatch(waJid, phones);
  return env.DB.prepare(
    `SELECT id, chat_id, wa_jid, wa_phone, wa_name, wa_picture, chat_named, bitrix_line_id FROM chat_map
     WHERE session_id = ? AND ${match.sql}
     ORDER BY last_message_at DESC
     LIMIT 1`,
  )
    .bind(sessionId, ...match.binds)
    .first<ContactChatRow>();
}

/**
 * The chat.id Bitrix knows this contact's chat by. A row from before chat_map.chat_id existed (or
 * before DEPLOY.md's backfill ran) falls back to wa_jid, which was always the chat.id back then -
 * and upsertChatMap copies it into chat_id before it ever moves wa_jid.
 */
export function resolveChatId(row: Pick<ContactChatRow, 'chat_id' | 'wa_jid'>): string {
  return row.chat_id ?? row.wa_jid;
}

/**
 * License gate for a brand new conversation. Returns true (and marks the claimed message_log row
 * 'failed') when the portal is unlicensed or has hit its monthly conversation cap; false means
 * proceed. A no-op entirely while LICENSE_ENFORCE=false (wrangler.jsonc), same switch api.ts's
 * session-limit gate uses.
 */
async function checkConversationQuota(env: Env, portal: PortalRow, claimId: string): Promise<boolean> {
  if (!license.isEnforced(env)) return false;

  const snap = await license.snapshot(env, portal);
  if (!snap.licensed) {
    await writeQuotaFailure(env, claimId, 'LICENSE_INACTIVE');
    return true;
  }

  const maxConversations =
    typeof snap.features.max_conversations_per_month === 'number' ? snap.features.max_conversations_per_month : null;
  if (maxConversations !== null && (await conversationsThisMonth(env, portal.id)) >= maxConversations) {
    await writeQuotaFailure(env, claimId, 'LICENSE_CONVERSATION_LIMIT');
    return true;
  }

  return false;
}

function writeQuotaFailure(env: Env, claimId: string, error: string): Promise<unknown> {
  return env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
    .bind(error, claimId)
    .run();
}

/** A batch from the dead-letter queue: Cloudflare gave up retrying. Record it and stop. */
export async function markDeadLettered(
  env: Env,
  msg: InboundQueueMessage | InboundNoteQueueMessage,
): Promise<void> {
  if (msg.kind === 'note') {
    await writeTerminalLog(env, msg.sessionId, 'event', msg.eventId, 'DEAD_LETTERED');
    return;
  }
  const direction: InboundDirection = msg.appSent ? 'app_outbound' : 'inbound';
  const claim = await claimMessageLog(env, msg.sessionId, direction, msg.message.key.id);
  if (!claim.proceed) return; // Already resolved (sent, or a terminal failure) some other way.

  await env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
    .bind('DEAD_LETTERED', claim.id)
    .run();
}

async function holdForBind(env: Env, msg: InboundQueueMessage): Promise<void> {
  if (Date.now() - msg.firstAttemptAt > BIND_WAIT_CUTOFF_MS) {
    const direction: InboundDirection = msg.appSent ? 'app_outbound' : 'inbound';
    await writeTerminalLog(env, msg.sessionId, direction, msg.message.key.id, 'NO_LINE_BOUND_TIMEOUT');
    return;
  }

  await env.INBOUND_QUEUE.send(
    { ...msg, bindWaitCount: msg.bindWaitCount + 1 },
    { delaySeconds: BIND_WAIT_DELAY_SECONDS },
  );
}

/**
 * A call/reaction/deletion note (routes/webhook.ts) posted into the contact's existing Open Line
 * chat. Never starts a conversation: an event about a chat Bitrix has never seen on the current
 * line has nothing to annotate, and creating one here would bypass checkConversationQuota. Same
 * disable_crm rule as processAppSentMessage - a note is not the customer writing in.
 */
async function processInboundNote(env: Env, msg: InboundNoteQueueMessage): Promise<void> {
  const session = await getSessionById(env, msg.sessionId);
  if (!session) return;

  const claim = await claimMessageLog(env, session.id, 'event', msg.eventId);
  if (!claim.proceed) return;

  const fail = (error: string) =>
    env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
      .bind(error, claim.id)
      .run();

  if (session.bitrix_line_id === null) {
    await fail('NO_LINE_BOUND');
    return;
  }

  // Resolved by phone like every other inbound path, so a note arriving under the contact's other
  // jid still lands in their one chat. Reaction/delete payloads may carry a bare "+1234567890"
  // rather than a jid (the Wasender API docs); a phone jid embeds the number; a LID carries none
  // and can only match by jid; a group's "phone" is its own jid (schema.sql's wa_phone).
  const remote = msg.remoteJid;
  const notePhone = isGroupJid(remote) ? remote : remote.includes('@') ? phoneFromJid(remote) : remote;
  const chat = await findContactChat(env, session.id, remote, [notePhone]);
  // Same line scoping as before: a chat Bitrix pinned to a line this session no longer feeds has
  // nothing to annotate (schema.sql's bitrix_line_id).
  if (!chat?.wa_phone || chat.bitrix_line_id !== session.bitrix_line_id) {
    await fail('NO_CHAT');
    return;
  }

  const portal = await getPortalById(env, session.portal_id);
  if (!portal) throw new Error(`session ${session.id} references missing portal ${session.portal_id}`);

  const name = displayName(chat.wa_jid, chat.wa_phone, chat.wa_name ?? undefined);
  const result = await callMethod<SendMessagesResult>(env, portal, 'imconnector.send.messages', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: session.bitrix_line_id,
    MESSAGES: [
      {
        user: {
          id: chat.wa_phone,
          phone: chat.wa_phone,
          name,
          ...(isGroupJid(chat.wa_jid) ? { skip_phone_validate: 'Y' } : {}),
        },
        message: {
          id: msg.eventId,
          date: msg.timestamp,
          text: msg.text.replaceAll('{contact}', name),
          disable_crm: 'Y',
        },
        chat: { id: resolveChatId(chat) },
      },
    ],
  });

  const entry = result.DATA?.RESULT?.[0];
  if (!result.SUCCESS || !entry?.SUCCESS) {
    throw new Error(
      `imconnector.send.messages reported failure for note ${msg.eventId}: ${JSON.stringify(entry ?? result)}`,
    );
  }

  await env.DB.prepare("UPDATE message_log SET status = 'sent' WHERE id = ?").bind(claim.id).run();
}

/**
 * A messages.upsert delivery with fromMe: true - either a message genuinely typed on the
 * business phone's WhatsApp app (post to Bitrix, labeled SENT FROM MOBILE) or Wasender's own echo
 * of a message the connector just sent through outbound.ts (recognize it and skip). Both share one
 * idempotency claim keyed by the WhatsApp message id, taken before the echo check runs, so a
 * webhook redelivery can never re-run the match against an already-claimed outbound row or post
 * to Bitrix twice - see claimMessageLog.
 */
async function processAppSentMessage(
  env: Env,
  // Reached only past processInboundMessage's holdForBind guard, so the Line is always bound by
  // now - stated in the type so upsertChatMap's bitrixLineId doesn't need a non-null assertion.
  session: BoundSession,
  msg: InboundQueueMessage,
): Promise<void> {
  const waJid = msg.message.key.remoteJid;
  const waMessageId = msg.message.key.id;
  const text = messageText(msg.message);

  const claim = await claimMessageLog(env, session.id, 'app_outbound', waMessageId);
  if (!claim.proceed) return;

  // Resolve the contact once, by phone, for both the echo match and the post below. A fromMe
  // upsert frequently arrives under a different jid than the contact's chat lives under - we send
  // by phone, so Wasender echoes come back under the phone jid while the chat may live under a LID
  // (or the reverse) - and the old wa_jid-only lookup then found nothing: 216 of 219 sends on the
  // customer's line failed NO_PHONE_NUMBER in one day. Candidate phones: the number a phone jid
  // embeds (for fromMe, remoteJid is the *recipient*, so this is the contact), plus the same
  // cleanedSenderPn/cleanedParticipantPn expression the customer path uses - except when it is the
  // session's own number, which a fromMe key may carry instead of the contact's (docs/wasenderapi.md).
  const contact = await findContactChat(
    env,
    session.id,
    waJid,
    isGroupJid(waJid) ? [waJid] : [phoneFromJid(waJid), contactPnFromAppSent(session, msg)],
  );

  const hasMedia = findMedia(msg.message.message) !== null;
  const echoedOutboundId = await detectOutboundEcho(env, session.id, waJid, contact, text, hasMedia);
  if (echoedOutboundId) {
    await env.DB.prepare("UPDATE message_log SET echo_message_id = ? WHERE id = ?")
      .bind(waMessageId, echoedOutboundId)
      .run();
    await env.DB.prepare("UPDATE message_log SET status = 'echo' WHERE id = ?").bind(claim.id).run();
    return;
  }

  // Not a recognized echo - genuinely typed on the phone. Bitrix's user.id/phone needs the
  // *contact's* number, taken from chat_map (resolved above) rather than trusted from the upsert's
  // own fields. No row means the contact was never seen and there is no chat to post into - this
  // path never starts a conversation (that would bypass checkConversationQuota).
  const chat = contact;

  if (!chat?.wa_phone) {
    await env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
      .bind('NO_PHONE_NUMBER', claim.id)
      .run();
    return;
  }

  const portal = await getPortalById(env, session.portal_id);
  if (!portal) throw new Error(`session ${session.id} references missing portal ${session.portal_id}`);

  const files = await buildFiles(env, session, msg.message);
  // A message typed on the phone can itself be a reply to an ad or to an earlier message - same
  // contextInfo gap as the customer path above. `text` stays undecorated on purpose: it is what
  // detectOutboundEcho already matched against, and re-deriving it here would break that.
  const context = replyContext(msg.message);
  if (context?.file) files.push(context.file);
  const label = withReplyContext(
    text ? `[SENT FROM MOBILE] ${text}` : 'SENT FROM MOBILE',
    context,
  );

  // The contact's one chat, whichever jid this upsert came in under - see processInboundMessage.
  const chatId = resolveChatId(chat);

  const result = await callMethod<SendMessagesResult>(env, portal, 'imconnector.send.messages', {
    CONNECTOR: env.CONNECTOR_ID,
    LINE: session.bitrix_line_id,
    MESSAGES: [
      {
        user: {
          id: chat.wa_phone,
          phone: chat.wa_phone,
          // Same "never leave Bitrix to invent Guest" rule as processInboundMessage. This path can
          // create the Bitrix contact just as easily - a conversation started from the phone
          // reaches Bitrix here first.
          name: displayName(waJid, chat.wa_phone, chat.wa_name ?? undefined),
          ...(chat.wa_picture ? { picture: { url: chat.wa_picture } } : {}),
          // See processInboundMessage's identical skip_phone_validate comment - chat.wa_phone is
          // the group's JID for a group row, not a real phone number.
          ...(isGroupJid(waJid) ? { skip_phone_validate: 'Y' } : {}),
        },
        message: {
          id: waMessageId,
          date: msg.timestamp,
          text: label,
          files,
          // Operator-sent content, not the customer speaking - must not re-trigger CRM tracking
          // (lead/deal creation, SLA timers) as if it were an inbound customer message.
          disable_crm: 'Y',
        },
        chat: { id: chatId },
      },
    ],
  });

  const entry = result.DATA?.RESULT?.[0];
  if (!result.SUCCESS || !entry?.SUCCESS) {
    throw new Error(
      `imconnector.send.messages reported failure for app-sent message ${waMessageId}: ${JSON.stringify(entry ?? result)}`,
    );
  }

  if (entry.session?.CHAT_ID) {
    await upsertChatMap(
      env,
      session.id,
      waJid,
      chat.wa_phone,
      chatId,
      entry.session.CHAT_ID,
      session.bitrix_line_id,
      chat.wa_name ?? undefined,
    );
  }

  await env.DB.prepare("UPDATE message_log SET status = 'sent' WHERE id = ?").bind(claim.id).run();

  // A message typed on the business phone can be the first thing a never-titled chat ever sees -
  // same rename as the customer path, best-effort, with the name already cached on the row.
  await maybeRenameChat(env, portal, session, chat, chat.wa_name ?? undefined);
}

/**
 * messages.upsert echoes both what was typed on the phone and what the connector itself sent through
 * outbound.ts, and there is no id shared between an outbound send and its webhook echo to join
 * on (see schema.sql's comment on message_log's echo_* columns). This is a pragmatic stand-in:
 * match against a 'sent' outbound row in the same session, sent within the last ten minutes, not
 * already claimed by an earlier echo, whose target (jid or phone) and normalized text match this
 * upsert exactly.
 *
 * An empty normalized text is too weak a signal on its own and would risk swallowing a genuine
 * app-sent message, so it only matches when this upsert carries media (`hasMedia`) and only inside
 * a much tighter window. That case is not hypothetical: an operator sending a photo with no
 * comment produces exactly it, since outbound.ts records the caption as echo_text and there is no
 * caption. Without it, every image sent from the Open Line comes straight back in as a
 * "[SENT FROM MOBILE]" message and the operator sees their own attachment twice.
 *
 * An outbound row is claimed by at most one echo (echo_message_id), so a reply that left as
 * several WhatsApp messages - a voice note plus its text, the only case outbound.ts splits - can
 * still have its second echo posted back as app-sent. Rare enough to leave for the id-based join.
 *
 * False negatives (a real app-typed message that happens to repeat a recent outbound send
 * verbatim) fail safe: it gets posted to Bitrix as a duplicate rather than silently dropped.
 * Replace this with an id-based join the moment messages.update is confirmed to carry the
 * WhatsApp id alongside Wasender's own msgId.
 *
 * The target is matched primarily by phone - `contact` is the chat_map row processAppSentMessage
 * resolved by phone (any jid), so its wa_phone is exactly what outbound.ts recorded as echo_phone
 * for this contact. That is what makes an echo arriving under a different jid than the send was
 * recorded with still match: we send by phone, so the echo frequently comes back under the phone
 * jid while echo_jid holds the LID the chat lives under. The echo_jid equality arms stay as a
 * fallback (this upsert's own jid, or the contact's chat.id, which is what outbound.ts records as
 * echo_jid).
 */
async function detectOutboundEcho(
  env: Env,
  sessionId: string,
  waJid: string,
  contact: Pick<ContactChatRow, 'wa_phone' | 'chat_id' | 'wa_jid'> | null,
  text: string,
  hasMedia = false,
): Promise<string | null> {
  const normalizedText = normalizeEchoText(text);
  if (!normalizedText && !hasMedia) return null;

  const candidatePhone = contact?.wa_phone ?? null;
  const contactChatId = contact ? resolveChatId(contact) : waJid;

  const cutoff = nowSec() - (normalizedText ? ECHO_MATCH_WINDOW_SECONDS : MEDIA_ECHO_MATCH_WINDOW_SECONDS);
  const row = await env.DB.prepare(
    `SELECT id FROM message_log
     WHERE session_id = ? AND direction = 'outbound' AND status = 'sent' AND echo_message_id IS NULL
       AND created_at >= ? AND echo_text = ?
       AND (echo_jid = ? OR echo_jid = ? OR (? IS NOT NULL AND echo_phone = ?))
     ORDER BY created_at DESC
     LIMIT 1`,
  )
    .bind(sessionId, cutoff, normalizedText, waJid, contactChatId, candidatePhone, candidatePhone)
    .first<{ id: string }>();

  return row?.id ?? null;
}

/**
 * The contact's number from a fromMe key, if it really is the contact's: the same
 * cleanedSenderPn ?? cleanedParticipantPn expression as the customer path, discarded when it is
 * the session's own number - for a fromMe message those fields may carry the business number
 * instead (docs/wasenderapi.md), and resolving a chat by it would find nothing (or the wrong row).
 */
function contactPnFromAppSent(session: SessionRow, msg: InboundQueueMessage): string | null {
  const pn = msg.message.key.cleanedSenderPn ?? msg.message.key.cleanedParticipantPn;
  if (!pn) return null;
  const own = (session.phone_number ?? '').replace(/\D/g, '');
  return own && pn.replace(/\D/g, '') === own ? null : pn;
}

/**
 * Fetch the one media envelope a WhatsApp message can carry (if any) and decrypt it via Wasender.
 * The returned URL is only valid for an hour (see wasender.ts, decryptMedia), so this must run
 * immediately before the Bitrix call, never earlier.
 */
async function buildFiles(
  env: Env,
  session: SessionRow,
  message: InboundMessage,
): Promise<Array<{ url: string; name: string }>> {
  const media = findMedia(message.message);
  if (!media) return [];

  const apiKey = await sessionApiKey(env, session);
  // Deliberately the whole original message, wrapper and all: decrypt-media takes the webhook's
  // own data.messages object verbatim (wasender.ts), so unwrapping is only ever used to read the
  // envelope's own fields, never to reshape what gets sent for decryption.
  const publicUrl = await wasender(env).decryptMedia(apiKey, message);

  const name = media.body.fileName ?? guessFileName(media.key, media.body);
  return [{ url: publicUrl, name }];
}

const AUDIO_EXTENSIONS = new Set(['ogg', 'opus', 'mp3', 'm4a', 'aac', 'wav', 'amr', 'oga', 'weba']);

/** Check if a file name suggests an audio file (for transcription hook). */
export function isAudioFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return AUDIO_EXTENSIONS.has(ext);
}

/**
 * What the customer actually wrote. `messageBody` is the plain text of a text message, but a photo
 * sent with a comment carries that comment as the media envelope's own `caption` and leaves
 * messageBody empty - so without this the operator sees the image with no message attached to it.
 */
export function messageText(message: InboundMessage): string {
  if (message.messageBody) return message.messageBody;
  return findMedia(message.message)?.body.caption ?? '';
}

/**
 * The two contextInfo payloads worth reading on an inbound message, both Baileys vocabulary:
 *
 * - `externalAdReply` rides click-to-WhatsApp ad traffic - the ad creative the customer tapped
 *   ("Replied to Ad" in the WhatsApp app): title, body, and usually a *plaintext* thumbnail URL.
 *   That creative is not a message in the thread, so without it the operator receives a bare
 *   "is this still available?" with no idea which ad/product it belongs to.
 * - `quotedMessage` is the message being replied to, present whenever the customer uses reply.
 *
 * Both are dropped wholesale by every path that used to exist here - see replyContext.
 */
export interface ReplyContextInfo {
  quotedMessage?: Record<string, unknown>;
  stanzaId?: string;
  participant?: string;
  externalAdReply?: {
    title?: string;
    body?: string;
    mediaType?: string | number;
    /** Often a plaintext http(s) URL (unlike first-party media, which arrives encrypted). */
    thumbnailUrl?: string;
    sourceUrl?: string;
    mediaUrl?: string;
  };
}

/**
 * contextInfo is not top-level: it sits on whichever envelope carries the message
 * (`extendedTextMessage.contextInfo`, `imageMessage.contextInfo`, ...), and a disappearing-messages
 * chat nests that envelope one level down - the same wrapper problem findMedia solves. Unlike
 * findMedia this scans *every* envelope key, because contextInfo is not confined to the five media
 * kinds: a text reply to an ad carries it on extendedTextMessage, a location reply on
 * locationMessage, and so on.
 */
export function findContextInfo(
  body: Record<string, unknown> | undefined,
): ReplyContextInfo | null {
  if (!body) return null;
  const direct = readContextInfo(body);
  if (direct) return direct;
  for (const wrapper of WRAPPER_MESSAGE_KEYS) {
    const inner = (body[wrapper] as { message?: Record<string, unknown> } | undefined)?.message;
    if (!inner) continue;
    const nested = readContextInfo(inner);
    if (nested) return nested;
  }
  return null;
}

function readContextInfo(body: Record<string, unknown>): ReplyContextInfo | null {
  for (const value of Object.values(body)) {
    if (!value || typeof value !== 'object' || !('contextInfo' in value)) continue;
    const info = (value as { contextInfo?: ReplyContextInfo }).contextInfo;
    if (info && typeof info === 'object') return info;
  }
  return null;
}

export interface ReplyContext {
  /** One or two lines to prepend to the message text (never the whole quoted body). */
  text: string;
  /** The ad's thumbnail, when it came as a plaintext URL Bitrix can fetch by itself. */
  file?: { url: string; name: string };
  /** Top-level keys of the contextInfo object that produced this - shape evidence for the logs. */
  fields: string[];
}

/**
 * Render a reply's context as text (and, for an ad, its thumbnail as an attachment) so the
 * operator in the Open Line sees what the customer was answering. Returns null when the message
 * carries no context, which keeps every non-reply message on exactly the old behaviour.
 *
 * Only the quoted message's *kind and a short snippet* are rendered - not a second copy of its
 * media. A quoted message that already reached this chat (an operator's own image, say) is in the
 * timeline above; re-attaching it would double every attachment. The case that genuinely needs
 * this is the ad creative, which never entered the thread at all.
 */
export function replyContext(message: InboundMessage): ReplyContext | null {
  const info = findContextInfo(message.message);
  if (!info) return null;

  const lines: string[] = [];
  let file: { url: string; name: string } | undefined;

  const ad = info.externalAdReply;
  if (ad && (ad.title || ad.body || ad.thumbnailUrl)) {
    lines.push(ad.title?.trim() ? `In reply to ad: ${ad.title.trim()}` : 'In reply to an ad');
    if (ad.body?.trim()) lines.push(ad.body.trim());
    // Only a plaintext URL is attachable: first-party media arrives encrypted and would need a
    // decrypt-media call against a message Wasender never saw as a message of its own. A base64
    // jpegThumbnail is dropped rather than base64-encoded into a URL Bitrix cannot fetch.
    if (ad.thumbnailUrl?.startsWith('http')) {
      file = { url: ad.thumbnailUrl, name: adThumbnailName(ad.thumbnailUrl) };
    }
  }

  const quoted = describeQuotedMessage(info.quotedMessage);
  if (quoted) lines.push(`Replied to: ${quoted}`);

  if (lines.length === 0) return null;
  return { text: lines.join('\n'), ...(file ? { file } : {}), fields: Object.keys(info) };
}

function adThumbnailName(url: string): string {
  const path = url.split('?')[0] ?? '';
  const ext = (path.match(/\.([a-z0-9]{2,4})$/i)?.[1] ?? 'jpg').toLowerCase();
  return `ad-thumbnail.${ext}`;
}

/**
 * A one-line description of a quoted message: its kind plus a short snippet of whatever text it
 * carries (conversation text, extended text, or a media caption - the same three places
 * messageText reads). Unknown payloads collapse to their envelope name rather than vanishing.
 */
export function describeQuotedMessage(quoted: Record<string, unknown> | undefined): string | null {
  if (!quoted || typeof quoted !== 'object') return null;
  const media = findMedia(quoted);
  const extended = quoted.extendedTextMessage as { text?: string } | undefined;
  const text =
    typeof quoted.conversation === 'string'
      ? quoted.conversation
      : typeof extended?.text === 'string'
        ? extended.text
        : (media?.body.caption ?? '');
  const kind = media ? media.key.replace('Message', '') : 'text';
  const snippet = text.trim().slice(0, 200);
  return snippet ? `${kind} "${snippet}"` : kind;
}

/**
 * Prepend the context lines to what the customer wrote. Echo detection deliberately keeps using
 * the undecorated messageText (see processAppSentMessage): outbound sends never carry contextInfo,
 * so decorating before the match would stop an app-typed reply to an ad from ever matching its own
 * outbound row and would post it as a duplicate instead.
 */
function withReplyContext(text: string, ctx: ReplyContext | null): string {
  if (!ctx) return text;
  return text ? `${ctx.text}\n${text}` : ctx.text;
}

/** Envelopes that wrap another message rather than carrying media themselves. */
const WRAPPER_MESSAGE_KEYS = [
  'ephemeralMessage',
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
  'documentWithCaptionMessage',
] as const;

interface MediaEnvelope {
  key: (typeof MEDIA_MESSAGE_KEYS)[number];
  body: { fileName?: string; mimetype?: string; caption?: string; ptt?: boolean };
}

/**
 * The one media envelope a message carries, if any.
 *
 * WhatsApp does not always put it at the top level. A disappearing-messages chat nests everything
 * under `ephemeralMessage.message`, a view-once photo under `viewOnceMessageV2.message`, and a
 * document sent with a comment under `documentWithCaptionMessage.message` - in every case the
 * media is one level down, and a flat `key in body` check (what this used to be) finds nothing and
 * silently delivers the message to Bitrix with no attachment at all. Only one level of unwrapping
 * is done, which covers every wrapper WhatsApp actually uses.
 */
export function findMedia(body: Record<string, unknown> | undefined): MediaEnvelope | null {
  if (!body) return null;

  const direct = MEDIA_MESSAGE_KEYS.find((key) => key in body);
  if (direct) return { key: direct, body: (body[direct] ?? {}) as MediaEnvelope['body'] };

  for (const wrapper of WRAPPER_MESSAGE_KEYS) {
    const inner = (body[wrapper] as { message?: Record<string, unknown> } | undefined)?.message;
    if (!inner) continue;
    const nested = MEDIA_MESSAGE_KEYS.find((key) => key in inner);
    if (nested) return { key: nested, body: (inner[nested] ?? {}) as MediaEnvelope['body'] };
  }
  return null;
}

/**
 * A name Bitrix can show, and more importantly an extension its viewer can act on - a file with no
 * usable extension is offered as a download rather than played or previewed inline. A voice note
 * (audioMessage with ptt) is named as such so it doesn't arrive looking like an audio file the
 * customer attached deliberately.
 */
function guessFileName(
  mediaKey: (typeof MEDIA_MESSAGE_KEYS)[number],
  media: MediaEnvelope['body'],
): string {
  const kind = mediaKey === 'audioMessage' && media.ptt ? 'voice' : mediaKey.replace('Message', '');
  const ext = media.mimetype?.split('/')[1]?.split(';')[0] ?? 'bin';
  return `${kind}.${ext}`;
}

/**
 * Also used by src/crm.ts's startConversation - a click-to-chat send is upserted the same way.
 *
 * One row per contact, i.e. per (session_id, wa_phone) - no longer one per jid, which is what let
 * a jid flip mint a second row and, with it, a second Bitrix chat. The existing row is found the
 * same way findContactChat finds it (phone in any spelling, or a jid it is known by) and UPDATEd;
 * a row is INSERTed only when none exists.
 *
 * - `chatId` is written on INSERT only and never overwritten: it is the external chat.id Bitrix
 *   stored for this chat and baked into the CRM contact's IM identifier (schema.sql). The UPDATE
 *   only ever fills a NULL chat_id from the row's *current* wa_jid (SQLite evaluates every SET
 *   expression against the pre-update row), which is a legacy row's real chat.id - so a row the
 *   DEPLOY.md backfill missed self-heals before wa_jid moves on.
 * - `wa_jid` tracks the latest jid seen - unless another row already holds that jid (a contact
 *   still split across two rows until DEPLOY.md's dedupe runs), in which case it stays put rather
 *   than tripping UNIQUE(session_id, wa_jid) and failing the message.
 * - `bitrixLineId` is the line the chat was just posted on, not merely the session's current one:
 *   see schema.sql: a chat is pinned to its line by Bitrix forever, so recording which one it was
 *   is the only way findChatMatches can later tell a live chat from an orphaned one. Overwritten
 *   on every update, unlike wa_name, because a row being rewritten means Bitrix just accepted a
 *   message on that line - the newer answer is always the right one. Same for bitrix_chat_id.
 * - `waName`/`waPicture` never overwrite a known value with NULL - only a fresh lookup that found
 *   something replaces them.
 */
export async function upsertChatMap(
  env: Env,
  sessionId: string,
  waJid: string,
  waPhone: string,
  chatId: string,
  bitrixChatId: string,
  bitrixLineId: number,
  waName?: string,
  waPicture?: string,
): Promise<void> {
  const match = contactMatch(waJid, [waPhone]);
  const now = nowSec();

  const update = () =>
    env.DB.prepare(
      `UPDATE chat_map SET
         chat_id = COALESCE(chat_id, wa_jid),
         wa_jid = CASE
           WHEN EXISTS (SELECT 1 FROM chat_map other
                        WHERE other.session_id = chat_map.session_id AND other.wa_jid = ?
                          AND other.id <> chat_map.id)
           THEN wa_jid ELSE ? END,
         wa_phone = COALESCE(wa_phone, ?),
         bitrix_chat_id = ?,
         bitrix_line_id = ?,
         wa_name = COALESCE(?, wa_name),
         wa_picture = COALESCE(?, wa_picture),
         last_message_at = ?
       WHERE id = (SELECT id FROM chat_map WHERE session_id = ? AND ${match.sql}
                   ORDER BY last_message_at DESC LIMIT 1)`,
    )
      .bind(
        waJid,
        waJid,
        waPhone,
        bitrixChatId,
        bitrixLineId,
        waName ?? null,
        waPicture ?? null,
        now,
        sessionId,
        ...match.binds,
      )
      .run();

  if ((await update()).meta.changes > 0) return;

  // INSERT ... WHERE NOT EXISTS is a single statement, so two deliveries for a brand-new contact
  // racing each other cannot both insert (D1 serializes writes). Both would carry the same
  // canonical chatId anyway, so even a lost race never splits the Bitrix chat.
  const inserted = await env.DB.prepare(
    `INSERT INTO chat_map
       (id, session_id, wa_jid, wa_phone, chat_id, bitrix_chat_id, bitrix_line_id, wa_name, wa_picture, last_message_at)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
     WHERE NOT EXISTS (SELECT 1 FROM chat_map WHERE session_id = ? AND ${match.sql})`,
  )
    .bind(
      uuid(),
      sessionId,
      waJid,
      waPhone,
      chatId,
      bitrixChatId,
      bitrixLineId,
      waName ?? null,
      waPicture ?? null,
      now,
      sessionId,
      ...match.binds,
    )
    .run();

  // Lost that race: the row now exists, so this delivery's update applies to it.
  if (inserted.meta.changes === 0) await update();
}

/**
 * Best-effort WhatsApp display name and profile picture for the Bitrix contact. Cached in chat_map
 * once a name is resolved so this costs one Wasender call per contact, not one per message. The
 * cache is the contact's row (`cached`, found by phone), so a jid flip no longer forces a fresh
 * lookup either.
 *
 * The picture rides the same lookup (getContactInfo's imgUrl): refreshed whenever a fresh lookup
 * happens, otherwise the stored wa_picture is reused so later messages still carry it.
 *
 * Caveat: "fresh lookup" means "no cached name". A contact whose name was cached before wa_picture
 * and the chat rename existed therefore gets neither - no avatar, and its chat keeps Bitrix's
 * default title - until wa_name is cleared for it. Deliberate for now: re-looking-up every named
 * contact on every message to chase a picture that privacy settings may hide forever would turn
 * one Wasender call per contact back into one per message.
 *
 * `name` is undefined when no *real* name could be found, which is deliberately not the same thing
 * as "there is nothing to call this person" - see displayName, which supplies the phone number as
 * a last resort at the point of use. Keeping the two separate matters because only a real name is
 * worth caching: writing the phone fallback into chat_map.wa_name would make it stick permanently
 * and stop a genuine name from ever landing on a later message.
 *
 * Failure here is expected, not exceptional. Confirmed live on example 2026-08-12: contact 902
 * was created as "Guest" because this returned undefined - Wasender 404s a contact WhatsApp has
 * not synced yet, and there is no pushName on the webhook to fall back to (docs/wasenderapi.md).
 *
 * For a group (wa_jid ending @g.us) this resolves the group's own subject via getGroupMetadata
 * rather than getContactInfo - waPhone is the group JID in that case (see waPhone above), not a
 * phone number the contacts endpoint could look up.
 */
async function resolveContact(
  env: Env,
  session: SessionRow,
  waJid: string,
  waPhone: string,
  cached: Pick<ContactChatRow, 'wa_name' | 'wa_picture'> | null,
): Promise<{ name?: string; picture?: string }> {
  const cachedPicture = cached?.wa_picture ?? undefined;
  if (cached?.wa_name) return { name: cached.wa_name, picture: cachedPicture };

  try {
    const apiKey = await sessionApiKey(env, session);
    if (isGroupJid(waJid)) {
      const info = await wasender(env).getGroupMetadata(apiKey, waJid);
      return { name: info.subject ?? undefined, picture: cachedPicture };
    }
    const info = await wasender(env).getContactInfo(apiKey, waPhone);
    // getContactInfo's imgUrl is documented as frequently null (its example in
    // the Wasender API docs return "imgUrl": null) even when the contact does have a picture,
    // so the dedicated /picture endpoint is the fallback. Only an absolute http(s) URL is something
    // Bitrix can fetch; anything else is dropped rather than handed over to fail the send.
    const picture =
      (info.imgUrl?.startsWith('http') ? info.imgUrl : undefined) ??
      (await wasender(env).getContactPicture(apiKey, waPhone)) ??
      cachedPicture;
    return { name: (info.name || info.notify || info.verifiedName) ?? undefined, picture };
  } catch (err) {
    // Not fatal, but not nothing either: a silent catch here is what made "why is every contact
    // called Guest?" so hard to answer from the outside.
    console.warn(
      JSON.stringify({
        msg: 'contact name lookup failed - falling back to the phone number',
        sessionId: session.id,
        waJid,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return { picture: cachedPicture };
  }
}

/**
 * What to put in `user.name`. Never undefined: handing Bitrix no name is what makes it invent
 * "Guest", and a Guest contact is worse than useless - every unnamed WhatsApp contact collapses
 * into an indistinguishable pile of them in the CRM, and the deal the tracker creates inherits the
 * same title ("Guest - Whatsapp", deal 976 on example).
 *
 * A phone number is always known and always beats that. Groups get a generic label instead,
 * because waPhone holds the group's JID there rather than a number worth showing anyone.
 */
function displayName(waJid: string, waPhone: string, resolved?: string): string {
  if (resolved) return resolved;
  if (isGroupJid(waJid)) return 'WhatsApp group';

  // waPhone is Wasender's cleanedSenderPn, which may or may not already carry a leading '+'
  // (docs/wasenderapi.md) - normalise to digits first rather than assuming either way.
  const digits = waPhone.replace(/\D/g, '');
  return digits ? `+${digits}` : waPhone;
}

/**
 * Idempotency gate. `message_log`'s unique index is on (session_id, direction, wa_message_id)
 * regardless of status, so re-processing the same message (Wasender redelivers webhooks; Queues
 * redelivers on retry) must reuse the existing row rather than insert a second one. Only a
 * 'pending' row means "not resolved yet, go ahead" - every other status is terminal for this
 * purpose (including 'echo': once an upsert has been matched to an outbound send, redelivery of
 * that same webhook must not re-run the match and must not fall through to posting it instead).
 */
async function claimMessageLog(
  env: Env,
  sessionId: string,
  direction: InboundDirection,
  waMessageId: string,
): Promise<{ id: string; proceed: boolean }> {
  const existing = await selectMessageLog(env, sessionId, direction, waMessageId);
  if (existing) return { id: existing.id, proceed: existing.status === 'pending' };

  const id = uuid();
  try {
    await env.DB.prepare(
      `INSERT INTO message_log (id, session_id, direction, wa_message_id, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
    )
      .bind(id, sessionId, direction, waMessageId, nowSec())
      .run();
    return { id, proceed: true };
  } catch {
    // Lost a race with a concurrent delivery of the same message - use what it inserted.
    const raced = await selectMessageLog(env, sessionId, direction, waMessageId);
    if (!raced) throw new Error(`message_log insert failed for ${waMessageId} but no row exists`);
    return { id: raced.id, proceed: raced.status === 'pending' };
  }
}

function selectMessageLog(
  env: Env,
  sessionId: string,
  direction: InboundDirection,
  waMessageId: string,
): Promise<{ id: string; status: string } | null> {
  return env.DB.prepare(
    `SELECT id, status FROM message_log WHERE session_id = ? AND direction = ? AND wa_message_id = ?`,
  )
    .bind(sessionId, direction, waMessageId)
    .first<{ id: string; status: string }>();
}

async function writeTerminalLog(
  env: Env,
  sessionId: string,
  direction: InboundDirection,
  waMessageId: string,
  error: string,
): Promise<void> {
  const claim = await claimMessageLog(env, sessionId, direction, waMessageId);
  if (!claim.proceed) return;
  await env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
    .bind(error, claim.id)
    .run();
}
