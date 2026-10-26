import { type MiddlewareHandler, Hono } from 'hono';
import { markDeadLettered, processInboundMessage } from './inbound';
import { refreshAllPortals } from './license';
import { mediaRoutes, cleanupStagedMedia } from './media';
import { requireEdgeAuth } from './middleware/edgeAuth';
import { markOutboundDeadLettered, processOutboundMessage } from './outbound';
import { adminRoutes } from './routes/admin';
import { apiRoutes } from './routes/api';
import { eventRoutes } from './routes/events';
import { installRoutes } from './routes/install';
import { webhookRoutes } from './routes/webhook';
import { widgetRoutes } from './routes/widget';
import type { Env } from './types';
import { clientIp } from './util';
import { WasenderError } from './wasender';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ ok: true, version: c.env.APP_VERSION }));

// Audio-notification chatbot webhook — must respond 200 to any POST (event deliveries we ignore).
app.post('/bot/audio', (c) => c.text('ok', 200));

// Registered before the mounts so it runs ahead of each group's own auth. Deliberately not on
// /health (uptime checks), /media/* (signed proxy token), /events/* (Bitrix posts straight to the
// handler URL) or the install routes (Bitrix Market's install frame) - see edgeAuth.ts.
//
// Mounted only while EDGE_SECRET is set. The gate verifies an X-Edge-Auth header stamped by a
// trusted reverse proxy; a deployment without one (a bare workers.dev run, a local dev server)
// has no proxy to verify and no header to expect, so the gate is skipped instead of failing
// closed - skipping is safe because every route behind it still enforces its own auth
// (webhook_secret, the signed app session, X-Admin-Key). Once the secret IS configured the gate
// itself fails closed: missing or mismatched header, 403.
const edgeAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (!c.env.EDGE_SECRET) return next();
  return requireEdgeAuth(c, next);
};
app.use('/webhook/*', edgeAuth);
app.use('/api/*', edgeAuth);
app.use('/admin/*', edgeAuth);

app.route('/', eventRoutes);
app.route('/', apiRoutes);
app.route('/', adminRoutes);
app.route('/', webhookRoutes);
app.route('/', mediaRoutes);
app.route('/', widgetRoutes);
// Install routes own '/' itself, so mount them last.
app.route('/', installRoutes);

app.onError((err, c) => {
  console.error(
    JSON.stringify({
      msg: 'unhandled',
      path: new URL(c.req.url).pathname,
      ip: clientIp(c.req.raw, c.env.EDGE_SECRET),
      error: err instanceof Error ? err.stack : String(err),
    }),
  );
  // TODO(pre-market-launch): drop the `message` field. wrangler tail isn't giving visibility
  // during internal testing, so the message rides in the response body instead - safe for now
  // (BitrixError/WasenderError messages carry API error codes, never token values) but not
  // something to ship to a real customer portal.
  return c.json(
    { error: 'SERVER_ERROR', message: err instanceof Error ? err.message : String(err) },
    500,
  );
});

const QUEUE_HANDLERS: Record<string, (env: Env, body: unknown) => Promise<void>> = {
  'bwac-inbound': processInboundMessage as (env: Env, body: unknown) => Promise<void>,
  'bwac-inbound-dlq': markDeadLettered as (env: Env, body: unknown) => Promise<void>,
  'bwac-outbound': processOutboundMessage as (env: Env, body: unknown) => Promise<void>,
  'bwac-outbound-dlq': markOutboundDeadLettered as (env: Env, body: unknown) => Promise<void>,
};

/**
 * Wasender's account-protection window ("1 message every 5 seconds"), with a second of headroom.
 * Only used when Wasender reports that guard, which it does as a plain error rather than a 429.
 */
const ACCOUNT_PROTECTION_DELAY_SEC = 6;

/** How many conversations one queue invocation works on at once. */
const QUEUE_CONCURRENCY = 4;

/**
 * Which conversation a queue message belongs to: outbound bodies carry the external chat id as
 * `waJid`, inbound message bodies the WhatsApp chat at `message.key.remoteJid`, and inbound notes
 * (routes/webhook.ts's calls/reactions/deletions) their chat as a top-level `remoteJid`. Anything
 * else - a dead-letter body we can't read, a shape added later - gets a key of its own, so it is
 * neither held behind an unrelated message nor given an ordering we couldn't vouch for.
 */
