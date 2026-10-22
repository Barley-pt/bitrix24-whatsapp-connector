# Bitrix24 WhatsApp Connector

An open-source Bitrix24 Market app that bridges WhatsApp (via WasenderAPI) into a native Bitrix24
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
| Public URL | `https://YOUR_DOMAIN` |

Serving does not require the public domain's DNS to be on Cloudflare: an edge/reverse-proxy server
terminates TLS for `https://YOUR_DOMAIN` and reverse-proxies to the `*.workers.dev` URL. Cloudflare
hosts only the Worker and D1.

## Phase status

| Phase | Scope | State |
|---|---|---|
| 1 | Skeleton, D1 schema, OAuth install, `imconnector.register`, setup UI shell | Verified live on a portal |
| 2 | WasenderAPI session, QR, status polling | Verified live - number connected via QR |
| 3 | Inbound: webhook to Queue to `imconnector.send.messages` | Verified live - customer message reaches the Open Line |
| 4 | Outbound: `ONIMCONNECTORMESSAGEADD` to Queue to WasenderAPI | Verified live - operator reply reaches WhatsApp |
| 5 | Maestro licence gate + cron refresh | Implemented, not yet deployed - see below |
| 6 | Reconnect handling, error UI, end-to-end tests | Not started |
| 7 | Admin panel (cross-tenant) | Not started |
| 8 | n8n integration (`bot_webhook_url`, shared send endpoint) | Not started |
| 9 | Click-to-chat: CRM lead/deal/contact/company + Smart Process detail tabs (`src/crm.ts`) | Implemented, not yet deployed - widget confirmed appearing on the Contact card live. A Smart Process type created before this shipped picks up the tab on the next `CONNECTOR_VERSION` bump; one created afterward gets it live via `ONCRMTYPEADD` (`events.ts`), no bump needed |

### Open questions

1. **~~The paid plan's WasenderAPI rate limit~~ - resolved.** The trial allows one request per 60
   seconds, but the outbound consumer doesn't hardcode any assumed limit: a 429 is paced by
   requeueing with the `x-ratelimit-reset` Wasender itself reports (`index.ts`), which is correct
   whether the real production limit turns out to be 1/60s or much higher. See
   [docs/wasenderapi.md](docs/wasenderapi.md).
2. **~~Nothing has run against a real portal~~ - resolved.** Verified live in both directions
   during testing. Getting there surfaced two real bugs worth remembering:
   `ensureConnectorRegistered` only compares a bare version number, so a portal that survives an
   uninstall/reinstall or a swap to an entirely different Bitrix app (`member_id` identifies the
   *portal*, not the app) keeps a stale `connector_version` and silently skips re-registering -
   bump `CONNECTOR_VERSION` whenever `BITRIX_CLIENT_ID` changes, not only for connector metadata
   changes. And `ONAPPINSTALL` genuinely can fail to arrive (confirmed across two reinstalls),
   which is why `authenticate()` (`events.ts`) now self-heals a missing `application_token` via
   `access_token` verification instead of depending on it.
3. **Inbound media links may expire before Bitrix reads them.** Wasender's `/api/decrypt-media`
   returns a temporary `publicUrl` on its own domain, valid for one hour (`src/wasender.ts`,
   `decryptMedia`) - there is no other decrypted representation to hand Bitrix. If Bitrix doesn't
   fetch `imconnector.send.messages`' `files[]` URL promptly, the attachment in the chat timeline
   goes dead. Unconfirmed whether Bitrix fetches eagerly on receipt; only live testing will tell.
   Re-hosting via R2 is the fallback if this turns out to be a real problem.
