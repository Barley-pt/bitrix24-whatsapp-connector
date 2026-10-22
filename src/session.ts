import type { Env } from './types';
import { b64urlDecode, b64urlEncode, hmacSign, hmacVerify, nowSec } from './util';

/**
 * Short-lived signed token handed to the SPA so browser calls to /api/* can be attributed to a
 * portal without shipping the Bitrix OAuth token to the client. Signed with APP_SECRET
 * (HMAC-SHA256); self-contained, matches nothing external.
 */

const TTL_SEC = 3600;

interface SessionPayload {
  member_id: string;
  exp: number;
}

export async function issueSession(env: Env, memberId: string): Promise<string> {
  const payload: SessionPayload = { member_id: memberId, exp: nowSec() + TTL_SEC };
  const body = b64urlEncode(JSON.stringify(payload));
  return `${body}.${await hmacSign(env.APP_SECRET, body)}`;
}

export async function verifySession(env: Env, token: string | null): Promise<string | null> {
  if (!token) return null;

  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  if (!(await hmacVerify(env.APP_SECRET, body, sig))) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
    if (payload.exp < nowSec()) return null;
    return payload.member_id;
  } catch {
    return null;
  }
}
