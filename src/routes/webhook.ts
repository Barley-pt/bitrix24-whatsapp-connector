import { Hono } from 'hono';
import { decrypt } from '../crypto';
import { getSessionByWebhookToken } from '../sessions';
import type { Env, InboundNoteQueueMessage, SessionRow } from '../types';
import { clientIp, nowSec, timingSafeEqual } from '../util';
import type { InboundMessage } from '../wasender';

export const webhookRoutes = new Hono<{ Bindings: Env }>();

/**
 * Per-session ceiling on inbound webhook deliveries per minute. A busy session runs at roughly
 * 1-2 messages/second (60-120/min), so this leaves burst headroom while still capping a flood:
 * the 2026-09 incident pushed 6,793 requests through a single session's webhook, 2,638 of which
 * were enqueued and 1,216 posted to Bitrix before anyone noticed.
 */
const WEBHOOK_RATE_LIMIT_PER_MIN = 240;

interface WasenderWebhookBody {
  event?: string;
  timestamp?: number;
  // messages.received and messages-group.received deliver `messages` as a single object;
  // messages.upsert delivers it as an array (the Wasender API docs, Webhook: Message Upsert /
  // Message Received / Group Message Received). Both shapes are normalized below.
  data?: { messages?: InboundMessage | InboundMessage[] };
}

/** The `key` shape on reaction/delete/sent payloads. remoteJid may be a bare "+1234567890". */
interface EventKey {
  id?: string;
  fromMe?: boolean;
  remoteJid?: string;
}

/**
 * Payload shapes for the non-message events, per the Wasender API docs. Every field is optional:
 * these are only documented by example, so anything missing is skipped rather than trusted.
 */
interface CallData {
  call?: {
    id?: string;
    from?: string;
    isGroup?: boolean;
    isVideo?: boolean;
    /** Documented example only shows 'offer'; timeout/reject/accept/terminate follow Baileys. */
    status?: string;
    /** Not in the documented payload - used only if Wasender happens to send it. */
    duration?: number;
  };
}
interface ReactionEntry {
  key?: EventKey;
  reaction?: { text?: string; key?: EventKey };
}
interface DeleteData {
  keys?: EventKey[];
}
interface SentData {
  key?: EventKey;
  success?: boolean;
  error?: string;
}
interface QrData {
  qr?: string;
}

/** Call statuses worth a note, and how each reads. Anything else (accept, ringing...) is skipped. */
const CALL_NOTES: Record<string, (kind: string) => string> = {
  offer: (kind) => `📞 Incoming WhatsApp ${kind} call from {contact}`,
  timeout: (kind) => `📞 Missed WhatsApp ${kind} call from {contact}`,
  reject: (kind) => `📞 Declined WhatsApp ${kind} call from {contact}`,
  terminate: (kind) => `📞 WhatsApp ${kind} call with {contact} ended`,
};

/**
 * Wasender's inbound webhook. The path segment is the session's own unguessable webhook_token
 * (see sessions.ts, provisionSession) - it's what attributes a POST to a tenant before any
 * secret is checked, since the URL itself has no other portal/session context.
 *
 * Only enqueues: the actual Bitrix call happens in the queue consumer (index.ts's queue()
 * handler / inbound.ts), so a slow or failing Bitrix API never holds up this response and
 * doesn't risk Wasender giving up on delivery.
 */
