# Bitrix24 WhatsApp Connector

A source-available Bitrix24 Market app that bridges WhatsApp (via WasenderAPI) into a native Bitrix24
Open Channel. Operators answer inside the Contact Center; the app UI only manages connections and
licensing.

Two surfaces, one backend:

1. **Native Open Channel** through `imconnector` (connector id `whatsapp_connector`) - CRM, queues,
   SLA, automatic lead/deal creation, all native.
2. **App UI** in the Bitrix24 iframe - connection state, number management, licence status. It
   deliberately does not duplicate the Open Lines inbox.

| | |
|---|---|
| Runtime | Cloudflare Worker, TypeScript + Hono |
| Database | Cloudflare D1 (`bitrix_whatsapp`) |
| UI | React 19 + Tailwind v4, built to a single inlined `index.html` |
| Licensing | [Maestro](https://maestro.acp-24.com), product slug `wa-connector` |
| License | Source-available, see [LICENSE](LICENSE) (not an OSI-approved open-source license) |
| Public URL | `https://YOUR_DOMAIN` |

Serving does not require the public domain's DNS to be on Cloudflare: an edge/reverse-proxy server
terminates TLS for `https://YOUR_DOMAIN` and reverse-proxies to the `*.workers.dev` URL. Cloudflare
hosts only the Worker and D1.

## Known limitations

Honest list of what does not work yet, so you know before deploying:

- **Group chats are on per number, with an opt-out.** A new number receives group traffic by
  default; turn it off per number in the connector settings widget (the app flips Wasender's
  `ignore_groups` for that session and stops `messages-group.received` from reaching the queue).
  Channels and broadcast messages have no destination in Bitrix and are always dropped.
- **Inbound media is re-hosted.** Decrypted media is fetched into the stack's R2 bucket the moment
  it is decrypted and handed to Bitrix as a `GET /media/inbound/:key` URL on this Worker's own
  domain, so the attachment outlives Wasender's one-hour temp link. The hourly cron deletes staged
  objects after 7 days - long past the seconds Bitrix normally takes to fetch. If staging fails the
  temp URL is passed on instead of dropping the attachment.
- **Click-to-chat may show "Join chat" instead of Reply/Forward/Close.** When the target chat's
  Open Line session was already worked (status `WORK`/`ANSWERED` rather than `NEW`), Bitrix shows
  a non-member "Join chat" button. The conversation still works; this is a UX quirk under
  investigation.
- **Licensing is optional.** The app runs fully with no license — free forever with the ACP GROUP
  attribution. A license key only unlocks white-label mode (your branding instead of ours), see
  [LICENSE-WHITE-LABEL.md](LICENSE-WHITE-LABEL.md). The separate `LICENSE_ENFORCE` switch (ships
  off) is for operators running this as a paid service who want plan caps enforced.
- **A delivery confirmation can still be missed.** Bitrix applies
  `imconnector.send.status.delivery` only while the message is still "sending" and answers
  `SUCCESS: true` even when it skips one, so if the confirmation keeps failing until the queue's
  retries run out, the reply stays red ("not delivered") in the Contact Center although the
  customer received it. See "Message flow" below for how the connector keeps that window small.

## Message flow

Both directions go through Cloudflare Queues: `routes/webhook.ts` enqueues WhatsApp traffic on
`bwac-inbound`, `routes/events.ts` enqueues operator replies (`ONIMCONNECTORMESSAGEADD`) on
`bwac-outbound`, and each has a `-dlq` twin for messages that exhausted their retries. The queue
consumer (`src/index.ts`) splits each batch by conversation and works up to four conversations at
once; messages of one conversation keep their batch order. Every message is acked or retried on
its own, so one failure never fails its siblings.

An operator reply (`src/outbound.ts`):

1. A `message_log` row keyed on Bitrix's message id is claimed, so a redelivered queue message
   never sends twice.
2. The text (BBCode stripped) and any attachments go out through Wasender, and the row is marked
   `'sent'` with Wasender's message id.
3. Delivery is confirmed back to Bitrix (`imconnector.send.status.delivery`), which turns the
   operator's message from "sending" to delivered. The confirmation is tried three times in place
   (1 s, then 2 s apart); if it still fails, the queue retries the message, and that redelivery
   finds the row `'sent'` and repeats **only** the confirmation, with the stored message id.

Every Bitrix and Wasender request gives up after 20 s and is retried through the queue, so one
hung call cannot hold up other conversations. Each confirmation logs one JSON line,
`delivery confirmed` (with `sendMs`/`confirmMs` latencies) or `delivery confirm failed`, without
message text or tokens - see DEPLOY.md, "Outbound delivery-confirmation rollout".

## Layout

```
src/
  index.ts          Hono app, route mounting, health
  types.ts          Env + row/payload types
  crypto.ts         AES-256-GCM for tokens at rest
  session.ts        HMAC-signed short-lived SPA session token
  app-shell.ts      Serves the built SPA with the session injected
  db.ts             Portal persistence
  bitrix.ts         REST client, refresh-on-expired, error typing, 20 s request timeout
  connector.ts      imconnector.register + event.bind + CRM detail-tab placement.bind
  wasender.ts       WasenderAPI client (PAT and session-key calls kept separate), 20 s request timeout
  sessions.ts       Provision a number, QR, status refresh, removal
  inbound.ts        Queue consumer: session -> Bitrix chat via imconnector.send.messages
  outbound.ts       Queue consumer: operator reply -> WhatsApp via Wasender, BBCode stripped
  media.ts          Signed short-lived public URL for a Bitrix attachment, so Wasender can fetch it
  crm.ts            Click-to-chat: entity phone lookup, existing-chat match, conversation start
  routes/
    install.ts      Iframe POST handlers (/install, /, /connector/settings, /crm/tab)
    events.ts       ONAPPINSTALL, ONAPPUPDATE, ONAPPUNINSTALL, ONIMCONNECTORMESSAGEADD, ONCRMTYPEADD
    api.ts          Portal-scoped /api/state, session endpoints, /api/crm/context + /api/crm/start
    webhook.ts      WasenderAPI inbound webhook, enqueues to bwac-inbound
ui/                 React SPA, built to public/index.html
schema.sql          D1 schema (single source of truth, also used by tests)
test/               vitest running in workerd
docs/               distilled WasenderAPI contract notes (docs/wasenderapi.md)
scripts/            setup.mjs (first-run wizard, `npm run setup`) and deploy.sh (every deploy after)
deploy/nginx/       nginx site template (deploy/nginx/connector.conf)
```

## Two install paths, on purpose

Bitrix24 delivers install data twice, and neither is sufficient alone:

- The **iframe POST** (`/install`, `/`) carries `AUTH_ID`, `REFRESH_ID` and `member_id`
  immediately, but **no `application_token`**.
- The **`ONAPPINSTALL` event** (`/events/install`) carries `application_token`, but fires with a
  delay and is not guaranteed.

`application_token` is what authenticates every later inbound event, so both handlers upsert the
portal and the token column is `COALESCE`d: the iframe path can never wipe a token the event path
stored. A forged `ONAPPINSTALL` for a portal we already know is rejected unless its token matches.

## Licensing

Licensing is served by [Maestro](https://maestro.acp-24.com), product slug `wa-connector`.
One license per portal, cached in D1's `licenses` table: the signed envelope is stored verbatim
and re-verified against `LICENSE_PUBLIC_KEY` on every read, never trusted blindly.
`src/license.ts` verifies Ed25519 signatures with Web Crypto, with a D1-backed cache and an
offline grace window.

Operators bind a key from the app UI's license panel (self-serve, `POST /api/license/activate`),
or in bulk via the admin route `POST /admin/portals/:domain/license`
(`X-Admin-Key: $ADMIN_SECRET`, `{"licenseKey": "..."}`). A 14-day white-label trial key is
issued self-serve and unlocks the same `white_label` feature as a paid license — see
[LICENSE-WHITE-LABEL.md](LICENSE-WHITE-LABEL.md). The same router exposes `GET` (snapshot),
`POST .../revalidate`, and `DELETE` (release the seat). A cron trigger (`wrangler.jsonc`'s
`triggers.crons`) revalidates every portal with a key on file roughly hourly; `ensureFresh`
skips anything still inside its 12h staleness window, so most ticks are cheap no-ops.

Features read from the signed envelope's `features` JSON:

| Key | Enforced where |
|---|---|
| `max_numbers` | `POST /api/sessions` - blocks provisioning a new WhatsApp number past the seat count |
| `max_conversations_per_month` | `inbound.ts` - blocks a **new** WhatsApp conversation (no existing `chat_map` row) once the UTC-month counter (`usage_counters` table) hits the cap; an already-open conversation is never interrupted |
| `group_conversations` | `POST /api/sessions/:id/group-messages` - blocks turning groups on for a number when enforcement is on and the plan lacks the feature; new numbers still ship with groups on per number (the column default is 1), so this gate only guards the explicit opt-in path |
| `message_scheduling` | Not enforced - the feature itself does not exist yet |
| `white_label` | Not a route-level gate - it selects the branding `resolveBranding()` renders (see **Branding & white-label** below): when true, the forced free-tier footer is dropped and the `BRAND_*` overrides apply |

All enforcement is inert until `LICENSE_ENFORCE=true` in `wrangler.jsonc` (ships `false`).

## Branding & white-label

Unlicensed / free-tier deployments render a "Powered by ACP GROUP" footer in the UI, linking to
https://acp-24.com.

Portals whose license envelope carries the `white_label` feature get no forced branding and may
override the connector and bot display names via the `BRAND_CONNECTOR_NAME`, `BRAND_BOT_NAME` and
`BRAND_SUPPORT_URL` Worker vars (see `src/brand.ts`).

`resolveBranding()` drives the `branding` field returned by `/api/state`, which is what the UI and
any integration should read rather than assuming a fixed product name.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # fill in the placeholder secrets
npm run ui:build                 # required: the Worker serves public/index.html
npm run db:local
npx wrangler dev
```

```bash
npm run typecheck && npm test
```

Tests run in workerd and need no Cloudflare account. `schema.sql` is imported as text by the test
helper, so the tested schema is always the deployed schema.

Two known local-toolchain notes: the installed workerd is older than the configured
`compatibility_date`, so miniflare logs a fallback warning during tests (harmless, production
resolves the real date); and `@cloudflare/vitest-pool-workers` is sensitive to the Node major
version, so use Node 20 or 22 if the pool fails to start.

## Quickstart

```bash
npm install
npm run setup
```

One interactive wizard takes a fresh clone all the way to a deployed, healthy Worker: Cloudflare
preflight (Node 20+, `wrangler whoami`), D1 / R2 / queue creation, cryptographically generated
secrets (`APP_SECRET`, `TOKEN_ENC_KEY`, `ADMIN_SECRET`), `wrangler.jsonc` patched with your
account id, public URL, D1 database id and `BITRIX_CLIENT_ID` (with a printed diff), schema
apply, first deploy, health check - and finally the three Bitrix24 Market URL fields to paste.

Every value is also a flag or env var (`npm run setup -- --help`), so it is scriptable
(`--yes`, or `--non-interactive` with env vars). It is idempotent: re-running after a partial
failure is the normal recovery - existing resources are detected, secrets already in
`.deploy.env` are reused (regenerating `TOKEN_ENC_KEY` would make stored tokens unrecoverable).

Deploys after the first one:

```bash
./scripts/deploy.sh
```

`public/` is git-ignored and built on the deploy host, so `npm run ui:build` has to run before
`wrangler deploy` or the Worker has no `index.html` to serve - both `setup` and `deploy.sh` do
it. The wizard commits nothing: push the patched `wrangler.jsonc`, or the next
`deploy.sh` (`git reset --hard origin/main`) reverts it and the deploy that follows fails on
the placeholder ids.

Full runbook - nginx/TLS, schema migrations, the queues/DLQ gotcha, rollback and
troubleshooting - in [DEPLOY.md](DEPLOY.md).

### Bitrix24 app registration

Registered as a **Market application** in your Bitrix24 partner account. A draft version issues
working OAuth credentials and installs on your own portal for testing before publication, so
nothing waits on Market review. Full field list in [DEPLOY.md](DEPLOY.md).

| Field | Value |
|---|---|
| Handler | `https://YOUR_DOMAIN/` |
| Install handler | `https://YOUR_DOMAIN/install` |
| Install-event callback | `https://YOUR_DOMAIN/events/install` |
| Scope | `imopenlines`, `imconnector`, `im`, `crm` |

Two consequences of the Market route: publishing a version fires `ONAPPUPDATE` with a refreshed
`application_token`, which `/events/update` handles, and `CONNECTOR_VERSION` must be bumped
whenever the connector's name, icon or handler changes or portals keep the old channel.

`imconnector.register` requires application OAuth context; calling it with a portal webhook token
returns `WRONG_AUTH_TYPE`.

## License

Source-available under the [ACP GROUP Source-Available License](LICENSE). This is **not** an
OSI-approved open-source license: you may use, modify and deploy the Software - including
commercially and for paying customers - as long as the ACP GROUP attribution shipped with it
(the "Powered by ACP GROUP" notice and the branding defaults in `src/brand.ts`) stays intact.

Removing or replacing that attribution - including via the `BRAND_*` Worker vars - requires a
commercial [white-label license](LICENSE-WHITE-LABEL.md); a 14-day white-label trial key is
self-served from the app UI. Contact licensing@acp-24.com or https://acp-24.com.

No trademark rights in the ACP marks are granted. The Software is provided as-is, with no
warranty and no liability. See [LICENSE](LICENSE) for the full terms and [SECURITY.md](SECURITY.md)
for vulnerability reporting.
