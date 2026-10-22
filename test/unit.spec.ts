import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { decrypt, encrypt } from '../src/crypto';
import { issueSession, verifySession } from '../src/session';
import { clientIp, parsePhpFormData, timingSafeEqual } from '../src/util';

describe('crypto', () => {
  it('round-trips a token', async () => {
    const secret = 'access-token-abc123';
    const sealed = await encrypt(secret, env.TOKEN_ENC_KEY);

    expect(sealed).not.toContain(secret);
    expect(await decrypt(sealed, env.TOKEN_ENC_KEY)).toBe(secret);
  });

  it('uses a fresh iv per call', async () => {
    const a = await encrypt('same', env.TOKEN_ENC_KEY);
    const b = await encrypt('same', env.TOKEN_ENC_KEY);
    expect(a).not.toBe(b);
  });

  it('rejects a tampered ciphertext', async () => {
    const sealed = await encrypt('secret', env.TOKEN_ENC_KEY);
    const flipped = `${sealed.slice(0, -2)}${sealed.slice(-2) === 'AA' ? 'BB' : 'AA'}`;
    await expect(decrypt(flipped, env.TOKEN_ENC_KEY)).rejects.toThrow();
  });

  it('rejects a key of the wrong length', async () => {
    await expect(encrypt('x', btoa('too-short'))).rejects.toThrow(/32-byte/);
  });
});

describe('parsePhpFormData', () => {
  it('rebuilds the nested auth block Bitrix sends', () => {
    const form = new FormData();
    form.set('event', 'ONAPPINSTALL');
    form.set('auth[access_token]', 'tok');
    form.set('auth[application_token]', 'apptok');
    form.set('data[VERSION]', '1');

    const parsed = parsePhpFormData(form) as {
      event: string;
      auth: { access_token: string; application_token: string };
      data: { VERSION: string };
    };

    expect(parsed.event).toBe('ONAPPINSTALL');
    expect(parsed.auth.access_token).toBe('tok');
    expect(parsed.auth.application_token).toBe('apptok');
    expect(parsed.data.VERSION).toBe('1');
  });

  it('rebuilds deep message arrays', () => {
    const form = new FormData();
    form.set('data[MESSAGES][0][im][chat_id]', '1807');
    form.set('data[MESSAGES][0][message][text]', 'hello');

    const parsed = parsePhpFormData(form) as {
      data: { MESSAGES: Record<string, { im: { chat_id: string }; message: { text: string } }> };
    };

    expect(parsed.data.MESSAGES['0']?.im.chat_id).toBe('1807');
    expect(parsed.data.MESSAGES['0']?.message.text).toBe('hello');
  });
});

describe('session tokens', () => {
  it('round-trips a member id', async () => {
    const token = await issueSession(env, 'member-xyz');
    expect(await verifySession(env, token)).toBe('member-xyz');
  });

  it('rejects a tampered payload', async () => {
    const token = await issueSession(env, 'member-xyz');
    const [, sig] = token.split('.');
    const forged = `${btoa(JSON.stringify({ member_id: 'attacker', exp: 9999999999 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')}.${sig}`;

    expect(await verifySession(env, forged)).toBeNull();
  });

  it('rejects malformed input', async () => {
    expect(await verifySession(env, null)).toBeNull();
    expect(await verifySession(env, 'nonsense')).toBeNull();
  });
});

describe('clientIp', () => {
  const build = (headers: Record<string, string>) =>
    new Request('https://relay.test/health', { headers });

  it('prefers the nginx header when the edge secret matches', () => {
    const req = build({
      'CF-Connecting-IP': '94.46.172.101',
      'X-Real-Client-IP': '203.0.113.9',
      'X-Edge-Auth': 'edge-secret',
    });
    expect(clientIp(req, 'edge-secret')).toBe('203.0.113.9');
  });

  it('ignores a spoofed header without the edge secret', () => {
    const req = build({ 'CF-Connecting-IP': '94.46.172.101', 'X-Real-Client-IP': '203.0.113.9' });

    // Direct workers.dev callers can set any header they like, so an unaccompanied claim loses.
    expect(clientIp(req, 'edge-secret')).toBe('94.46.172.101');
    expect(clientIp(req, undefined)).toBe('94.46.172.101');
  });

  it('ignores a mismatched edge secret', () => {
    const req = build({
      'CF-Connecting-IP': '94.46.172.101',
      'X-Real-Client-IP': '203.0.113.9',
      'X-Edge-Auth': 'wrong',
    });
    expect(clientIp(req, 'edge-secret')).toBe('94.46.172.101');
  });

  it('falls back when nothing identifies the caller', () => {
    expect(clientIp(build({}), 'edge-secret')).toBe('unknown');
  });
});

describe('timingSafeEqual', () => {
  it('compares by value', async () => {
    expect(await timingSafeEqual('abc', 'abc')).toBe(true);
    expect(await timingSafeEqual('abc', 'abd')).toBe(false);
    expect(await timingSafeEqual('abc', '')).toBe(false);
  });
});
