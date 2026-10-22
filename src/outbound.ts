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
  if (!claim.proceed) return; // Already sent, or already given up on, by an earlier delivery.

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
  const msgId = files.length
    ? await sendFiles(env, portal, apiKey, chat.wa_phone, strippedText, files)
    : (await wasender(env).sendText(apiKey, chat.wa_phone, strippedText)).msgId;

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

  await confirmDelivery(env, portal, {
    lineId: msg.lineId,
    bitrixChatId: msg.bitrixChatId,
    bitrixMessageId: msg.bitrixMessageId,
    waJid: msg.waJid,
    waMessageId: String(msgId),
  });
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
): Promise<{ id: string; proceed: boolean }> {
  const existing = await selectMessageLog(env, sessionId, bitrixMessageId);
  if (existing) return { id: existing.id, proceed: existing.status === 'pending' };

  const id = uuid();
  try {
    await env.DB.prepare(
      `INSERT INTO message_log (id, session_id, direction, bitrix_message_id, status, created_at)
       VALUES (?, ?, 'outbound', ?, 'pending', ?)`,
    )
      .bind(id, sessionId, bitrixMessageId, nowSec())
      .run();
    return { id, proceed: true };
  } catch {
    // Lost a race with a concurrent delivery of the same event - use what it inserted.
    const raced = await selectMessageLog(env, sessionId, bitrixMessageId);
    if (!raced) {
      throw new Error(`message_log insert failed for bitrix message ${bitrixMessageId} but no row exists`);
    }
    return { id: raced.id, proceed: raced.status === 'pending' };
  }
}

function selectMessageLog(
  env: Env,
  sessionId: string,
  bitrixMessageId: number,
): Promise<{ id: string; status: string } | null> {
  return env.DB.prepare(
    `SELECT id, status FROM message_log WHERE session_id = ? AND direction = 'outbound' AND bitrix_message_id = ?`,
  )
    .bind(sessionId, bitrixMessageId)
    .first<{ id: string; status: string }>();
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
