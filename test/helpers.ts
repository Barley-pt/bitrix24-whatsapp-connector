import { env } from 'cloudflare:test';
// Imported as text so schema.sql stays the single source of truth for the D1 shape.
import schema from '../schema.sql?raw';

/** Apply schema.sql to the in-memory test D1. */
export async function applySchema(): Promise<void> {
  // Strip comments to end-of-line before splitting: several comments contain a semicolon, which
  // would otherwise cut a CREATE TABLE in half. Safe here because no string literal in
  // schema.sql contains a double dash.
  const statements = schema
    .replace(/--[^\n]*/g, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

export async function resetDb(): Promise<void> {
  for (const table of [
    'message_log',
    'chat_map',
    'webhook_rate',
    'usage_counters',
    'whatsapp_sessions',
    'licenses',
    'portals',
  ]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}

export function frameForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const base: Record<string, string> = {
    DOMAIN: 'your-portal.bitrix24.com',
    PROTOCOL: '1',
    LANG: 'en',
    APP_SID: 'sid-1',
    AUTH_ID: 'access-token-1',
    AUTH_EXPIRES: '3600',
    REFRESH_ID: 'refresh-token-1',
    member_id: 'member-1',
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) form.set(k, v);
  return form;
}

/**
 * Build an /install request matching what Bitrix actually sends: DOMAIN/PROTOCOL/LANG/APP_SID as
 * URL query params, AUTH_ID/AUTH_EXPIRES/REFRESH_ID/member_id in the POST body. Observed live via
 * the nginx access log on 2026-08-05 - a plain form-in-body request (frameForm above) never
 * occurs against the real Bitrix24 Market install flow.
 */
export function frameRequest(url: string, overrides: Record<string, string> = {}): Request {
  const query: Record<string, string> = {
    DOMAIN: 'your-portal.bitrix24.com',
    PROTOCOL: '1',
    LANG: 'en',
    APP_SID: 'sid-1',
  };
  const body: Record<string, string> = {
    AUTH_ID: 'access-token-1',
    AUTH_EXPIRES: '3600',
    REFRESH_ID: 'refresh-token-1',
    member_id: 'member-1',
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (k in query) query[k] = v;
    else body[k] = v;
  }

  const form = new FormData();
  for (const [k, v] of Object.entries(body)) form.set(k, v);

  const target = new URL(url);
  for (const [k, v] of Object.entries(query)) target.searchParams.set(k, v);

  return new Request(target.toString(), { method: 'POST', body: form });
}
