export const nowSec = (): number => Math.floor(Date.now() / 1000);

export const uuid = (): string => crypto.randomUUID();

export function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromBase64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/**
 * Bitrix24 sends event handler payloads as application/x-www-form-urlencoded with PHP-style
 * bracket keys (auth[access_token], data[MESSAGES][0][im][chat_id]). Rebuild the nested object.
 */
export function parsePhpFormData(form: FormData): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const [rawKey, value] of form.entries()) {
    const match = rawKey.match(/^([^[\]]+)((\[[^[\]]*\])*)$/);
    if (!match) continue;

    const segments: string[] = [match[1] as string];
    for (const part of (match[2] ?? '').matchAll(/\[([^[\]]*)\]/g)) {
      segments.push(part[1] as string);
    }

    let cursor: Record<string, unknown> = root;
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i] as string;
      const existing = cursor[key];
      if (typeof existing !== 'object' || existing === null) {
        cursor[key] = {};
      }
      cursor = cursor[key] as Record<string, unknown>;
    }
    cursor[segments[segments.length - 1] as string] = String(value);
  }

  return root;
}

/**
 * Real client IP.
 *
 * relay.acp-24.com is served by nginx on the ACP VPS reverse-proxying to *.workers.dev, so by the
 * time a request reaches the Worker, Cloudflare has set CF-Connecting-IP to the VPS address and
 * appended it to X-Forwarded-For. Neither header identifies the caller any more. nginx therefore
 * forwards the true address as X-Real-Client-IP, a name Cloudflare leaves untouched.
 *
 * The Worker is also reachable directly on its workers.dev URL, where anyone could set that
 * header, so it is believed only alongside the shared X-Edge-Auth secret that only our nginx
 * knows. A plain compare is sufficient: the worst case for a forged value is a wrong address in a
 * log line, not an auth bypass.
 */
export function clientIp(request: Request, edgeSecret?: string): string {
  const forwarded = request.headers.get('X-Real-Client-IP');
  if (forwarded && edgeSecret && request.headers.get('X-Edge-Auth') === edgeSecret) {
    return forwarded;
  }
  return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

/**
 * Bitrix's BBCode-ish formatting, e.g. "[b]Klaus Weber:[/b] [br]Guten Tag!" - tags are stripped
 * but their inner text is kept, so the operator's name survives as a plain prefix ("Klaus Weber:
 * Guten Tag!"). [br]/[br/] becomes a newline. Not a full BBCode parser, just what Bitrix's Open
 * Line messenger actually emits.
 *
 * Lives here rather than in outbound.ts because routes/events.ts has to measure "is there anything
 * to send" the same way the queue consumer does. When the two disagreed, an attachment-only reply
 * whose text was pure BBCode passed the enqueue guard as non-empty and then reached Wasender as an
 * empty send, which it rejects outright - five retries and a dead letter for a message Bitrix then
 * showed as undelivered (confirmed live on b24-ynumvs.bitrix24.com.br, 2026-08-18 21:48 UTC).
 */
export function stripBBCode(text: string): string {
  return text
    .replace(/\[br\s*\/?\]/gi, '\n')
    .replace(/\[\/?[a-z][a-z0-9]*(?:=[^\]]*)?\]/gi, '')
    .trim();
}

/**
 * Whitespace-normalize text for the outbound/app-sent echo match (see inbound.ts,
 * detectOutboundEcho). Used identically on both sides of the comparison - outbound.ts when it
 * records what it sent, inbound.ts when it checks an upsert against that record - so it must stay
 * a pure function with no session or timing dependency.
 */
export function normalizeEchoText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Self-contained "<body>.<signature>" tokens, signed with APP_SECRET (HMAC-SHA256). Two callers,
 * both handing a token to something that must not be trusted with anything else: the SPA session
 * token (session.ts) and the media proxy token (media.ts). Neither matches anything external, so
 * the encoding only has to survive a URL.
 */
export const b64urlEncode = (s: string): string =>
  btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export function b64urlDecode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  return atob(padded);
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function hmacSign(secret: string, body: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return b64urlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

export async function hmacVerify(secret: string, body: string, sig: string): Promise<boolean> {
  const key = await hmacKey(secret);
  const sigBytes = Uint8Array.from(b64urlDecode(sig), (c) => c.charCodeAt(0));
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body));
}

/** Constant-time string compare, for application_token and session token checks. */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= (ha[i] as number) ^ (hb[i] as number);
  return diff === 0;
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return new Uint8Array(digest);
}