function conversationKey(body: unknown, index: number): string {
  const b = body as {
    waJid?: unknown;
    remoteJid?: unknown;
    message?: { key?: { remoteJid?: unknown } };
  } | null;
  if (typeof b?.waJid === 'string' && b.waJid) return `out:${b.waJid}`;
  const jid = b?.message?.key?.remoteJid ?? b?.remoteJid;
  if (typeof jid === 'string' && jid) return `in:${jid}`;
  return `unkeyed:${index}`;
}

/**
 * Four queues feed this: bwac-inbound/bwac-outbound (the happy paths) and their respective
 * dead-letter queues (everything that exhausted retries, wired to the mark*DeadLettered
 * handlers). Each message is acked/retried individually so one bad message in a batch doesn't
 * take the rest down with it - a bare `throw` would fail the whole batch instead.
 *
 * Order only matters within one conversation - a customer's or operator's messages have to land
 * in the order they were written - so the batch is split per chat, each chat runs in batch order,
 * and different chats run side by side (bounded by QUEUE_CONCURRENCY). This used to be one loop
 * over the whole batch, which let a single slow call hold up every unrelated chat behind it: one
 * Wasender send that hung 116 s pushed the rest of its batch 42-106 s late, past the point where
 * Bitrix still applies delivery confirmations, so those replies reached WhatsApp but stayed red in
 * the Contact Center. Now a slow chat only delays itself.
 */
async function queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
  const handler = QUEUE_HANDLERS[batch.queue];
  if (!handler) throw new Error(`no handler for queue ${batch.queue}`);

  const groups = new Map<string, Message<unknown>[]>();
  for (const [index, message] of batch.messages.entries()) {
    const key = conversationKey(message.body, index);
    const group = groups.get(key);
    if (group) group.push(message);
    else groups.set(key, [message]);
  }

  const pending = [...groups.values()];
  const runner = async () => {
    for (let group = pending.shift(); group; group = pending.shift()) {
      for (const message of group) await processQueueMessage(batch.queue, handler, env, message);
    }
  };
  await Promise.all(Array.from({ length: Math.min(QUEUE_CONCURRENCY, pending.length) }, runner));
}

/** Run one message and ack or retry it. Never throws, so one message can't fail its siblings. */
async function processQueueMessage(
  queueName: string,
  handler: (env: Env, body: unknown) => Promise<void>,
  env: Env,
  message: Message<unknown>,
): Promise<void> {
  try {
    await handler(env, message.body);
    message.ack();
  } catch (err) {
    console.error(
      JSON.stringify({
        msg: 'queue message failed',
        queue: queueName,
        attempts: message.attempts,
        error: err instanceof Error ? err.stack : String(err),
      }),
    );
    // A 429 paces itself using Wasender's own reset window rather than a blind backoff -
    // otherwise identical to any other failure, which just uses the queue's default retry.
    if (err instanceof WasenderError && err.status === 429 && err.rateLimit?.resetSeconds) {
      message.retry({ delaySeconds: err.rateLimit.resetSeconds });
    } else if (err instanceof WasenderError && /account protection/i.test(err.message)) {
      // Not a 429 and it carries no x-ratelimit-reset, so the branch above never catches it:
      // Wasender's per-account "you can only send 1 message every 5 seconds" guard is reported as
      // an ordinary error. Retrying immediately just trips it again - observed 2026-08-18 21:48
      // UTC, where four of six attempts one second apart died on this rather than on the actual
      // fault. The window is the one stated in the message.
      message.retry({ delaySeconds: ACCOUNT_PROTECTION_DELAY_SEC });
    } else {
      message.retry();
    }
  }
}

/** Cron trigger (wrangler.jsonc's triggers.crons) - revalidates every portal with a license
 * license key on file (ensureFresh inside refreshAllPortals skips any portal whose cache is still
 * within the 12h staleness window, so most runs are cheap no-ops) and expires re-hosted inbound
 * media in R2 that Bitrix never fetched (media.ts, cleanupStagedMedia - objects older than
 * STAGED_MEDIA_MAX_AGE_SEC). Both run on every tick and neither is allowed to sink the other:
 * a rejection inside the cleanup is logged as one JSON line rather than thrown. */
async function scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
  ctx.waitUntil(
    Promise.all([
      refreshAllPortals(env),
      cleanupStagedMedia(env).catch((err: unknown) => {
        console.warn(
          JSON.stringify({
            msg: 'staged media cleanup failed',
            error: err instanceof Error ? err.message : String(err),
          }),
        );
      }),
    ]),
  );
}

export default { fetch: app.fetch, queue, scheduled };
