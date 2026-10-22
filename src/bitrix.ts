import { decrypt } from './crypto';
import { updatePortalTokens } from './db';
import type { Env, PortalRow } from './types';

const OAUTH_TOKEN_URL = 'https://oauth.bitrix.info/oauth/token/';

/** Bitrix error codes that mean "the access token is stale, refresh and retry". */
const EXPIRED_CODES = new Set(['expired_token', 'invalid_token', 'NO_AUTH_FOUND']);

export class BitrixError extends Error {
  constructor(
    readonly code: string,
    readonly description: string,
    readonly method: string,
  ) {
    super(`${method}: ${code} - ${description}`);
    this.name = 'BitrixError';
  }
}

interface BitrixResponse<T> {
  result?: T;
  error?: string;
  error_description?: string;
}

/**
 * Call a REST method in application context.
 *
 * Refreshes once on an expired access token. Methods like imconnector.register reject webhook
 * auth outright (WRONG_AUTH_TYPE: "Application context required"), which is why every call goes
 * through the stored OAuth token rather than a portal webhook.
 */
export async function callMethod<T = unknown>(
  env: Env,
  portal: PortalRow,
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  let accessToken = await decrypt(portal.access_token, env.TOKEN_ENC_KEY);

  let response = await post<T>(portal.client_endpoint, method, params, accessToken);

  if (response.error && EXPIRED_CODES.has(response.error)) {
    accessToken = await refreshAccessToken(env, portal);
    response = await post<T>(portal.client_endpoint, method, params, accessToken);
  }

  if (response.error) {
    throw new BitrixError(response.error, response.error_description ?? '', method);
  }
  return response.result as T;
}

async function post<T>(
  clientEndpoint: string,
  method: string,
  params: Record<string, unknown>,
  accessToken: string,
): Promise<BitrixResponse<T>> {
  const url = `${clientEndpoint.replace(/\/$/, '')}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...params, auth: accessToken }),
  });

  // Bitrix returns its error envelope with a 4xx status, so parse the body either way.
  const body = (await res.json().catch(() => null)) as BitrixResponse<T> | null;
  if (!body) {
    return { error: 'ERROR_UNEXPECTED_ANSWER', error_description: `HTTP ${res.status}` };
  }
  return body;
}

/**
 * Prove that an access token handed to us in an event payload really came from that portal.
 *
 * Needed where application_token cannot be the check: on ONAPPUPDATE the token is legitimately
 * allowed to change, so comparing it against the stored one would reject genuine events and
 * accepting it blindly would let anyone rewrite a portal's credentials. Calling a scope-free
 * method with the supplied token settles it: only Bitrix could have issued a working one.
 */
export async function verifyAccessToken(
  clientEndpoint: string,
  accessToken: string,
): Promise<boolean> {
  const res = await post<unknown>(clientEndpoint, 'server.time', {}, accessToken);
  return !res.error;
}

/** Exchange the stored refresh token for a fresh pair and persist both. */
export async function refreshAccessToken(env: Env, portal: PortalRow): Promise<string> {
  const refreshToken = await decrypt(portal.refresh_token, env.TOKEN_ENC_KEY);

  const url = new URL(OAUTH_TOKEN_URL);
  url.searchParams.set('grant_type', 'refresh_token');
  url.searchParams.set('client_id', env.BITRIX_CLIENT_ID);
  url.searchParams.set('client_secret', env.BITRIX_CLIENT_SECRET);
  url.searchParams.set('refresh_token', refreshToken);

  const res = await fetch(url.toString());
  const body = (await res.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  } | null;

  if (!body?.access_token || !body.refresh_token) {
    throw new BitrixError(
      body?.error ?? 'REFRESH_FAILED',
      body?.error_description ?? `HTTP ${res.status}`,
      'oauth.token.refresh',
    );
  }

  await updatePortalTokens(env, portal.id, body.access_token, body.refresh_token);
  return body.access_token;
}
