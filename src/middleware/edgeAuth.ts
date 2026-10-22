import type { MiddlewareHandler } from 'hono';
import type { Env } from '../types';
import { clientIp, timingSafeEqual } from '../util';

/**
 * Every legitimate request reaches this Worker through the nginx in front of YOUR_DOMAIN
 * (deploy/nginx/YOUR_DOMAIN.conf), which stamps X-Edge-Auth: $EDGE_SECRET on everything it
 * proxies - the Wasender webhook, Bitrix event handlers and the SPA's own /api and /admin calls
 * alike. The Worker is also reachable directly on its workers.dev URL, which is how the
 * 2026-09 flood reached the inbound webhook with nothing but a (since rotated) webhook_secret:
 * 6,793 requests that never passed through nginx at all. This gate closes that path.
 *
 * Fails closed when EDGE_SECRET is unset: without the secret there is no way to tell a proxied
 * request from a direct one, and a gate that opens on a missing binding is not a gate. Ops must
 * `wrangler secret put EDGE_SECRET` before deploying.
 *
 * An additional layer only - the routes behind it keep their own auth (the webhook's
 * webhook_secret, /api/*'s signed app session, /admin/*'s X-Admin-Key).
 */
export const requireEdgeAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const provided = c.req.header('X-Edge-Auth');
  const secret = c.env.EDGE_SECRET;

  // clientIp only trusts X-Real-Client-IP alongside a matching edge secret, so a request that
  // failed this gate degrades to CF-Connecting-IP (the VPS address for proxied traffic, the
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