webhookRoutes.post('/webhook/:token', async (c) => {
  const session = await getSessionByWebhookToken(c.env, c.req.param('token'));
  if (!session) return c.text('not found', 404);

  // Counted before the signature check on purpose: a flood holding a leaked webhook_secret passes
  // that check, and the compare is the expensive part (a decrypt plus two SHA-256 digests). One
  // atomic upsert per delivery, keyed on the current unix minute, is cheaper and bounds both.
  const bucketMin = Math.floor(Date.now() / 60000);
  const rate = await c.env.DB.prepare(
    `INSERT INTO webhook_rate (session_id, bucket_min, count) VALUES (?, ?, 1)
     ON CONFLICT(session_id, bucket_min) DO UPDATE SET count = count + 1
     RETURNING count`,
  )
    .bind(session.id, bucketMin)
    .first<{ count: number }>();
  if ((rate?.count ?? 0) > WEBHOOK_RATE_LIMIT_PER_MIN) {
    console.warn(
      JSON.stringify({
        msg: 'webhook rate limited',
        reason: 'RATE_LIMITED',
        path: new URL(c.req.url).pathname,
        ip: clientIp(c.req.raw, c.env.EDGE_SECRET),
        sessionId: session.id,
        count: rate?.count,
      }),
    );
    return c.json({ error: 'RATE_LIMITED' }, 429);
  }

  // Despite the header name, Wasender verification is a plain string comparison against the
  // session's own webhook_secret - there is no HMAC (see docs/wasenderapi.md). The secret is a
  // bearer credential, so the compare is constant-time and it is never logged.
  const signature = c.req.header('x-webhook-signature');
  const secret = session.webhook_secret ? await decrypt(session.webhook_secret, c.env.TOKEN_ENC_KEY) : null;
  if (!signature || !secret || !(await timingSafeEqual(signature, secret))) {
    console.log(
      JSON.stringify({
        msg: 'webhook unauthorized',
        path: new URL(c.req.url).pathname,
        ip: clientIp(c.req.raw, c.env.EDGE_SECRET),
        sessionId: session.id,
      }),
    );
    return c.text('unauthorized', 401);
  }

  const body = await c.req.json<WasenderWebhookBody>().catch(() => null);
  const eventHandler =
    body?.event && Object.hasOwn(NON_MESSAGE_EVENTS, body.event) ? NON_MESSAGE_EVENTS[body.event] : undefined;
  if (body && eventHandler) {
    await eventHandler(c.env, session, body.data, envelopeSeconds(body.timestamp));
    return c.text('ok', 200);
  }

  // messages.received/messages-group.received deliver data.messages as a single object,
  // messages.upsert as an array (see WasenderWebhookBody). Normalize to an array and enqueue one
  // queue message per entry - the consumer (inbound.ts) is built for exactly one message per
  // delivery. Entries without a key.id are unaddressable in every downstream lookup, so they are
  // dropped here.
  const rawMessages = body?.data?.messages;
  let messages = (Array.isArray(rawMessages) ? rawMessages : rawMessages ? [rawMessages] : []).filter(
    (m): m is InboundMessage => Boolean(m?.key?.id),
  );

  // Defense in depth against a stale ignore_groups upstream: Wasender only syncs a session's
  // ignore_groups to the live connection on PUT while connected (docs/wasenderapi.md), so there
  // is a window after a customer disables groups (routes/api.ts's group-messages toggle) where a
  // still-subscribed messages-group.received could still arrive. session.group_messages_enabled
  // is our own source of truth, checked regardless of which event carried the message.
  if (!session.group_messages_enabled) {
    const kept = messages.filter((m) => !m.key.remoteJid.endsWith('@g.us'));
    // Logged rather than dropped quietly: from the customer's side "groups don't work" and "groups
    // are switched off" are indistinguishable, and the toggle can be unreachable for reasons that
    // have nothing to do with this session (a plan without group_conversations disables it
    // outright - routes/api.ts). Without this line the only evidence a group message ever arrived
    // is a 200 'ignored' with no body.
    if (kept.length !== messages.length) {
      console.log(
        JSON.stringify({
          msg: 'group messages dropped: group_messages_enabled is off for this session',
          sessionId: session.id,
          dropped: messages.length - kept.length,
        }),
      );
    }
    messages = kept;
  }

  // WEBHOOK_EVENTS also subscribes to session.status and messages.update (wasender.ts) for the
  // QR/status flow (sessions.ts) - only messages.received/messages.upsert/messages-group.received
  // carry a message. messages-personal.received carries one too, but always a duplicate of a
  // messages.received delivery for the same 1:1 message; enqueueing both would rely on
  // claimMessageLog to dedupe two near-simultaneous consumers, which its race path does not
  // guarantee (both can see the row 'pending'), so it is acknowledged and dropped here.
  if (!body || messages.length === 0) {
    return c.text('ignored', 200);
  }
  if (
    body.event !== 'messages.received' &&
    body.event !== 'messages.upsert' &&
    body.event !== 'messages-group.received'
  ) {
    return c.text('ignored', 200);
  }

  // messages.upsert fires for both directions (wasender.ts's WEBHOOK_EVENTS comment); the
  // fromMe: false half is a pure duplicate of what messages.received/messages-group.received
  // already deliver, so it is dropped here rather than let through to double-process. Only
  // fromMe: true is new information - either a message typed on the app or an echo of our own
  // send, both sorted out in inbound.ts (processAppSentMessage / detectOutboundEcho).
  const toEnqueue = body.event === 'messages.upsert' ? messages.filter((m) => m.key.fromMe) : messages;
  if (toEnqueue.length === 0) {
    return c.text('ignored', 200);
  }

  for (const message of toEnqueue) {
    await c.env.INBOUND_QUEUE.send({
      sessionId: session.id,
      firstAttemptAt: Date.now(),
      bindWaitCount: 0,
      timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
      message,
      appSent: body.event === 'messages.upsert',
    });
  }

  return c.text('ok', 200);
});

type EventHandler = (env: Env, session: SessionRow, data: unknown, timestamp: number) => Promise<void>;