4. **Click-to-chat sometimes opens with a "Join chat" button instead of Reply/Forward/Close - open.**
   Measured against another WhatsApp connector on the same portal (called *the reference* below), by
   capturing its network traffic while it did the same thing correctly. What
   that ruled **in** and **out** is worth keeping, because three plausible theories all died:

   | Theory | Verdict |
   |---|---|
   | Wrong dialog id format | **Dead.** The reference opens `dialogId=chat5082` - identical shape to ours. |
   | The starter must be made the session operator | **Dead.** See below. |
   | The starter must be added to the chat | **Dead.** See below. |

   The reference session, captured at the moment its UI correctly showed *Reply / Forward / Close*
   (`imopenlines.v2.Chat.Load`):

   ```json
   "session": { "id": 4774, "operatorId": 178, "status": "NEW", "chatId": 5082, "queueId": 12 }
   "chat":    { "owner": 0, "role": "guest", "user_counter": 0 }
   ```

   The chat is owned by *someone else* (178, the deal's responsible person - Bitrix says so in the
   chat itself: "Enquiry redirected to the CRM responsible person", i.e. the line's
   `CRM_FORWARD: 'Y'`), the viewer is **not a member**, and the answer bar shows anyway. So the
   discriminator is `status`, not ownership or membership: while a session is `NEW` any queue
   operator gets Reply/Forward/Close; once it is `WORK`/`ANSWERED` a non-member gets *Join chat*.

   **Two real defects in our opener came out of comparing the two side by side**, both since fixed
   in `startConversation`:

   - **No `user.name`.** We sent `user: {id, phone}` and nothing else, so Bitrix had nothing to call
     the connector user and titled the chat `Guest - <line name>`. Inbound has always passed `name`
     (`inbound.ts`), which is why only click-to-chat chats looked like this - compare an inbound
     chat titled "<contact name> - Test Open Line" against a click-to-chat chat titled
     "Guest - Test Open Line". The name is now resolved from the CRM record the tab was opened on
     (`resolveClientName`), which is why the placement travels with `POST /api/crm/start`.
   - **`disable_crm: 'Y'`.** It was there to stop the synthetic opener spawning a duplicate lead,
     but per the method's documentation it "disables the CRM tracker for the message" - the whole
     tracker. The tracker is what attaches the deal, saves the contact's details and performs the
     responsible-person routing, i.e. every system line in the reference chat. Suppressing it is
     what left our chats looking like empty stubs. The duplicate-entity worry it guarded against is
     handled by the tracker itself, which only creates an entity when it cannot match one on the
     phone number - and click-to-chat always starts from a record whose phone we just read. Do not
     generalise from a single test portal here: some of its lines have `CRM_CREATE: none`, but a
     production line may well carry `CRM_CREATE: deal`, so on that kind of line a
     phone-format mismatch really would mint a deal per click.

   Separately, and this is what actually produces the "Guest" contacts customers complain about:
   `resolveContactName` (`inbound.ts`) had the Wasender contact lookup as its *only* name source,
   swallowed every failure into `undefined`, and left `user.name` unset - the exact case
   `docs/wasenderapi.md` had flagged as unverified ("a contact WhatsApp hasn't synced yet may
   404"). WhatsApp's pushName is not on the webhook payload, so there is no free second source.
   All three `imconnector.send.messages` call sites now go through `displayName`, which falls back
   to the phone number (or "WhatsApp group") and is never empty. The fallback is deliberately not
   written to `chat_map.wa_name`: caching it would pin the contact to its number forever and stop a
   real name landing later. Confirmed live during testing - the "Guest" contact's deal was then
   created by the tracker as "Guest - Whatsapp".

   Still unproven: whether those two fully explain the *Join chat* button, or only the "empty stub"
   appearance. Our create path already produced a correct `NEW` session before this change - chat
   5068 sat at `owner: 0`, session 4760 `NEW`. A second suspect remains: on a `chat_map` hit
   `/api/crm/start` returns the stored `bitrix_chat_id` without asking Bitrix anything, so the widget
   can reopen a chat whose session was worked long ago (every older session on that line is `WORK`).
   The reference re-derives on *every* click via
   `imopenlines.dialog.get(USER_CODE=imol|<connector>|<line>|<phone>|<userId>)` and keys on bare
   phone digits (`5511999999999`) where `chat_map.wa_jid` uses the full JID. Whether reopening a
   colleague's live conversation as a bystander is even wrong is a product question, not a bug.

## Layout

```
src/
  index.ts          Hono app, route mounting, health
  types.ts          Env + row/payload types
  crypto.ts         AES-256-GCM for tokens at rest
  session.ts        HMAC-signed short-lived SPA session token
  app-shell.ts      Serves the built SPA with the session injected
  db.ts             Portal persistence
  bitrix.ts         REST client, refresh-on-expired, error typing
  connector.ts      imconnector.register + event.bind + CRM detail-tab placement.bind
  wasender.ts       WasenderAPI client (PAT and session-key calls kept separate)
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
scripts/            bootstrap.sh (first run) and deploy.sh (every deploy after)
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

## Licensing (phase 5)

Maestro (`acp-license-manager`, the signer repo whose canonical JSON the code must match) product
slug `wa-connector`. One license per portal, cached in D1's `licenses`
table (one row per portal, envelope stored verbatim and re-verified against `LICENSE_PUBLIC_KEY` on
every read - never trusted blindly). `src/license.ts` is a Workers-native port of the signer's
Node license client (Web Crypto Ed25519 instead of `node:crypto`, D1 instead of a filesystem
cache).

There is no self-serve purchase flow yet, so the operator binds a purchased key to a portal via
`POST /admin/portals/:domain/license` (`X-Admin-Key: $ADMIN_SECRET`, `{"licenseKey": "..."}`).
The same router exposes `GET` (snapshot), `POST .../revalidate`, and `DELETE` (release the seat).
A cron trigger (`wrangler.jsonc`'s `triggers.crons`) revalidates every portal with a key on file
roughly hourly; `ensureFresh` skips anything still inside its 12h staleness window, so most ticks
are cheap no-ops.

Features currently read from the signed envelope's `features` JSON:

| Key | Enforced where |
|---|---|
| `max_numbers` | `POST /api/sessions` - blocks provisioning a new WhatsApp number past the seat count |
| `max_conversations_per_month` | `inbound.ts` - blocks a **new** WhatsApp conversation (no existing `chat_map` row) once the UTC-month counter (`usage_counters` table) hits the cap; an already-open conversation is never interrupted |
| `group_conversations` | Not enforced anywhere yet - group traffic is dropped at the WasenderAPI source (`wasender.ts`'s `ignore_groups: true`), so there is no group code path to gate. Surfaced in `/api/state` ahead of that landing |
| `message_scheduling` | Not enforced - the feature itself does not exist yet. Same reasoning as above |
| `white_label` | Not a route-level gate - it selects the branding `resolveBranding()` renders (see **Branding & white-label** below): when true, the forced free-tier footer is dropped and the `BRAND_*` overrides apply |

Everything above is inert until `LICENSE_ENFORCE=true` in `wrangler.jsonc` (currently `false` -
enforcing with the placeholder public key would fail closed for every tenant). Flipping it on is a
separate decision from shipping the gating code.

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

## Deploy

Full runbook in [DEPLOY.md](DEPLOY.md). Never deployed yet, so the first run is a bring-up.

```bash
cd /opt/connector && ./scripts/bootstrap.sh   # once: D1, secrets, first deploy
cd /opt/connector && ./scripts/deploy.sh      # every time after that
```

`public/` is git-ignored and built on the deploy host, so `npm run ui:build` has to run before
`wrangler deploy` or the Worker has no `index.html` to serve. Both scripts do this.

`BITRIX_CLIENT_ID` and the D1 `database_id` in `wrangler.jsonc` are placeholders and must be
committed before the app works. `bootstrap.sh` stops and tells you when either is outstanding.

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

## Phase 1 verification checklist

Run through on a real portal; every box has to pass before the next phase starts:

- [ ] App installs without error and the frame closes via `BX24.installFinish()`
- [ ] `portals` has one row: correct domain, `connector_version = 1`, tokens unreadable in D1
- [ ] `application_token` is populated after `ONAPPINSTALL` lands
- [ ] "WhatsApp" appears in Contact Center as an available channel
- [ ] Opening the app renders the setup UI with the real portal domain and an empty number list
- [ ] Dark mode toggle persists across a reload
- [ ] Uninstalling flips `portals.status` to `uninstalled`
