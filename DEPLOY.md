# Deploying the connector

Everything you need to run this connector on **your own** Cloudflare account, from an empty clone
to WhatsApp messages arriving in your Bitrix24 Open Lines.

Budget an hour; most of it is Bitrix24's own portal forms.

**What you end up with:** a Cloudflare Worker (compute), a D1 database (state), four queues
(inbound/outbound plus their dead-letter queues) and an R2 bucket (media staging) — all inside
*your* account — plus a Bitrix24 Market application that you register once and install on your
portal.

---

## What you need

| | |
|---|---|
| **Cloudflare account** | The free plan covers the Worker, D1, Queues and R2 at modest volume |
| **Node.js 20 or 22** | Node 24+ breaks the local test toolchain; 20/22 is what CI runs |
| **Cloudflare API token** | Custom, account-scoped, with four permissions — see step 1 |
| **Bitrix24 partner account** | Required to create a Market application (registration is free) |
| **WasenderAPI account + API token** | The connector provisions WhatsApp sessions under *your* WasenderAPI account |

Optional: a server and a domain, if you want the app on your own hostname instead of
`*.workers.dev` — see [step 6](#step-6-optional-your-own-domain).

---

## Step 1 — Create the Cloudflare API token

Cloudflare dashboard → **My Profile → API Tokens → Create Token → Create Custom Token**.

Give it exactly these four permissions, all scoped to your account:

| Group | Permission |
|---|---|
| Workers Scripts | Edit |
| D1 | Edit |
| R2 | Edit |
| Queues | Edit |

Then export it, so the wizard can use it:

```bash
export CLOUDFLARE_API_TOKEN=<your-token>
```

No Workers Scripts *delete* permission is needed to deploy; you will want it later if you ever
delete the Worker from the CLI.

---

## Step 2 — Clone and run the setup wizard

```bash
git clone https://github.com/Barley-pt/bitrix24-whatsapp-connector.git
cd bitrix24-whatsapp-connector
npm run setup
```

The wizard (`scripts/setup.mjs`, no dependencies) runs eight stages:

1. **Preflight** — Node version, `wrangler` availability, Cloudflare authentication.
2. **Patch `wrangler.jsonc`** — your account id, public URL and Bitrix client id, with a printed
   diff. Comments and formatting are preserved.
3. **Create resources** — D1 `bitrix_whatsapp`, R2 `bwac-audio-staging`, and all four queues
   (`bwac-inbound`, `bwac-outbound`, both `-dlq`). "Already exists" is treated as success.
4. **Apply the schema** — `schema.sql` against the remote database.
5. **Write `.deploy.env`** — chmod 600, git-ignored; holds your API token and generated secrets.
6. **Build and deploy** — `npm ci`, UI build, `wrangler deploy`.
7. **Upload Worker secrets** — values piped on stdin, never echoed.
8. **Health check** — retries `GET /health`, then prints the Bitrix24 card from step 3.

### What it asks you

| Prompt | Notes |
|---|---|
| Cloudflare account id | Pre-filled when it can be derived from your token |
| Public URL | Defaults to `https://bitrix-whatsapp-connector.<your-subdomain>.workers.dev` |
| Bitrix24 client id / secret | **You can leave these as placeholders on the first run** — see below |
| WasenderAPI token | Your personal access token (masked as you type) |
| Reverse proxy in front? | Answer *no* unless you are doing step 6 |

It generates the secrets you would otherwise have to invent — `APP_SECRET`, `TOKEN_ENC_KEY`
(base64 of exactly 32 bytes), `ADMIN_SECRET`, and `EDGE_SECRET` if you chose a proxy — using
`node:crypto`.

### Running it again later

Every value is also a flag or an environment variable, and re-running is idempotent: existing
secrets in `.deploy.env` are **reused, never regenerated** (a new `TOKEN_ENC_KEY` would make every
stored portal token unrecoverable), created resources are detected rather than recreated, and
`wrangler.jsonc` is only patched where a value actually differs. Re-running after a partial
failure is the normal recovery.

```bash
npm run setup -- --help                    # all flags and env vars
npm run setup -- --yes                     # accept defaults, prompt only where required
npm run setup -- --non-interactive         # scripted: fail listing anything missing, write nothing
```

### Placeholder values are fine on the first run

You can get a running Worker before your Bitrix application exists: answer with a placeholder
client id/secret, and set them for real afterwards (step 3). The app installs either way, but it
**cannot refresh an expired OAuth token without the real credentials**, so a portal on a
placeholder breaks about an hour after install.

---

## Step 3 — Register the Bitrix24 application

Create the app as a **Market application** in your Bitrix24 partner account (not as a local app on
the portal). A *draft* version already issues working OAuth credentials and can be installed on
your own portal for testing, so nothing here waits on Market review.

The version card has three URL fields. Bitrix24's documentation phrases them slightly differently
from page to page — match by what each one **does**, not by its exact label:

| Field (what it does) | Set it to | When it fires |
|---|---|---|
| **Application URL / handler** — what the browser loads every time the app is opened | `https://YOUR_DOMAIN/` | On every open, as a POST carrying `AUTH_ID`, `REFRESH_ID`, `member_id` |
| **Installation wizard URL** — shown once, inside a frame, during install | `https://YOUR_DOMAIN/install` | Once, at install. Must reach `BX24.installFinish()`, or Bitrix keeps re-showing this URL instead of opening the app |
| **Installation event callback** — server-to-server, no browser involved | `https://YOUR_DOMAIN/events/install` | Automatically after install, carrying `application_token` — the one thing the install-frame POST does not include |

- **"Uses only API":** leave it unset / *no* — the app has a user interface, so it needs a left-menu
  entry rather than being a callback-only app.
- **Scope:** `imopenlines`, `imconnector`, `im`, `crm`.

Then give the credentials to your deployment:

```bash
# client id -> wrangler.jsonc (BITRIX_CLIENT_ID), then re-run the wizard to patch and deploy:
npm run setup -- --bitrix-client-id <client-id> --bitrix-client-secret <client-secret>
```

or set them by hand:

```bash
# wrangler.jsonc:  "BITRIX_CLIENT_ID": "<client-id>"
npx wrangler secret put BITRIX_CLIENT_SECRET    # paste the client secret
npm run ui:build && npx wrangler deploy
```

### Two habits that come with being a Market app

- **Bump `CONNECTOR_VERSION` in `wrangler.jsonc` whenever the connector's name, icon or handler
  changes.** `imconnector.register` is gated on it, so without a bump the Contact Center keeps
  showing the old channel. The bump makes every portal re-register on its next event or app open.
- **Treat a Market version publish as a deploy trigger.** Ship the Worker first, then publish the
  version, so the handler for the resulting `ONAPPUPDATE` (which carries a refreshed
  `application_token`) is already live.

---

## Step 4 — Install it on your portal

1. In the partner portal, install your draft application on your own Bitrix24 portal.
2. The install frame opens `https://YOUR_DOMAIN/install`; it registers the connector and finishes
   by itself.
3. Open the app from the left menu — you should see the setup screen with your portal domain and
   an empty number list.
4. In Bitrix24, open **Contact Center → Connectors**: "WhatsApp" is now an available channel.

**A wrong value in the "Installation event callback" field is the single most common setup
mistake.** That URL is how the app receives `application_token`, the value that authenticates every
later inbound event. With a broken one, operator replies silently stop reaching WhatsApp while
everything else still looks healthy. The app self-heals where it can: opening the app once
re-binds the events and re-checks delivery, and the setup screen shows a banner if event delivery
is broken.

---

## Step 5 — Connect a WhatsApp number

1. In the app, add a number. The connector creates a WhatsApp session under your WasenderAPI
   account and shows a QR code.
2. Scan it from the phone you want to connect (WhatsApp → Linked devices).
3. Bind the number to one of your Bitrix24 Open Lines.
4. **Group messages are on by default** for a new number; turn them off per number in the
   connector settings if you do not want group chats in your Open Lines.

Each number maps to one Open Line, and several numbers can run on one portal.

---

## Verify it works

| Check | Expected |
|---|---|
| `curl https://YOUR_DOMAIN/health` | `{"ok":true,...}` |
| Send a WhatsApp message *to* your connected number | It appears in the Open Line chat in Contact Center |
| Reply from Contact Center | The reply arrives on the phone |

If the first check passes but the others do not, work through
[Troubleshooting](#troubleshooting) — the connector's state is readable from your own database:

```bash
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "SELECT bitrix_domain, status, connector_version, application_token IS NULL AS events_broken FROM portals"
```

`events_broken = 1` on an active portal means the app is not receiving events: opening the app once
usually repairs it.

---

## Step 6 (optional) — your own domain

**If your domain's DNS is on Cloudflare, do it there.** Add a Worker custom domain (Workers →
your Worker → Settings → Domains & Routes) pointing at your hostname, set `PUBLIC_URL` in
`wrangler.jsonc` to it, and re-run `npm run setup`. No reverse proxy is involved, and you should
answer *no* to the wizard's proxy question.

**If your DNS is elsewhere**, put a reverse proxy (nginx) in front of the `*.workers.dev` origin:

1. Point an `A` record for your domain at your server.
2. Bootstrap nginx **HTTP-only first**. The full site config's `443` block references certificate
   files that do not exist yet, so `nginx -t` fails and certbot never gets as far as issuing
   anything:

```bash
sudo mkdir -p /var/www/html
sudo tee /etc/nginx/sites-available/YOUR_DOMAIN >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name YOUR_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/YOUR_DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

3. Issue the certificate (authenticator only — this leaves the nginx config untouched):

```bash
sudo certbot certonly --webroot -w /var/www/html -d YOUR_DOMAIN
```

4. Install the site template from this repo and insert the shared secret:

```bash
sudo cp deploy/nginx/connector.conf /etc/nginx/sites-available/YOUR_DOMAIN
sudo sed -i "s/__EDGE_SECRET__/$(grep '^EDGE_SECRET=' .deploy.env | cut -d'"' -f2)/" \
  /etc/nginx/sites-available/YOUR_DOMAIN
sudo nginx -t && sudo systemctl reload nginx
curl -s https://YOUR_DOMAIN/health
```

If `/etc/letsencrypt/options-ssl-nginx.conf` or `ssl-dhparams.pem` are missing (shared boilerplate
certbot normally creates on a machine's first nginx-plugin run), generate them once with
`sudo certbot --nginx --register-unsafely-without-email -d YOUR_DOMAIN`, or copy them from another
site on the same server.

5. Re-run the wizard answering **yes** to the proxy question, so `EDGE_SECRET` is generated and
   uploaded — the proxy and the Worker must hold the same value.

### What the proxy front buys you

- **Edge authentication.** `src/middleware/edgeAuth.ts` gates `/webhook/*`, `/api/*` and
  `/admin/*` on an `X-Edge-Auth` header the proxy sends. When `EDGE_SECRET` is set the Worker also
  refuses those routes when the header is missing, which closes the direct `*.workers.dev` path —
  otherwise your Worker stays reachable at that URL by anyone who learns it. When `EDGE_SECRET` is
  **unset the gate is skipped** (that is what makes a proxy-less deployment work); each route then
  relies on its own authentication.
- **Real client IPs.** Requests arrive from the proxy, so to Cloudflare the proxy *is* the client,
  and anything keyed on `CF-Connecting-IP` collapses every caller into one bucket. The proxy sends
  the true address as `X-Real-Client-IP`, and `clientIp()` trusts that header **only** when
  `X-Edge-Auth` matches `EDGE_SECRET` — which is why the secret matters even if you do not need
  gating.

Webhook deliveries are additionally rate-limited to 240/minute per session
(`WEBHOOK_RATE_LIMIT_PER_MIN` in `src/routes/webhook.ts`), so a leaked webhook URL cannot flood you
even with a valid secret. Rejections are logged as single-line JSON, visible in `wrangler tail`.

---

## Updating your deployment

```bash
./scripts/deploy.sh
```

It pulls `origin/main` (`git reset --hard`), runs `npm ci`, typechecks, builds the UI, deploys, and
health-checks with retries. If the pull changed `deploy.sh` itself, it relaunches once so the new
version runs.

| Flag | Effect |
|---|---|
| `--migrate` | also apply `schema.sql` to the remote database — use whenever the schema changed |
| `--skip-pull` | deploy the working tree as it is, no git operations |

Two things `deploy.sh` deliberately does not do: **run tests** (the test pool needs workerd, so
tests are a pre-merge gate on a dev machine) and **touch secrets** (those are set on first run; to
rotate one use `npx wrangler secret put NAME`).

`deploy.sh` discards uncommitted changes, so configuration belongs in git — including the ids the
wizard patched into `wrangler.jsonc`.

> **Deploy fails with `Queue "..." does not exist`:** `wrangler deploy` auto-creates a queue
> declared under `queues.producers`/`queues.consumers`, but **not** one referenced only as a
> `dead_letter_queue` target. Create it first:
> `npx wrangler queues create <name>-dlq`.

### Schema changes

`schema.sql` uses `IF NOT EXISTS` throughout, so re-applying it is safe and additive — and it never
alters a table that already exists. Two consequences:

- Adding a **table** → `./scripts/deploy.sh --migrate` picks it up.
- Adding a **column** to an existing table → `--migrate` does *not* add it. Run the `ALTER TABLE`
  by hand (see below) **before** deploying the version that reads the column.

Run migrations ahead of the deploy that needs them, and keep them additive: rolling the Worker back
does not roll the database back, and an additive change is harmless to an older Worker while a
destructive one is not.

---

## Upgrading from an earlier release

Fresh installs need none of this — `schema.sql` creates everything. These are the column additions
made after the first release, for a database that already exists. Run them in order, before
deploying the version that needs them. Each is safe to re-run (D1 reports "duplicate column name"
and changes nothing).

```bash
# group messages (per-number opt-in column; new numbers default to groups on)
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE whatsapp_sessions ADD COLUMN group_messages_enabled INTEGER NOT NULL DEFAULT 1"

# inbound audio transcription
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE message_log ADD COLUMN transcription TEXT"

# QR + extra Wasender webhook events
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE whatsapp_sessions ADD COLUMN last_qr TEXT"
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE whatsapp_sessions ADD COLUMN last_qr_at INTEGER"

# chat identity: pin one chat per contact, plus naming and avatar
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE chat_map ADD COLUMN bitrix_line_id INTEGER"
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE chat_map ADD COLUMN chat_id TEXT"
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE chat_map ADD COLUMN wa_picture TEXT"
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "ALTER TABLE chat_map ADD COLUMN chat_named INTEGER NOT NULL DEFAULT 0"
```

A `DEFAULT` only shapes rows inserted after it exists — stored rows keep their value, and D1 cannot
change a column's default in place. That is harmless here: the code writes the value explicitly
when it provisions a number or inserts a chat, so new rows behave correctly on both upgraded and
fresh databases.

Backfill and de-duplicate the chats that predate phone-based identity (one row per contact):

```bash
# 1. rows created before chat_id existed were keyed by the jid Bitrix itself used
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "UPDATE chat_map SET chat_id = wa_jid WHERE chat_id IS NULL"

# 2. preview contacts split across two rows (one per WhatsApp address form) - should return no rows when clean
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "SELECT session_id, wa_phone, COUNT(*) AS n FROM chat_map WHERE wa_phone IS NOT NULL GROUP BY session_id, wa_phone HAVING COUNT(*) > 1"

# 3. keep the most recently active row per contact
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "DELETE FROM chat_map WHERE wa_phone IS NOT NULL AND id NOT IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY session_id, wa_phone ORDER BY last_message_at DESC, id DESC) AS rn FROM chat_map WHERE wa_phone IS NOT NULL) WHERE rn = 1)"
```

Also check for the same number stored under two spellings (`+971...` vs `971...`), which the exact
match above cannot see. Anything it returns is worth resolving by hand rather than by script:

```bash
npx wrangler d1 execute bitrix_whatsapp --remote --command \
  "SELECT session_id, REPLACE(wa_phone, '+', '') AS digits, COUNT(*) AS n FROM chat_map WHERE wa_phone IS NOT NULL AND wa_phone NOT LIKE '%@g.us' GROUP BY session_id, digits HAVING COUNT(*) > 1"
```

The code tolerates a lagging backfill (a `NULL` `chat_id` falls back to the jid), so the deploy and
these statements do not have to be atomic. The de-duplication only fixes your database: a split
contact's stale second chat still exists in Bitrix, and an operator should close the dead one.

---

## Rollback

Worker deployments are versioned in Cloudflare:

```bash
npx wrangler deployments list
npx wrangler rollback --message "reason"
```

Or go back by source:

```bash
git reset --hard <good-sha>
./scripts/deploy.sh --skip-pull
```

---

## Operational notes

Worth knowing once it is running.

- **Chat identity is per contact, not per WhatsApp address.** WhatsApp addresses the same person
  under two forms over time (their phone jid `5511…@s.whatsapp.net` and a privacy "LID" jid), and
  can switch mid-conversation. Bitrix looks up an Open Line chat by connector + line + chat id, so
  the connector pins one `chat.id` per contact (`chat_map.chat_id`) and resolves every message by
  phone number. Without that, one contact ends up with two chats and the operator's open window
  goes quiet.
- **Media is staged through R2 in both directions.** Inbound attachments are downloaded from
  WhatsApp, stored in your R2 bucket and served to Bitrix from your own Worker
  (`/media/inbound/<key>`), so an attachment never depends on a third-party link that expires.
  Staged objects older than 7 days are removed by the hourly cron. If staging fails, the message
  still arrives (the connector falls back to the upstream link) and logs a warning.
- **Queue behaviour.** Outbound sends are split by conversation and worked a few at a time, every
  external call has a 20s timeout, and a delivery confirmation is retried in place before the
  message goes back to the queue. A red "not delivered" marker in Contact Center is usually a
  confirmation Bitrix declined while the message itself was already delivered.
- **A number's own send rate matters.** WasenderAPI enforces a per-account sending guard; the
  connector paces and retries when it trips (`ACCOUNT_PROTECTION_DELAY_SEC`), so replies still
  arrive, just later. Repeated hits on one number is a sign to look at that number's volume.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `UI bundle missing` from the Worker | `npm run ui:build` did not run, or `public/index.html` is absent — `public/` is git-ignored and built at deploy time |
| Health check fails but `*.workers.dev` works | DNS or the proxy, not the Worker. Check `nginx -t`, the certificate and the `A` record |
| `502` from the proxy | Usually `proxy_ssl_server_name` off, or a `Host` header that does not name the `*.workers.dev` origin (Cloudflare routes by `Host`) |
| `403 FORBIDDEN` from `/api/*`, `/webhook/*`, `/admin/*` | `EDGE_SECRET` set but the proxy's `X-Edge-Auth` header does not match — or you set the secret without a proxy. Unset it, or align both sides |
| Connector missing from Contact Center after a reinstall | A stale `connector_version` survived the reinstall. Bump `CONNECTOR_VERSION`, deploy, and open the app once |
| Connector registered but nothing routes, and `wrangler tail` is silent | The connector is deactivated on the Line: open the connector settings widget in Contact Center, pick the number and Save (this re-runs `imconnector.activate`) |
| Operator replies never reach WhatsApp, everything else looks fine | `application_token` is missing — the "Installation event callback" field is wrong. Open the app once to self-heal, or fix the field and reinstall |
| Portals stop working about an hour after install | `BITRIX_CLIENT_ID` / `BITRIX_CLIENT_SECRET` are wrong, so the OAuth refresh fails |
| `WRONG_AUTH_TYPE` calling `imconnector.*` | Called without application OAuth context — a portal webhook token cannot read or change connector state |
| Decrypt errors on every portal | `TOKEN_ENC_KEY` changed. Stored tokens are unrecoverable and every portal must reinstall |
| Every log line shows the same client IP | `EDGE_SECRET` mismatch between proxy and Worker, or the proxy is not sending the headers |
| `d1_databases[0]` invalid on deploy | The placeholder database id is still in `wrangler.jsonc` — run `npm run setup` (it patches it) or paste the id from `npx wrangler d1 list` |
| Old attachments in the chat timeline go dead | Expected only for messages that predate R2 staging; new inbound media is served from your own bucket |
