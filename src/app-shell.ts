import type { CrmEntityType } from './crm';
import { issueSession } from './session';
import type { Env } from './types';

/** entityTypeId is only set when entityType is 'dynamic' (a Smart Process/SPA item). */
export type CrmTabPlacement = { entityType: CrmEntityType; entityId: number; entityTypeId?: number };

/**
 * Serve the built SPA with a signed session token injected.
 *
 * The token goes into the HTML rather than a cookie: the app renders inside a Bitrix24 iframe on
 * a third-party domain, where cookies are unreliable across browsers.
 */
export async function renderApp(
  env: Env,
  request: Request,
  memberId: string,
  view: 'setup' | 'connector-settings' | 'crm-tab',
  placement: { lineId: number } | CrmTabPlacement | null = null,
): Promise<Response> {
  const assetUrl = new URL('/index.html', request.url);
  const asset = await env.ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));

  if (!asset.ok) {
    return new Response('UI bundle missing - run `npm run ui:build`', { status: 500 });
  }

  const session = await issueSession(env, memberId);
  const bootstrap = JSON.stringify({ session, view, appVersion: env.APP_VERSION, placement });

  // The placeholder sits in the HTML as a quoted string so the bundle stays valid JS before
  // substitution; swapping it including its quotes turns it into an object literal.
  const html = (await asset.text()).replace(
    '"__CONNECTOR_BOOTSTRAP__"',
    // The bootstrap object is embedded in a <script> block, so close-tag sequences in the data
    // would break out of it. Nothing here is user-controlled today, but keep it inert.
    bootstrap.replace(/</g, '\\u003c'),
  );

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
