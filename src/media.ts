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
 * URL", the Wasender API docs) and fetch it server-side while processing the send. A Bitrix
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

// ─── Inbound media staging (R2) ─────────────────────────────────────────
//
// Direction audit, so the asymmetry is documented rather than accidental: OUTBOUND (above) is
// Worker-served already - /media/:token wraps a Bitrix attachment link in a short-lived signed
// token and streams it from Bitrix on demand, nothing is copied. INBOUND (below) is the opposite
// shape: the bytes only exist at Wasender's temporary URL, so they are copied into R2 once, at
// decrypt time, and served from here afterwards. Outbound is deliberately left alone - it does not
// depend on anyone else's expiry beyond the send that is already in flight.

/**
 * How long a re-hosted inbound attachment survives. Bitrix normally fetches the URL within seconds
 * of the message arriving; a week is headroom for a delayed or retried fetch, not a storage plan.
 * The hourly cron (index.ts, scheduled) deletes anything older - see cleanupStagedMedia.
 */
export const STAGED_MEDIA_MAX_AGE_SEC = 7 * 24 * 60 * 60;

/**
 * Fetch Wasender's freshly decrypted media and re-host it in R2 under a random key, returning a URL
 * this Worker serves (/media/inbound/:key) instead of Wasender's ~1h temp URL.
 *
 * Bitrix fetches the link server-to-server with no auth header to present, so possession of the URL
 * is the only credential there is - the key is therefore a bare crypto.randomUUID(), unguessable by
 * construction (same capability model as the audio route below, minus a session token Bitrix cannot
 * send). Callers must be inside the decrypt-then-send window: the fetch here is itself the
 * immediate fetch of the freshly decrypted URL.
 *
 * Never fatal. Returning null means "pass the temp URL on", because an attachment that expires
 * early still beats one that is dropped outright.
 */
export async function stageInboundMedia(
  env: Env,
  sourceUrl: string,
  filename: string,
): Promise<string | null> {
  const key = crypto.randomUUID();
  try {
    const res = await fetch(sourceUrl, { redirect: 'follow' });
    if (!res.ok || !res.body) throw new Error(`media fetch HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
    await env.AUDIO_STAGING.put(key, res.body, {
      httpMetadata: { contentType },
      // contentType is duplicated into customMetadata so the serve route does not depend on the
      // binding surfacing httpMetadata on read; created_at is what the cleanup cron reads.
      customMetadata: { contentType, filename, created_at: String(nowSec()) },
    });
    return `${env.PUBLIC_URL}/media/inbound/${key}`;
  } catch (err) {
    // Single-line JSON, path only: the source URL is Wasender's, its query string may carry
    // credentials, and the reason is the only part worth keeping.
    let path = 'unparseable-url';
    try {
      path = new URL(sourceUrl).pathname;
    } catch {
      /* keep the placeholder */
    }
    console.warn(
      JSON.stringify({
        msg: 'inbound media re-host failed; falling back to Wasender temp url',
        path,
        error: err instanceof Error ? err.message : String(err),
      }),
    );
    return null;
  }
}

/** RFC 6266 filename for a staged object. `inline` keeps WhatsApp photos/videos previewable in the
 * Bitrix timeline; the ASCII copy is what anything that downloads it uses. Both the header's quoted
 * form and the R2 metadata come from WhatsApp's own fileName field, so quotes/CR/LF/backslash and
 * anything outside ASCII are neutralised before the value reaches a header. */
function contentDisposition(filename?: string): string {
  const raw = filename && filename.trim() ? filename : 'file';
  const ascii = raw.replace(/["\\\r\n]/g, '_').replace(/[^\x20-\x7e]/g, '_');
  const encoded = encodeURIComponent(raw).replace(
    /['()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `inline; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

/**
 * Public GET for one staged inbound attachment. Public on purpose: Bitrix presents no session, no
 * signature and no header of any kind - the unguessable key in the path is the whole
 * authentication (stageInboundMedia). An unknown key, a malformed key and an expired key all answer
 * identically, so the route never confirms which of the three a probe hit.
 */
mediaRoutes.get('/media/inbound/:key', async (c) => {
  const key = c.req.param('key');
  // Only the shape we ever write is looked up, so a scan never reaches R2.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return c.text('not found', 404);
  }
  const obj = await c.env.AUDIO_STAGING.get(key);
  if (!obj) return c.text('not found', 404);
  return new Response(obj.body, {
    status: 200,
    headers: {
      'Content-Type':
        obj.customMetadata?.contentType ?? obj.httpMetadata?.contentType ?? 'application/octet-stream',
      'Content-Disposition': contentDisposition(obj.customMetadata?.filename),
      // Long enough to outlive the object's own STAGED_MEDIA_MAX_AGE_SEC window; a cached copy
      // served after deletion would only be a copy of what was already fetched.
      'Cache-Control': 'private, max-age=604800',
    },
  });
});

/**
 * Cron-only (index.ts, scheduled): drop staged objects past STAGED_MEDIA_MAX_AGE_SEC so the bucket
 * does not grow without bound. Age is read from the customMetadata.created_at that
 * stageInboundMedia writes and falls back to the object's own uploaded timestamp, so anything an
 * older build put in the bucket still expires. Returns the number of objects deleted.
 */
export async function cleanupStagedMedia(env: Env): Promise<number> {
  const cutoff = nowSec() - STAGED_MEDIA_MAX_AGE_SEC;
  let deleted = 0;
  let cursor: string | undefined;
  for (;;) {
    // `include` is not optional: a bare list() answers with empty metadata objects, so the
    // created_at written at PUT time would be invisible here and nothing would ever expire.
    const page = await env.AUDIO_STAGING.list({
      ...(cursor ? { cursor } : {}),
      include: ['customMetadata'],
    });
    for (const obj of page.objects) {
      const written = Number(obj.customMetadata?.created_at);
      const createdSec =
        Number.isFinite(written) && written > 0
          ? written
          : Math.floor(obj.uploaded.getTime() / 1000);
      if (createdSec > cutoff) continue;
      await env.AUDIO_STAGING.delete(obj.key);
      deleted += 1;
    }
    if (!page.truncated || !page.cursor) break;
    cursor = page.cursor;
  }
  if (deleted > 0) {
    console.log(JSON.stringify({ msg: 'staged media cleanup', deleted, olderThanSec: STAGED_MEDIA_MAX_AGE_SEC }));
  }
  return deleted;
}

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
