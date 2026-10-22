import { Hono } from 'hono';
import { refreshAccessToken } from './bitrix';
import { decrypt } from './crypto';
import { getPortalById } from './db';
import type { Env, PortalRow } from './types';
import { b64urlDecode, b64urlEncode, hmacSign, hmacVerify, nowSec, uuid } from './util';

/**
 * Public, short-lived proxy for one Bitrix attachment, so WasenderAPI can fetch it.
 *
 * Wasender's media sends take a URL, never bytes ("Provide the image via a publicly accessible
 * URL", wasenderapi-api-docs.md) and fetch it server-side while processing the send. A Bitrix
 * attachment link cannot simply be forwarded: ONIMCONNECTORMESSAGEADD delivers it portal-relative
 * on some payloads, and whatever `auth` signature it carries is Bitrix's, with no documented
 * lifetime we can rely on outliving a queued send. So the link is wrapped in a token signed with
 * APP_SECRET and served from our own domain.
 *
 * Nothing is stored: /media/:token streams straight from Bitrix on demand, so a file is only ever
 * readable while its token is valid. The token is a bearer credential for exactly one file - which
 * is inherent to handing a third party a URL at all - and is why the TTL is minutes, not days.
 */

/**
 * Long enough to cover a send that gets paced by Wasender's rate limiter (index.ts retries a 429
 * using its x-ratelimit-reset), short enough that a URL leaked from Wasender's logs is dead by the
 * time anyone reads them. A queue retry re-signs a fresh token anyway - outbound.ts builds these
 * per attempt, not once per message.
 */
const TTL_SEC = 30 * 60;

interface MediaPayload {
  /** portals.id - whose OAuth token may be spent re-fetching this, and whose domain is allowed. */
  p: string;
  /** The link exactly as Bitrix delivered it. */
  u: string;
  exp: number;
}

/**
 * Absolute URL for a link that may be portal-relative. Returns null when the result points
 * anywhere other than the portal itself: the link comes from an authenticated Bitrix event, but
 * this token is what makes a fetch happen from inside our Worker, so it is pinned to the one host
 * it is ever legitimately used for rather than left as an open redirect/SSRF shape.
 */
function resolveLink(portal: PortalRow, link: string): URL | null {
  let url: URL;
  try {
    url = new URL(link, `https://${portal.bitrix_domain}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;

  // client_endpoint as well as the domain: Bitrix hands both out separately and they differ on a
  // self-hosted portal (db.ts stores it verbatim for exactly that reason). A redirect off either
  // one - a large file served from Bitrix's CDN, say - is still followed at fetch time; this only
  // pins where the request may start.
  const allowed = new Set([portal.bitrix_domain, new URL(portal.client_endpoint).hostname]);
  return allowed.has(url.hostname) ? url : null;
}

/** Signed URL Wasender can fetch, or null when the link isn't one we're willing to proxy. */
export async function mediaProxyUrl(
  env: Env,
  portal: PortalRow,
  link: string,
): Promise<string | null> {
  if (!resolveLink(portal, link)) return null;

  const payload: MediaPayload = { p: portal.id, u: link, exp: nowSec() + TTL_SEC };
  const body = b64urlEncode(JSON.stringify(payload));
  return `${env.PUBLIC_URL}/media/${body}.${await hmacSign(env.APP_SECRET, body)}`;
}

async function verifyToken(env: Env, token: string): Promise<MediaPayload | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  if (!(await hmacVerify(env.APP_SECRET, body, sig))) return null;

  try {
    const payload = JSON.parse(b64urlDecode(body)) as MediaPayload;
    if (payload.exp < nowSec()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Bitrix disk links normally carry their own `auth` signature and download anonymously, so the
 * plain fetch is tried first. When that is refused, the portal's own OAuth token is added as the
 * same `auth` parameter every REST call uses, refreshing it once if it has aged out - the token
 * stored on the row can easily be older than an hour, since nothing else has needed it since.
 */
async function fetchFromBitrix(env: Env, portal: PortalRow, url: URL): Promise<Response> {
  const anonymous = await fetch(url.toString(), { redirect: 'follow' });
  if (anonymous.ok) return anonymous;

  const authed = new URL(url.toString());
  authed.searchParams.set('auth', await decrypt(portal.access_token, env.TOKEN_ENC_KEY));
  const first = await fetch(authed.toString(), { redirect: 'follow' });
  if (first.ok || (first.status !== 401 && first.status !== 403)) return first;

  authed.searchParams.set('auth', await refreshAccessToken(env, portal));
  return fetch(authed.toString(), { redirect: 'follow' });
}

export const mediaRoutes = new Hono<{ Bindings: Env }>();

mediaRoutes.get('/media/:token', async (c) => {
  const payload = await verifyToken(c.env, c.req.param('token'));
  // Deliberately indistinguishable from a token for a file that no longer exists: an expired
  // token, a forged one and a deleted attachment all answer the same way.
  if (!payload) return c.text('not found', 404);

  const portal = await getPortalById(c.env, payload.p);
  if (!portal) return c.text('not found', 404);

  const url = resolveLink(portal, payload.u);
  if (!url) return c.text('not found', 404);

  const upstream = await fetchFromBitrix(c.env, portal, url);
  if (!upstream.ok || !upstream.body) {
    // Worth a log line rather than a bare 502: from Wasender's side this is indistinguishable
    // from "the image failed to send", and the reason only exists here.
    console.warn(
      JSON.stringify({
        msg: 'media proxy could not fetch the Bitrix attachment',
        memberId: portal.member_id,
        status: upstream.status,
        path: url.pathname,
      }),
    );
    return c.text('upstream error', 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      // Wasender needs the length to stream large files; pass Bitrix's own through when it sent one.
      ...(upstream.headers.get('content-length')
        ? { 'Content-Length': upstream.headers.get('content-length') as string }
        : {}),
      // The URL is a bearer credential - never let it be cached by anything in between.
      'Cache-Control': 'no-store, private',
    },
  });
});

// ─── Audio staging (R2) ─────────────────────────────────────────────────

const AUDIO_MIME: Record<string, string> = {
  ogg: 'audio/ogg',
  mp4: 'audio/mp4',
  webm: 'audio/webm',
  opus: 'audio/ogg;codecs=opus',
};

export async function uploadAudioStaging(
  env: Env,
  sessionId: string,
  blob: ArrayBuffer,
  ext: string,
): Promise<{ key: string; url: string }> {
  const key = `${sessionId}-${uuid()}.${ext}`;
  await env.AUDIO_STAGING.put(key, blob, {
    httpMetadata: { contentType: AUDIO_MIME[ext] ?? 'audio/ogg' },
  });
  const url = `${env.PUBLIC_URL}/media/audio/${key}`;
  return { key, url };
}

export async function deleteAudioStaging(env: Env, key: string): Promise<void> {
  await env.AUDIO_STAGING.delete(key);
}

// Serves widget-recorded audio from R2 so Wasender can fetch it.
mediaRoutes.get('/media/audio/:key', async (c) => {
  const key = c.req.param('key');
  if (!key) return c.text('not found', 404);
  const obj = await c.env.AUDIO_STAGING.get(key);
  if (!obj) return c.text('not found', 404);
  return new Response(obj.body, {
    status: 200,
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'audio/ogg',
      'Cache-Control': 'no-store, private',
    },
  });
});
