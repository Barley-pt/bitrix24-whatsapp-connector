import { type Context, Hono } from 'hono';
import { getPortalByDomain } from '../db';
import * as license from '../license';
import type { Env, PortalRow } from '../types';
import { timingSafeEqual } from '../util';

/**
 * Operator-only license administration. There is no self-serve purchase flow, so a license key
 * is bound to a portal here after it has been issued/sold - the operator-side counterpart to the
 * app UI's self-service activation.
 *
 * Auth: shared secret via X-Admin-Key (`ADMIN_SECRET`). Not a Bitrix session - this never runs
 * inside a portal's iframe.
 */
export const adminRoutes = new Hono<{ Bindings: Env }>();

adminRoutes.use('/admin/*', async (c, next) => {
  const provided = c.req.header('X-Admin-Key');
  if (!provided || !c.env.ADMIN_SECRET || !(await timingSafeEqual(provided, c.env.ADMIN_SECRET))) {
    return c.json({ error: 'UNAUTHORIZED' }, 401);
  }
  await next();
});

async function resolvePortal(c: Context<{ Bindings: Env }>): Promise<PortalRow | null> {
  const domain = c.req.param('domain');
  if (!domain) return null;
  return getPortalByDomain(c.env, domain);
}

adminRoutes.get('/admin/portals/:domain/license', async (c) => {
  const portal = await resolvePortal(c);
  if (!portal) return c.json({ error: 'NOT_FOUND' }, 404);
  return c.json(await license.snapshot(c.env, portal));
});

/** Bind (or replace) a purchased license key on this portal. Activates it upstream. */
adminRoutes.post('/admin/portals/:domain/license', async (c) => {
  const portal = await resolvePortal(c);
  if (!portal) return c.json({ error: 'NOT_FOUND' }, 404);

  const body = await c.req.json<{ licenseKey?: string }>().catch(() => null);
  const licenseKey = body?.licenseKey?.trim();
  if (!licenseKey) return c.json({ error: 'BAD_REQUEST', message: 'licenseKey is required' }, 400);

  const result = await license.activate(c.env, portal, licenseKey);
  return c.json(result, result.ok ? 200 : 400);
});

/** Force a re-check now, rather than waiting for the 12h cron cadence. */
adminRoutes.post('/admin/portals/:domain/license/revalidate', async (c) => {
  const portal = await resolvePortal(c);
  if (!portal) return c.json({ error: 'NOT_FOUND' }, 404);

  const result = await license.validate(c.env, portal);
  return c.json(result, result.ok ? 200 : 400);
});

/** Release the seat and forget the cached envelope - the portal goes unlicensed immediately. */
adminRoutes.delete('/admin/portals/:domain/license', async (c) => {
  const portal = await resolvePortal(c);
  if (!portal) return c.json({ error: 'NOT_FOUND' }, 404);

  await license.deactivate(c.env, portal);
  return c.json({ ok: true });
});
