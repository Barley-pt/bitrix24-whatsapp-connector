import { Hono } from 'hono';
import { markDeadLettered, processInboundMessage } from './inbound';
import { refreshAllPortals } from './license';
import { mediaRoutes } from './media';
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
app.use('/webhook/*', requireEdgeAuth);
app.use('/api/*', requireEdgeAuth);
app.use('/admin/*', requireEdgeAuth);

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

/**
 * Four queues feed this: bwac-inbound/bwac-outbound (the happy paths) and their respective
 * dead-letter queues (everything that exhausted retries, wired to the mark*DeadLettered
 * handlers). Each message is acked/retried individually so one bad message in a batch doesn't
 * take the rest down with it - a bare `throw` would fail the whole batch instead.
 */
async function queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
  const handler = QUEUE_HANDLERS[batch.queue];
  if (!handler) throw new Error(`no handler for queue ${batch.queue}`);

  for (const message of batch.messages) {
    try {
      await handler(env, message.body);
      message.ack();
    } catch (err) {
      console.error(
        JSON.stringify({
          msg: 'queue message failed',
          queue: batch.queue,
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
}

/** Cron trigger (wrangler.jsonc's triggers.crons) - revalidates every portal with a Maestro
 * license key on file. ensureFresh inside refreshAllPortals skips any portal whose cache is still
 * within the 12h staleness window, so most runs are cheap no-ops. */
async function scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
  ctx.waitUntil(refreshAllPortals(env));
}

export default { fetch: app.fetch, queue, scheduled };
