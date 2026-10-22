import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types';
import { clientIp, timingSafeEqual } from '../util';

/**
 * Defence-in-depth gate for deployments that put a trusted reverse proxy in front of the Worker
 * (nginx template: deploy/nginx/connector.conf): the proxy stamps X-Edge-Auth: $EDGE_SECRET on
 * everything it proxies - the Wasender webhook, Bitrix event handlers and the SPA's own /api and
 * /admin calls alike - while the Worker's workers.dev URL stays directly reachable, where anyone
 * can hit it with nothing but a leaked webhook_secret.
 *
 * Opt-in: index.ts mounts this only while EDGE_SECRET is set. Without a proxy there is nothing
 * to verify, and a gate that 403s every request because a binding is missing would brick a
 * self-hosted install. When the secret IS configured the gate fails closed - a missing or
 * mismatched X-Edge-Auth header is a 403 (`wrangler secret put EDGE_SECRET`).
 *
 * An additional layer only - the routes behind it keep their own auth (the webhook's
 * webhook_secret, /api/*'s signed app session, /admin/*'s X-Admin-Key).
 */
export const requireEdgeAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const provided = c.req.header('X-Edge-Auth');
  const secret = c.env.EDGE_SECRET;

  // clientIp only trusts X-Real-Client-IP alongside a matching edge secret, so a request that
  // failed this gate degrades to CF-Connecting-IP (the proxy's address for proxied traffic, the
  // caller's own for a direct hit - which is exactly the case worth seeing here).
  const reject = (reason: 'EDGE_AUTH_MISSING' | 'EDGE_AUTH_MISMATCH') => {
    console.warn(
      JSON.stringify({
        msg: 'edge auth rejected',
        reason,
        path: new URL(c.req.url).pathname,
        ip: clientIp(c.req.raw, secret),
      }),
    );
    return c.json({ error: 'FORBIDDEN' }, 403);
  };

  if (!secret || !provided) return reject('EDGE_AUTH_MISSING');
  if (!(await timingSafeEqual(provided, secret))) return reject('EDGE_AUTH_MISMATCH');

  await next();
};
