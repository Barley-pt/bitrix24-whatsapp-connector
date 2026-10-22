import type { Env } from './types';

/**
 * Monthly conversation counters, backing Maestro's `max_conversations_per_month` feature.
 * A "conversation" is counted once, the instant its first chat_map row is created (see
 * inbound.ts) - an existing thread continuing never re-counts, mirroring how max_numbers only
 * gates provisioning a brand new session, not using an existing one.
 */

/** UTC calendar month, e.g. "2026-08". Matches usage_counters.period. */
export function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function conversationsThisMonth(env: Env, portalId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT conversations_initiated FROM usage_counters WHERE portal_id = ? AND period = ?',
  )
    .bind(portalId, currentPeriod())
    .first<{ conversations_initiated: number }>();
  return row?.conversations_initiated ?? 0;
}

export async function recordConversationInitiated(env: Env, portalId: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO usage_counters (portal_id, period, conversations_initiated)
     VALUES (?, ?, 1)
     ON CONFLICT(portal_id, period) DO UPDATE SET conversations_initiated = conversations_initiated + 1`,
  )
    .bind(portalId, currentPeriod())
    .run();
}
