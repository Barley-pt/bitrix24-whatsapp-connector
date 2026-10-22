# White-label license

The connector ships with ACP GROUP attribution built in: free-tier deployments render a
"Powered by ACP GROUP" footer (linking to https://acp-24.com) and use the branding defaults in
`src/brand.ts`. A **white-label license** is the commercial right to remove that attribution and
put your own brand in front of your customers.

## What it unlocks

When a portal's license carries the `white_label` feature, the forced footer disappears and the
`BRAND_*` Worker variables take effect:

| Variable | Controls |
|---|---|
| `BRAND_CONNECTOR_NAME` | Connector display name in Bitrix24 |
| `BRAND_BOT_NAME` | Display name of the audio-notification bot |
| `BRAND_SUPPORT_URL` | Support link rendered in the UI |

Nothing else changes: the license stays one-per-portal, Ed25519 signature-verified and cached in
D1 (see `src/license.ts` and `src/brand.ts`).

## Who it is for

Agencies and resellers who run the connector for their own customers and want their brand - not
ACP GROUP's - to be what the end customer sees.

## How to get it

- **Try it first**: a 14-day white-label trial key, self-served from the app UI - open the app's
  license panel, paste the key, and the portal switches to white label for the trial period.
- **Buy it, or ask anything**: licensing@acp-24.com or https://acp-24.com

Licensing is handled by [Maestro](https://maestro.acp-24.com), the license server this connector
talks to (`LICENSE_SERVER_URL` in `wrangler.jsonc`, product slug `wa-connector`).

See [LICENSE](LICENSE) for the terms that apply without a white-label license.
