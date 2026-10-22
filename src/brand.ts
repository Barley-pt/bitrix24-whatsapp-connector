import { snapshot, type LicenseSnapshot } from './license';
import type { Env, PortalRow } from './types';

/**
 * White-label branding (src/brand.ts).
 *
 * Two modes:
 *  - Free tier (default): forced "Powered by ACP GROUP" attribution plus a support link.
 *  - White label: no forced attribution; display names may be overridden per deployment through
 *    the BRAND_* Worker vars.
 *
 * The mode comes from the license envelope's `features.white_label`, so only an active,
 * signature-verified license can switch branding off (see whiteLabelOf below).
 */
export interface Branding {
  poweredBy: string | null; // null = no forced branding (white-label)
  connectorName: string;
  botName: string;
  supportUrl: string | null;
}

/** Display name of the audio-notification bot when no BRAND_BOT_NAME override is set. */
export const DEFAULT_BOT_NAME = 'WhatsApp Audio';

/** Attribution shown (and linked) on free-tier deployments. */
export const FREE_TIER_POWERED_BY = 'ACP GROUP';
export const FREE_TIER_SUPPORT_URL = 'https://acp-24.com';

/**
 * white_label only counts from a licensed snapshot: an expired/revoked/unsigned envelope never
 * reaches `licensed`, so a lapsed portal falls back to free-tier branding instead of keeping the
 * white-label it was sold.
 */
export function whiteLabelOf(snap: LicenseSnapshot | null): boolean {
  return snap?.licensed === true && snap.features.white_label === true;
}

export function resolveBranding(env: Env, whiteLabel: boolean): Branding {
  if (whiteLabel) {
    return {
      poweredBy: null,
      connectorName: env.BRAND_CONNECTOR_NAME || env.CONNECTOR_NAME,
      botName: env.BRAND_BOT_NAME || DEFAULT_BOT_NAME,
      supportUrl: env.BRAND_SUPPORT_URL || null,
    };
  }
  return {
    poweredBy: FREE_TIER_POWERED_BY,
    connectorName: env.CONNECTOR_NAME,
    botName: DEFAULT_BOT_NAME,
    supportUrl: FREE_TIER_SUPPORT_URL,
  };
}

/** Convenience for callers that hold a portal row but no license snapshot yet (app shell, widget). */
export async function brandingForPortal(env: Env, portal: PortalRow | null): Promise<Branding> {
  if (!portal) return resolveBranding(env, false);
  const snap = await snapshot(env, portal).catch(() => null);
  return resolveBranding(env, whiteLabelOf(snap));
}
