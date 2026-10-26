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

Nothing else changes: the license applies to that one portal.

## Who it is for

Agencies and resellers who run the connector for their own customers and want their brand - not
ACP GROUP's - to be what the end customer sees.

## How to get it

**Contact licensing@acp-24.com** (or https://acp-24.com). You will receive:

1. a license key bound to your portal, and
2. the licensing endpoint to set as `LICENSE_SERVER_URL` in `wrangler.jsonc`.

Paste the key into the app's license panel (**License** tab) and the portal switches to
white-label.

See [LICENSE](LICENSE) for the terms that apply without a white-label license.
