import { confirmDelivery } from './connector';
import { getPortalById } from './db';
import { mediaProxyUrl } from './media';
import { getSessionByLine, sessionApiKey } from './sessions';
import type { Env, OutboundFile, OutboundQueueMessage, PortalRow } from './types';
import { normalizeEchoText, nowSec, stripBBCode, uuid } from './util';
import { type OutboundMediaKind, wasender } from './wasender';

/**
 * One operator reply, end to end: resolve which WhatsApp number to send from and to, send via
 * Wasender, record it, and confirm delivery back to Bitrix.
 *
 * Returning normally means "ack this delivery". Throwing (a WasenderError on 429 included) means
 * "let Cloudflare Queues retry" - see index.ts, which paces a 429 using Wasender's own
 * x-ratelimit-reset rather than a blind backoff.
 */
export async function processOutboundMessage(env: Env, msg: OutboundQueueMessage): Promise<void> {
  const session = await getSessionByLine(env, msg.portalId, msg.lineId);
  if (!session) return; // Line unbound, or the session was removed, since the operator replied.

  // msg.waJid is the event's chat.id - exactly the value inbound.ts stored as chat_map.chat_id when
  // it posted under it, so that is the column to resolve by. It is NOT necessarily wa_jid any
  // more: wa_jid follows whichever jid the contact last wrote from, while chat_id stays the id the
  // chat was created with. wa_jid is kept as a fallback for a row DEPLOY.md's backfill has not
  // reached yet (chat_id NULL), where the two were still the same thing; chat_id hits win.
  const chat = await env.DB.prepare(
    `SELECT wa_phone FROM chat_map
     WHERE session_id = ? AND (chat_id = ? OR wa_jid = ?)
     ORDER BY CASE WHEN chat_id = ? THEN 0 ELSE 1 END, last_message_at DESC
     LIMIT 1`,
  )
    .bind(session.id, msg.waJid, msg.waJid, msg.waJid)
    .first<{ wa_phone: string | null }>();

  if (!chat?.wa_phone) {
    // No inbound message from this contact was ever logged, so there is no phone number to send
    // to - chat_map.wa_phone is the only place that number lives (see docs/wasenderapi.md, it
    // cannot be derived from wa_jid). Not something retrying changes.
    await writeTerminalLog(env, session.id, msg.bitrixMessageId, 'NO_CHAT_MAP');
    return;
  }

  const claim = await claimMessageLog(env, session.id, msg.bitrixMessageId);
  if (!claim.proceed) {
    // 'failed'/'echo'/'deleted' are terminal: an earlier delivery already gave up on this reply.
    if (claim.status !== 'sent' || !claim.waMessageId) return;
    // 'sent' means WhatsApp already has it, but not that Bitrix took the confirmation: the row is
    // marked before confirmDelivery runs, so a confirmation that threw got the queue to retry
    // straight into this branch - which used to return here, leaving the operator's message red
    // for good. Never send again; only repeat the confirmation, which re-marks the message in
    // Bitrix and never resends one.
    const sentPortal = await getPortalById(env, session.portal_id);
    if (!sentPortal) throw new Error(`session ${session.id} references missing portal ${session.portal_id}`);
    await confirmDeliveryWithRetry(env, sentPortal, msg, claim.waMessageId, null, 'retry');
    return;
  }

  const portal = await getPortalById(env, session.portal_id);
  if (!portal) throw new Error(`session ${session.id} references missing portal ${session.portal_id}`);

  const apiKey = await sessionApiKey(env, session);
  const strippedText = stripBBCode(msg.text);
  const files = msg.files ?? [];

  // Wasender rejects a send carrying neither text nor media ("The text field is required when none
  // of image url / video url / document url ... are present"), and no retry changes that, so this
  // must not reach it: five attempts a second apart used to burn the whole budget here and then
  // trip the account's own "1 message every 5 seconds" protection on the way down. routes/events.ts
  // now catches this at the door and logs the payload shape, so reaching this point means an
  // attachment Bitrix described in some shape parseFiles still doesn't read - kept as a terminal
  // failure rather than an exception for exactly that reason.
  if (!strippedText && files.length === 0) {
    await writeTerminalLog(env, session.id, msg.bitrixMessageId, 'EMPTY_MESSAGE');
    return;
  }

  // Bitrix's delivery confirmation takes one external id, and an operator's reply can be several
  // files, so the first message actually sent is the one it points at.
  const sendStart = Date.now();
  const msgId = files.length
    ? await sendFiles(env, portal, apiKey, chat.wa_phone, strippedText, files)
    : (await wasender(env).sendText(apiKey, chat.wa_phone, strippedText)).msgId;
  const sendMs = Date.now() - sendStart;

  // echo_jid/echo_phone/echo_text let inbound.ts's detectOutboundEcho recognize this exact send
  // if messages.upsert echoes it back with fromMe: true, so it isn't posted to Bitrix a second
  // time - see schema.sql's comment on these columns for why an id-based join isn't possible.
  await env.DB.prepare(
    `UPDATE message_log
     SET status = 'sent', wa_message_id = ?, echo_jid = ?, echo_phone = ?, echo_text = ?
     WHERE id = ?`,
  )
    .bind(String(msgId), msg.waJid, chat.wa_phone, normalizeEchoText(strippedText), claim.id)
    .run();

  await confirmDeliveryWithRetry(env, portal, msg, String(msgId), sendMs, 'send');
}

