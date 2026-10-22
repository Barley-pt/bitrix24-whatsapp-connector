# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem. Instead:

- open a GitHub security advisory on this repository (Security -> Advisories -> Report a
  vulnerability), or
- email security@acp-24.com with the details, reproduction steps and affected version.

We will acknowledge the report and agree a fix and disclosure timeline with you.

## Scope

This is self-hosted software: **you** are responsible for your own deployment's secrets and
configuration.

- **In scope**: vulnerabilities in this connector's code (the Worker, the UI, the D1 schema).
- **Out of scope**: anything that already requires your Cloudflare account, your Worker secrets
  or Bitrix24 portal-administrator rights; vulnerabilities in upstream dependencies, in Bitrix24
  itself, or in WasenderAPI (report those upstream).

Secrets belong in Worker secrets / `.dev.vars`, never in version control - see
`.dev.vars.example` for the full list (`APP_SECRET`, `TOKEN_ENC_KEY`, `ADMIN_SECRET`,
`EDGE_SECRET`, `BITRIX_CLIENT_SECRET`, `WASENDER_MASTER_TOKEN`). Rotate any of them if exposed.

## Built-in security model

- **Per-session webhook tokens** - every Wasender session gets its own unguessable webhook token,
  so a leaked webhook URL for one number does not expose another (`src/routes/webhook.ts`).
- **AES-256-GCM at rest** - Bitrix OAuth tokens and Wasender credentials stored in D1 are
  encrypted with `TOKEN_ENC_KEY`, never persisted in plaintext (`src/crypto.ts`).
- **Optional edge auth** - setting `EDGE_SECRET` requires a matching `X-Edge-Auth` shared secret
  on every request, stamped by your reverse proxy (`src/middleware/edgeAuth.ts`,
  `deploy/nginx/connector.conf`).
- **Rate limiting** - inbound webhook deliveries are capped per session per minute
  (`webhook_rate` table), so a flooded or compromised upstream cannot overwhelm Bitrix or the
  queues (`src/routes/webhook.ts`).
- **Authenticated install/events** - Bitrix events are validated against the portal's stored
  `application_token`, and a forged `ONAPPINSTALL` for a known portal is rejected
  (`src/routes/events.ts`).
- **Licensing fails closed** - with `LICENSE_ENFORCE=true`, an envelope whose Ed25519 signature
  does not verify (or whose grace window has lapsed) means unlicensed; the signature is
  re-checked on every read, not trusted from D1 (`src/license.ts`).
