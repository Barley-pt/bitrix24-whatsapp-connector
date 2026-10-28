# Bitrix24 WhatsApp Connector

**What this is.** It connects a WhatsApp number to your Bitrix24 portal, so your team reads and
answers WhatsApp messages inside Bitrix24's **Contact Center**, next to every other channel.
WhatsApp conversations arrive as normal Bitrix24 Open Line chats, which means the CRM side is
already done for you: chats are tied to the contact, and leads or deals get created the way
Bitrix24 normally creates them. Queues, SLA and reporting work as they do for any other channel,
and your staff install nothing — there is no separate WhatsApp app for them to open.

You run it on your own Cloudflare account. The connector itself is free and unlimited.

---

## What you need

- **A Bitrix24 portal where you can install an application.** The connector is installed as a
  Bitrix24 app and shows up in Contact Center. You register the app once, from a (free) Bitrix24
  partner account.
- **The WhatsApp number you want to connect.** This is the number your customers already write to;
  you link it by scanning a QR code with that phone.
- **A WasenderAPI account** (https://wasenderapi.com). WasenderAPI is the service that actually
  talks to WhatsApp — it holds the WhatsApp session for your number. This connector is the bridge
  between that service and Bitrix24, and it uses **your own** account, never anyone else's. From it
  you need one thing: your API token.
  [See what to copy and where it goes](#wasenderapi-what-to-take-from-it).
- **A Cloudflare account.** The connector runs on Cloudflare's hosting, under your account; the
  free plan is enough. You do not manage any servers.
- **Node.js 20 or 22** on the computer you deploy from. Node 24 or newer breaks the local test
  toolchain, so use 20 or 22. This is only needed on the machine that runs the installer and the
  deploys — not on your Bitrix24 portal.

Optional: your own domain, if you would rather not have the app's address end in `workers.dev` —
see [DEPLOY.md](DEPLOY.md#step-6-optional--your-own-domain).

### WasenderAPI: what to take from it

**What it is, and why you need one.** WasenderAPI (https://wasenderapi.com) is the service that
holds the WhatsApp connection for your number and sends and receives its messages. This connector
does not talk to WhatsApp itself — it is the bridge between WasenderAPI and Bitrix24. You use your
own WasenderAPI account; the connector never uses anyone else's.

**What to get.** Your API token from the WasenderAPI dashboard — their documentation calls it a
*personal access token* (or API key). Sign up at https://wasenderapi.com, then copy the token from
the dashboard's API/token section. Their docs are at https://wasenderapi.com/api-docs.

**Where to put it.** When `npm run setup` runs (step 2 of [Install](#install)) it prompts:

```
WasenderAPI master token (personal access token):
```

Paste the token there — it is masked as you type and is never printed. The wizard stores it in
`.deploy.env` on your computer (readable only by you, and never committed to git) and uploads it to
your deployment as a secret. Setting things up by hand instead? This is the `WASENDER_MASTER_TOKEN`
value.

**What the connector does with it.** It uses the token to create a WhatsApp session for each number
you add — that is what "connecting a number" means here. Each number then gets its own key, which
the connector stores encrypted in your database; the master token is only used to create and manage
sessions.

**What to watch.** Your WasenderAPI plan and its limits apply — they control how fast messages can
be sent, and the connector slows down and retries when it reaches that limit, so a reply may arrive
later rather than fail. Every number you connect lives in that one WasenderAPI account, so keep the
token safe and check that your plan covers the volume you expect.

---

## Install

The short version. [DEPLOY.md](DEPLOY.md) is the full step-by-step guide, with the exact form
fields and everything you may need if something goes wrong.

1. **Clone the repo and install its dependencies:**

   ```bash
   git clone https://github.com/Barley-pt/bitrix24-whatsapp-connector.git
   cd bitrix24-whatsapp-connector
   npm install
   ```

2. **Run the setup wizard:**

   ```bash
   npm run setup
   ```

   One interactive wizard takes a fresh clone all the way to a deployed, working connector: it
   creates the Cloudflare resources in your account, generates your security keys, patches the
   config with your account details, applies the database schema, builds the app and puts it
   online, then health-checks it and prints the three Bitrix24 addresses you need for step 3. It
   asks for your Cloudflare account details, the public address the app will live at, your Bitrix24
   client id and secret, and your **WasenderAPI token** — have the last one ready
   ([where to find it](#wasenderapi-what-to-take-from-it)).

   Placeholders are fine for the Bitrix24 credentials on this first run (you get a running app
   before your Bitrix24 application exists); you fill them in for real in step 3.

3. **Register the Bitrix24 application** using the three addresses the wizard printed, and install
   it on your own portal. [DEPLOY.md, step 3](DEPLOY.md#step-3--register-the-bitrix24-application)
   explains each field. The wrong "Installation event callback" address is the most common mistake,
   so use the one the wizard printed verbatim.

4. **Install the app on your portal** and open it from the left menu. You should see the setup
   screen with your portal's domain and an empty list of numbers. In Bitrix24, **Contact Center →
   Connectors** now offers WhatsApp as a channel.

5. **Connect your WhatsApp number.** In the app, add the number. The connector creates a WhatsApp
   session under your WasenderAPI account and shows a QR code; scan it from the phone
   (WhatsApp → Linked devices). Then bind the number to one of your Bitrix24 Open Lines.

   To take a number offline later, use **Disconnect** in the same list. The WhatsApp link is
   dropped straight away and its conversations stop reaching Bitrix24; the number itself stays in
   the list, so reconnecting it is a new QR scan rather than starting over.

Deploys after the first one:

```bash
./scripts/deploy.sh
```

---

## After install: is it working?

| Check | What you should see |
|---|---|
| Open `https://YOUR_DOMAIN/health` in a browser | a short line starting with `{"ok":true,...}` |
| Send a WhatsApp message **to** your connected number | it appears in the Open Line chat in Contact Center |
| Reply from Contact Center | the reply arrives on the phone |

If the first check passes but the others do not, run the state check in the same section of
[DEPLOY.md](DEPLOY.md#verify-it-works), then work through
[troubleshooting](DEPLOY.md#troubleshooting).

---

## Questions

Questions, deployment problems and feedback all go to **info@acp-24.com**. If something in these
docs did not match what you saw, that is worth telling us about.

---

## White-label (optional)

The connector is **free and unlimited**. There is no license to install, no cap on how many numbers
or conversations you run, and nothing held back. Deploy it and use it, with the "Powered by
ACP GROUP" note that comes with it.

The one paid option is **white-label**: running the connector for your own customers under your own
brand. A white-label license removes the ACP GROUP attribution and lets you set the connector name,
bot name and support link to your own. That specific request goes to **licensing@acp-24.com** — see
[LICENSE-WHITE-LABEL.md](LICENSE-WHITE-LABEL.md).

---

## Known limitations

The honest list of what does not work yet, so you know before you deploy.

- **Group chats come in for a new number unless you turn them off.** A freshly connected number
  also receives WhatsApp group messages. You can switch that off for each number in the connector's
  settings in Contact Center. WhatsApp channels and broadcast messages are always dropped —
  Bitrix24 has nowhere to put them.
- **Attachments are copied into your own storage.** Photos, voice notes and documents arriving on
  WhatsApp are copied the moment they arrive and served to Bitrix24 from your own address, so an
  attachment keeps working after WasenderAPI's one-hour temporary link expires. The copies are
  cleaned up after 7 days, long after Bitrix24 has fetched them. If the copy fails, the temporary
  link is passed on instead — the attachment is never dropped.
- **Click-to-chat can show "Join chat" instead of Reply/Forward/Close.** If the conversation was
  already worked on by someone before, Bitrix24 shows a non-member "Join chat" button. The
  conversation still works; this is a cosmetic quirk we are looking into.
- **A reply can stay marked "not delivered" although it was.** Bitrix24 confirms delivery only
  while a message is still being sent, and can decline that confirmation even though the customer
  received the message. When that happens the reply stays red in Contact Center. The connector
  retries the confirmation and keeps the window for it small, but it cannot force Bitrix24 to
  accept it.
- **White-label is the only feature behind a license.** The connector runs fully and permanently
  without one. The other plan limits you may find in the licensing configuration are not enforced
  in this repository: the free connector has no limits.

---

## For developers

The connector is a small TypeScript application. Everything above is the user-facing story; the
rest is here. Terms are defined once, in passing.

### What it is, technically

A **Cloudflare Worker** (a small serverless program that runs on Cloudflare's edge — no machine of
yours is involved) written in TypeScript with Hono, backed by a **D1** database (Cloudflare's
SQLite) named `bitrix_whatsapp`. The UI is React 19 + Tailwind v4, built into a single inlined
`index.html`. Both directions of traffic pass through **Cloudflare Queues** so a slow upstream
never blocks delivery.

Two surfaces, one backend:

1. **Native Open Channel** registered through `imconnector` (connector id `whatsapp_connector`) —
   CRM, queues, SLA and automatic lead/deal creation are all Bitrix24's own.
2. **App UI** in the Bitrix24 iframe — connection state, number management, license status. It
   deliberately does not duplicate the Open Lines inbox.

| | |
|---|---|
| Runtime | Cloudflare Worker, TypeScript + Hono |
| Database | Cloudflare D1 (`bitrix_whatsapp`) |
| UI | React 19 + Tailwind v4, built to a single inlined `index.html` |
| License | Source-available, see [LICENSE](LICENSE) (not an OSI-approved open-source license) |
| Public URL | `https://YOUR_DOMAIN` |

Serving does not require the public domain's DNS to be on Cloudflare: an edge/reverse-proxy server
terminates TLS for `https://YOUR_DOMAIN` and reverse-proxies to the `*.workers.dev` URL. Cloudflare
hosts only the Worker and D1.

### Message flow

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
message text or tokens — see DEPLOY.md, "Operational notes".

### Layout

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
test/               vitest running against a local copy of Cloudflare's runtime
docs/               distilled WasenderAPI contract notes (docs/wasenderapi.md)
scripts/            setup.mjs (first-run wizard, `npm run setup`) and deploy.sh (every deploy after)
deploy/nginx/       nginx site template (deploy/nginx/connector.conf)
```

### Local development

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

**The tests need no Cloudflare account.** They run the connector inside a local copy of Cloudflare's
runtime, emulated on your own machine — nothing remote is touched, and you need no Cloudflare login
or API token to run them. `schema.sql` is imported as text by the test helper, so the tested schema
is always the deployed schema.

Two local-toolchain notes:

- The emulated runtime is pinned to a version older than the compatibility date the project
  declares, so the test run prints lines like
  `[mf:wrn] The latest compatibility date supported by the installed Cloudflare Workers Runtime is "2024-12-30"`.
  It is harmless: the run completes normally and all tests pass, and the deployed Worker uses the
  real date. You can ignore it.
- `@cloudflare/vitest-pool-workers` is sensitive to the Node major version, so use Node 20 or 22 if
  the test pool fails to start.

### Two install paths, on purpose

Bitrix24 delivers install data twice, and neither is sufficient alone:

- The **iframe POST** (`/install`, `/`) carries `AUTH_ID`, `REFRESH_ID` and `member_id`
  immediately, but **no `application_token`**.
- The **`ONAPPINSTALL` event** (`/events/install`) carries `application_token`, but fires with a
  delay and is not guaranteed.

`application_token` is what authenticates every later inbound event, so both handlers upsert the
portal and the token column is `COALESCE`d: the iframe path can never wipe a token the event path
stored. A forged `ONAPPINSTALL` for a portal we already know is rejected unless its token matches.

### Being a Market app

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

### Branding internals

Unlicensed / free-tier deployments render a "Powered by ACP GROUP" footer in the UI, linking to
https://acp-24.com. Portals whose license envelope carries the `white_label` feature get no forced
branding and may override the connector and bot display names via the `BRAND_CONNECTOR_NAME`,
`BRAND_BOT_NAME` and `BRAND_SUPPORT_URL` Worker vars (see `src/brand.ts`); `resolveBranding()`
drives the `branding` field returned by `/api/state`, which is what the UI and any integration
should read rather than assuming a fixed product name.

The licensing module understands the flags `max_numbers`, `max_conversations_per_month`,
`group_conversations`, `message_scheduling` and `white_label`. Only `white_label` does anything out
of the box; the other four are **not enforced** in this repository (`LICENSE_ENFORCE` ships
`false`). They exist so that a white-label deployment, or a host running this as a paid service for
others, can meter its own customers.

---

## License

Source-available under the [ACP GROUP Source-Available License](LICENSE). This is **not** an
OSI-approved open-source license: you may use, modify and deploy the Software — including
commercially and for paying customers — as long as the ACP GROUP attribution shipped with it
(the "Powered by ACP GROUP" notice and the branding defaults in `src/brand.ts`) stays intact.

Removing or replacing that attribution — including via the `BRAND_*` Worker vars — requires a
commercial [white-label license](LICENSE-WHITE-LABEL.md). Contact licensing@acp-24.com or
https://acp-24.com.

No trademark rights in the ACP marks are granted. The Software is provided as-is, with no
warranty and no liability. See [LICENSE](LICENSE) for the full terms and [SECURITY.md](SECURITY.md)
for vulnerability reporting.