/** Pauses between confirmation attempts - one after each failure but the last. */
const CONFIRM_RETRY_DELAYS_MS = [1_000, 2_000];

/** Indirection so tests can stub the backoff out instead of really waiting (outbound.spec.ts). */
export const confirmTiming = {
  sleep: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * Confirm delivery to Bitrix, retrying a few times in place before handing the failure back to
 * the queue.
 *
 * imconnector.send.status.delivery is only applied while Bitrix still has the message in its
 * "sending" state, and it answers SUCCESS: true even when it skips one - so a confirmation that
 * fails or lands tens of seconds late leaves the operator's message red ("not delivered") in the
 * Contact Center while the customer did receive it on WhatsApp, D1 says 'sent', and nothing on our
 * side notices. Hence the quick inline retries (a queue retry can come much later), and one log
 * line per outcome so a missed confirmation is visible. Only the confirmation is retried here: the
 * Wasender send must never be repeated.
 *
 * Throws the last error once attempts run out, so the queue retries the message as before, which
 * then comes back through the 'sent' branch of processOutboundMessage.
 */
async function confirmDeliveryWithRetry(
  env: Env,
  portal: PortalRow,
  msg: OutboundQueueMessage,
  waMessageId: string,
  sendMs: number | null,
  via: 'send' | 'retry',
): Promise<void> {
  const confirmStart = Date.now();
  for (let attempt = 0; ; attempt++) {
    try {
      await confirmDelivery(env, portal, {
        lineId: msg.lineId,
        bitrixChatId: msg.bitrixChatId,
        bitrixMessageId: msg.bitrixMessageId,
        waJid: msg.waJid,
        waMessageId,
      });
      break;
    } catch (err) {
      const delay = CONFIRM_RETRY_DELAYS_MS[attempt];
      if (delay === undefined) {
        console.error(
          JSON.stringify({
            msg: 'delivery confirm failed',
            memberId: portal.member_id,
            bitrixMessageId: msg.bitrixMessageId,
            confirmMs: Date.now() - confirmStart,
            error: err instanceof Error ? err.message : String(err),
          }),
        );
        throw err;
      }
      await confirmTiming.sleep(delay);
    }
  }
  console.log(
    JSON.stringify({
      msg: 'delivery confirmed',
      memberId: portal.member_id,
      bitrixMessageId: msg.bitrixMessageId,
      sendMs,
      confirmMs: Date.now() - confirmStart,
      via,
    }),
  );
}

/** Extensions WhatsApp renders as media rather than as a file attachment. */
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);
const VIDEO_EXTENSIONS = new Set(['mp4', '3gp', '3gpp', 'mov']);
const AUDIO_EXTENSIONS = new Set(['ogg', 'opus', 'mp3', 'm4a', 'aac', 'wav', 'amr']);
/** WhatsApp's audio endpoint rejects webm, so those must be sent as documents. */
const NON_WA_AUDIO_EXTENSIONS = new Set(['webm', 'weba']);

/**
 * Which Wasender endpoint an attachment should go out through. Bitrix's own coarse `type` is
 * trusted first when it sends one, since it knows what the operator attached; the file extension
 * is the fallback, and anything unrecognized goes as a document - the one kind WhatsApp accepts
 * for arbitrary content, so an unusual file still arrives instead of failing to send.
 */