/**
 * Events that carry no `data.messages`. Each is cheap (one D1 write or one queue send) - posting to
 * Bitrix stays in the queue consumer (inbound.ts's processInboundNote) for the same reason message
 * deliveries do. Group traffic is dropped here when the session has groups off, matching the
 * message path above.
 */
const NON_MESSAGE_EVENTS: Record<string, EventHandler> = {
  'qrcode.updated': async (env, session, data) => {
    const qr = (data as QrData | undefined)?.qr;
    if (!qr) return;
    await env.DB.prepare('UPDATE whatsapp_sessions SET last_qr = ?, last_qr_at = ? WHERE id = ?')
      .bind(qr, nowSec(), session.id)
      .run();
  },

  call: async (env, session, data, timestamp) => {
    const call = (data as CallData | undefined)?.call;
    const note = call?.status ? CALL_NOTES[call.status] : undefined;
    if (!call?.id || !call.from || !note || dropGroup(session, call.from)) return;
    const duration =
      typeof call.duration === 'number' && call.duration > 0 ? ` - duration ${call.duration}s` : '';
    await enqueueNote(env, session, {
      eventId: `call:${call.id}:${call.status}`,
      remoteJid: call.from,
      text: note(call.isVideo ? 'video' : 'voice') + duration,
      timestamp,
    });
  },

  // Documented as an array; a single object is accepted too, like messages.received.
  'messages.reaction': async (env, session, data, timestamp) => {
    const entries = (Array.isArray(data) ? data : data ? [data] : []) as ReactionEntry[];
    for (const { key, reaction } of entries) {
      const emoji = reaction?.text;
      const target = reaction?.key;
      // Empty text is a reaction being removed; fromMe is the business side reacting, which the
      // operator already knows about.
      if (!emoji || !target?.id || key?.fromMe || !key?.remoteJid) continue;
      if (dropGroup(session, key.remoteJid)) continue;
      await enqueueNote(env, session, {
        eventId: `reaction:${target.id}:${emoji}`,
        remoteJid: key.remoteJid,
        text: `{contact} reacted with ${emoji} to ${target.fromMe ? 'your' : 'their'} message`,
        timestamp,
      });
    }
  },

  'messages.delete': async (env, session, data, timestamp) => {
    for (const key of (data as DeleteData | undefined)?.keys ?? []) {
      if (!key.id) continue;
      // inbound/app_outbound rows hold the WhatsApp id in wa_message_id; an outbound row only
      // knows it as echo_message_id, once an upsert echo was matched to it (schema.sql).
      await env.DB.prepare(
        `UPDATE message_log SET status = 'deleted'
         WHERE session_id = ? AND (
           (direction IN ('inbound', 'app_outbound') AND wa_message_id = ?)
           OR (direction = 'outbound' AND echo_message_id = ?)
         )`,
      )
        .bind(session.id, key.id, key.id)
        .run();
      if (key.fromMe || !key.remoteJid || dropGroup(session, key.remoteJid)) continue;
      await enqueueNote(env, session, {
        eventId: `delete:${key.id}`,
        remoteJid: key.remoteJid,
        text: '{contact} deleted a message',
        timestamp,
      });
    }
  },

  // Wasender's name is message.sent (singular); the plural is accepted in case it is ever sent.
  // Wasender's send response (msgId) and the WhatsApp id here are different id spaces, so the only
  // outbound row this can find is one an upsert echo already tied to the WhatsApp id - see
  // detectOutboundEcho. A failure carries no key at all, so it can only be logged.
  'message.sent': handleMessageSent,
  'messages.sent': handleMessageSent,
};

async function handleMessageSent(env: Env, session: SessionRow, data: unknown): Promise<void> {
  const sent = data as SentData | undefined;
  if (sent?.success === false) {
    console.warn(
      JSON.stringify({ msg: 'wasender reported a failed send', sessionId: session.id, error: sent.error }),
    );
    return;
  }
  if (!sent?.key?.id) return;
  await env.DB.prepare(
    `UPDATE message_log SET status = 'sent'
     WHERE session_id = ? AND direction = 'outbound' AND echo_message_id = ? AND status = 'pending'`,
  )
    .bind(session.id, sent.key.id)
    .run();
}

function dropGroup(session: SessionRow, jid: string): boolean {
  return !session.group_messages_enabled && jid.endsWith('@g.us');
}

/** Envelope timestamps are documented in seconds on message events but milliseconds on others. */
function envelopeSeconds(ts: number | undefined): number {
  if (!ts) return nowSec();
  return ts > 1e12 ? Math.floor(ts / 1000) : ts;
}

function enqueueNote(
  env: Env,
  session: SessionRow,
  note: Pick<InboundNoteQueueMessage, 'eventId' | 'remoteJid' | 'text' | 'timestamp'>,
): Promise<unknown> {
  return env.INBOUND_QUEUE.send({ kind: 'note', sessionId: session.id, ...note });
}
