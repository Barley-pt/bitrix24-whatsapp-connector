import { createExecutionContext, env, fetchMock, waitOnExecutionContext } from 'cloudflare:test';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import worker from '../src/index';
import { cleanupStagedMedia, stageInboundMedia, STAGED_MEDIA_MAX_AGE_SEC } from '../src/media';
import { installFakeR2 } from './helpers';

const WASENDER = 'https://wasender.test';

/** GET a Worker route as Bitrix would: no auth header, no session - just the URL. */
async function get(path: string): Promise<Response> {
  const ctx = createExecutionContext();
  const res = await worker.fetch(new Request(`https://relay.test${path}`), env, ctx);
  await waitOnExecutionContext(ctx);
  return res;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

beforeAll(() => {
  installFakeR2(env);
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

afterEach(() => fetchMock.assertNoPendingInterceptors());

describe('stageInboundMedia', () => {
  it('copies the bytes into R2 with their metadata and hands back a Worker URL', async () => {
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypted-media/wamid-1', method: 'GET' })
      .reply(200, 'OGG-BYTES', { headers: { 'content-type': 'audio/ogg' } });

    const url = await stageInboundMedia(env, `${WASENDER}/api/decrypted-media/wamid-1`, 'voice.ogg');
    expect(url).toMatch(/^https:\/\/relay\.test\/media\/inbound\//);

    const key = url!.slice(url!.lastIndexOf('/') + 1);
    expect(key).toMatch(uuidPattern);
    const stored = await env.AUDIO_STAGING.get(key);
    expect(stored).not.toBeNull();
    expect(await stored!.text()).toBe('OGG-BYTES');
    expect(stored!.httpMetadata?.contentType).toBe('audio/ogg');
    expect(stored!.customMetadata?.filename).toBe('voice.ogg');
    // What the cleanup cron reads to work out the object's age.
    expect(Number(stored!.customMetadata?.created_at)).toBeGreaterThan(Math.floor(Date.now() / 1000) - 60);
  });

  it('returns null when the source fetch fails, so the caller can pass the temp URL on', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // No interceptor for this path: disableNetConnect makes the fetch throw.
    const url = await stageInboundMedia(env, `${WASENDER}/api/decrypted-media/wamid-dead`, 'photo.jpg');
    expect(url).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    const line = JSON.parse(warn.mock.calls[0]![0] as string) as { msg: string; path: string };
    expect(line.msg).toBe('inbound media re-host failed; falling back to Wasender temp url');
    expect(line.path).toBe('/api/decrypted-media/wamid-dead');
    warn.mockRestore();
  });
});

describe('GET /media/inbound/:key', () => {
  it('streams the staged object with its content type and filename', async () => {
    fetchMock
      .get(WASENDER)
      .intercept({ path: '/api/decrypted-media/wamid-2', method: 'GET' })
      .reply(200, 'PNG-BYTES', { headers: { 'content-type': 'image/png' } });
    const url = await stageInboundMedia(env, `${WASENDER}/api/decrypted-media/wamid-2`, 'photo "x".png');

    const res = await get(url!.replace('https://relay.test', ''));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    // Quotes in the original name are neutralised in the ASCII form, the RFC 5987 form keeps them.
    expect(res.headers.get('content-disposition')).toContain('filename="photo _x_.png"');
    expect(res.headers.get('content-disposition')).toContain("filename*=UTF-8''photo%20%22x%22.png");
    expect(await res.text()).toBe('PNG-BYTES');
  });

  it('answers 404 identically for an unknown key and for a key of the wrong shape', async () => {
    const unknown = await get(`/media/inbound/${crypto.randomUUID()}`);
    expect(unknown.status).toBe(404);
    expect(await unknown.text()).toBe('not found');

    const malformed = await get('/media/inbound/not-a-uuid');
    expect(malformed.status).toBe(404);
    expect(await malformed.text()).toBe('not found');
  });
});

describe('cleanupStagedMedia', () => {
  it('deletes staged objects past the retention window and keeps everything younger', async () => {
    const now = Math.floor(Date.now() / 1000);
    const expired = now - STAGED_MEDIA_MAX_AGE_SEC - 60;
    await env.AUDIO_STAGING.put('expired-key', 'gone', {
      customMetadata: { created_at: String(expired), filename: 'old.jpg' },
    });
    await env.AUDIO_STAGING.put('fresh-key', 'kept', {
      customMetadata: { created_at: String(now - 60), filename: 'new.jpg' },
    });
    // No created_at at all (a voice note staged by the audio path, or an older build): age falls
    // back to the object's own uploaded timestamp, which is "now" here - so it must survive.
    await env.AUDIO_STAGING.put('metadataless-key', 'kept-too', {});

    const deleted = await cleanupStagedMedia(env);
    expect(deleted).toBe(1);
    expect(await env.AUDIO_STAGING.get('expired-key')).toBeNull();
    expect(await env.AUDIO_STAGING.get('fresh-key')).not.toBeNull();
    expect(await env.AUDIO_STAGING.get('metadataless-key')).not.toBeNull();

    await env.AUDIO_STAGING.delete('fresh-key');
    await env.AUDIO_STAGING.delete('metadataless-key');
  });
});