function mediaKind(file: OutboundFile): OutboundMediaKind {
  const type = file.type?.toLowerCase();
  if (type === 'image' || type === 'video') return type;
  // Bitrix may label a .webm file as 'audio', but WhatsApp's audio endpoint rejects webm.
  if (type === 'audio') {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (NON_WA_AUDIO_EXTENSIONS.has(ext)) return 'document';
    return 'audio';
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  if (AUDIO_EXTENSIONS.has(ext)) return 'audio';
  return 'document';
}

/**
 * Send an operator's attachments, returning the msgId of the first message that went out.
 *
 * The reply's text becomes the caption on the first attachment that can carry one, so the common
 * case (one image with a comment) arrives as a single WhatsApp bubble rather than two. Voice notes
 * have nowhere to put a caption (wasender.ts, sendMedia), so when every attachment is audio the
 * text is sent as its own message first, ahead of them.
 *
 * Partial failure does not throw. A retry re-sends the whole reply from the top - claimMessageLog
 * lets it through while the row is still 'pending' - so throwing after the second of three files
 * failed would deliver the first one twice. Anything that got through therefore counts as
 * delivered, with the failures logged; only a reply where nothing at all was sent is worth
 * retrying, and that is the one case this rethrows (a 429 included, so index.ts can still pace it).
 */
async function sendFiles(
  env: Env,
  portal: PortalRow,
  apiKey: string,
  toPhone: string,
  text: string,
  files: OutboundFile[],
): Promise<number> {
  const client = wasender(env);
  const kinds = files.map(mediaKind);

  let firstMsgId: number | null = null;
  // Consumed by whichever send takes it as a caption, so it is never sent twice.
  let pendingText = text;

  if (text && kinds.every((kind) => kind === 'audio')) {
    firstMsgId = (await client.sendText(apiKey, toPhone, text)).msgId;
    pendingText = '';
  }

  const failures: string[] = [];
  // Kept so "nothing was sent" can rethrow the original error rather than a summary of it - a
  // WasenderError has to survive intact for index.ts to pace a 429 by its x-ratelimit-reset.
  let firstError: unknown = null;

  for (const [index, file] of files.entries()) {
    const kind = kinds[index] as OutboundMediaKind;
    try {
      const url = await mediaProxyUrl(env, portal, file.link);
      // Only happens for a link that doesn't resolve to the portal's own host (media.ts) - not
      // something a retry fixes, so it is recorded like any other per-file failure.
      if (!url) throw new Error('attachment link is not on the portal domain');

      const caption = kind === 'audio' ? '' : pendingText;
      const result = await client.sendMedia(
        apiKey,
        toPhone,
        { kind, url, ...(file.name ? { fileName: file.name } : {}) },
        caption || undefined,
      );
      if (caption) pendingText = '';
      firstMsgId ??= result.msgId;
    } catch (err) {
      firstError ??= err;
      failures.push(`${file.name || 'attachment'}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (failures.length) {
    console.error(
      JSON.stringify({
        msg: 'some attachments on an operator reply could not be sent',
        memberId: portal.member_id,
        sent: files.length - failures.length,
        failures,
      }),
    );
  }
  if (firstMsgId === null) {
    throw firstError ?? new Error(`no attachment could be sent: ${failures.join('; ')}`);
  }
  return firstMsgId;
}

/** A batch from the outbound dead-letter queue: Cloudflare gave up retrying. Record it and stop. */
export async function markOutboundDeadLettered(env: Env, msg: OutboundQueueMessage): Promise<void> {
  const session = await getSessionByLine(env, msg.portalId, msg.lineId);
  if (!session) return;

  const claim = await claimMessageLog(env, session.id, msg.bitrixMessageId);
  if (!claim.proceed) return;

  await env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
    .bind('DEAD_LETTERED', claim.id)
    .run();
}

/**
 * Idempotency gate, mirroring inbound.ts's claimMessageLog but keyed on Bitrix's own message id
 * rather than WhatsApp's: outbound's wa_message_id (Wasender's msgId) isn't known until after the
 * send succeeds, so it can't be the pre-send claim key the way it is for inbound.
 */
async function claimMessageLog(
  env: Env,
  sessionId: string,
  bitrixMessageId: number,
): Promise<{ id: string; status: string; waMessageId: string | null; proceed: boolean }> {
  const existing = await selectMessageLog(env, sessionId, bitrixMessageId);
  if (existing) return claimOf(existing);

  const id = uuid();
  try {
    await env.DB.prepare(
      `INSERT INTO message_log (id, session_id, direction, bitrix_message_id, status, created_at)
       VALUES (?, ?, 'outbound', ?, 'pending', ?)`,
    )
      .bind(id, sessionId, bitrixMessageId, nowSec())
      .run();
    return { id, status: 'pending', waMessageId: null, proceed: true };
  } catch {
    // Lost a race with a concurrent delivery of the same event - use what it inserted.
    const raced = await selectMessageLog(env, sessionId, bitrixMessageId);
    if (!raced) {
      throw new Error(`message_log insert failed for bitrix message ${bitrixMessageId} but no row exists`);
    }
    return claimOf(raced);
  }
}

function claimOf(row: { id: string; status: string; wa_message_id: string | null }) {
  return { id: row.id, status: row.status, waMessageId: row.wa_message_id, proceed: row.status === 'pending' };
}

function selectMessageLog(
  env: Env,
  sessionId: string,
  bitrixMessageId: number,
): Promise<{ id: string; status: string; wa_message_id: string | null } | null> {
  return env.DB.prepare(
    `SELECT id, status, wa_message_id FROM message_log WHERE session_id = ? AND direction = 'outbound' AND bitrix_message_id = ?`,
  )
    .bind(sessionId, bitrixMessageId)
    .first<{ id: string; status: string; wa_message_id: string | null }>();
}

async function writeTerminalLog(
  env: Env,
  sessionId: string,
  bitrixMessageId: number,
  error: string,
): Promise<void> {
  const claim = await claimMessageLog(env, sessionId, bitrixMessageId);
  if (!claim.proceed) return;
  await env.DB.prepare("UPDATE message_log SET status = 'failed', error = ? WHERE id = ?")
    .bind(error, claim.id)
    .run();
}
