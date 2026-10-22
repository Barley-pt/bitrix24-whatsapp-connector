import { fromBase64, toBase64 } from './util';

/**
 * AES-256-GCM at rest for Bitrix OAuth tokens and WasenderAPI credentials.
 * TOKEN_ENC_KEY is a base64 32-byte key (`openssl rand -base64 32`).
 * Ciphertext format: base64(iv[12] || ciphertext||tag).
 */

const keyCache = new Map<string, CryptoKey>();

async function importKey(rawKeyB64: string): Promise<CryptoKey> {
  const cached = keyCache.get(rawKeyB64);
  if (cached) return cached;

  const raw = fromBase64(rawKeyB64);
  if (raw.byteLength !== 32) {
    throw new Error('TOKEN_ENC_KEY must be a base64-encoded 32-byte key');
  }
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
  keyCache.set(rawKeyB64, key);
  return key;
}

export async function encrypt(plaintext: string, rawKeyB64: string): Promise<string> {
  const key = await importKey(rawKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  const packed = new Uint8Array(iv.byteLength + ct.byteLength);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ct), iv.byteLength);
  return toBase64(packed);
}

export async function decrypt(packedB64: string, rawKeyB64: string): Promise<string> {
  const key = await importKey(rawKeyB64);
  const packed = fromBase64(packedB64);
  if (packed.byteLength <= 12) throw new Error('ciphertext too short');

  const iv = packed.subarray(0, 12);
  const ct = packed.subarray(12);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
