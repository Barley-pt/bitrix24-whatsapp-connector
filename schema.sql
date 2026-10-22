-- Bitrix24 WhatsApp Connector - D1 schema (database: bitrix_whatsapp)
-- Idempotent: safe to re-run. Covers phases 1-5; phase 8 (n8n) columns land with phase 8.

-- One row per installation of the app on a Bitrix24 portal.
-- Keyed by member_id, not domain: member_id survives a portal domain rename.
CREATE TABLE IF NOT EXISTS portals (
  id                   TEXT PRIMARY KEY,
  member_id            TEXT UNIQUE NOT NULL,
  bitrix_domain        TEXT NOT NULL,
  -- Bitrix hands us the REST base explicitly; do not reconstruct it from the domain
  -- (it differs on self-hosted portals).
  client_endpoint      TEXT NOT NULL,
  access_token         TEXT NOT NULL,        -- AES-GCM encrypted
  refresh_token        TEXT NOT NULL,        -- AES-GCM encrypted
  -- NULL until ONAPPINSTALL arrives: the iframe install POST does not carry it.
  -- Inbound event handlers must refuse to run while this is NULL.
  application_token    TEXT,
  -- Value of CONNECTOR_VERSION at the last successful imconnector.register.
  connector_version    INTEGER,
  -- ID of the registered audio-notification chatbot (posted after a voice note is sent).
  audio_bot_id         INTEGER,
  installed_at         INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL,
  status               TEXT NOT NULL DEFAULT 'active'   -- active | uninstalled
);

CREATE INDEX IF NOT EXISTS idx_portals_domain ON portals(bitrix_domain);

-- Cached Maestro license envelope. One row per portal.
-- The signed envelope is kept verbatim so the Ed25519 signature can be re-verified
-- offline during a Maestro outage (grace window = signed_at + grace_days).
CREATE TABLE IF NOT EXISTS licenses (
  portal_id       TEXT PRIMARY KEY REFERENCES portals(id) ON DELETE CASCADE,
  license_key     TEXT,
  tier            TEXT,
  status          TEXT NOT NULL DEFAULT 'unlicensed',  -- active | expired | suspended | unlicensed
  expires_at      INTEGER,
  grace_days      INTEGER,
  signed_at       INTEGER,
  features        TEXT,                                 -- JSON; max_numbers lives here
  envelope        TEXT,                                 -- verbatim signed envelope JSON
  last_checked_at INTEGER NOT NULL
);

-- One WhatsApp number = one session. A portal may hold several (multi-number, spec 7.1).
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id                  TEXT PRIMARY KEY,
  portal_id           TEXT NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  -- 'master' = provisioned under the maintainer's master WasenderAPI account (default).
  -- 'byo' = customer supplied their own token, stored encrypted in wasender_api_key.
  provisioning_mode   TEXT NOT NULL DEFAULT 'master',
  wasender_api_key    TEXT,                 -- AES-GCM encrypted; NULL when provisioning_mode='master'
  wasender_session_id TEXT,
  -- Wasender's per-session webhook secret. Sent back to us verbatim in the x-webhook-signature
  -- header and compared as a plain string, so it is a bearer credential, not a signature.
  webhook_secret      TEXT,                 -- AES-GCM encrypted
  -- Unguessable path segment in the webhook URL we hand to Wasender, so an inbound POST can be
  -- attributed to a tenant before any secret is checked. Treat as a secret.
  webhook_token       TEXT UNIQUE,
  phone_number        TEXT,
  bitrix_line_id      INTEGER,              -- LINE passed to imconnector.activate
  connector_active    INTEGER NOT NULL DEFAULT 0,
  -- Customer opt-in for group traffic on this number. Mirrors Wasender's own `ignore_groups`
  -- session setting (0 = ignore_groups true, 1 = ignore_groups false) - see wasender.ts's
  -- createSession/updateSession and routes/api.ts's POST /api/sessions/:id/group-messages.
  -- Existing databases need `ALTER TABLE whatsapp_sessions ADD COLUMN group_messages_enabled
  -- INTEGER NOT NULL DEFAULT 0` run once via wrangler d1 execute (see DEPLOY.md) - CREATE TABLE
  -- IF NOT EXISTS does not add columns to a table that already exists.
  group_messages_enabled INTEGER NOT NULL DEFAULT 0,
  -- Wasender's own vocabulary, stored verbatim rather than remapped, so a status we have not
  -- seen before cannot be silently flattened into the wrong bucket:
  -- connected | disconnected | connecting | need_scan | logged_out | expired
  status              TEXT NOT NULL DEFAULT 'disconnected',
  last_error          TEXT,
  last_status_at      INTEGER,
  -- Latest QR string pushed by Wasender's qrcode.updated webhook (routes/webhook.ts), so the UI
  -- can read it without another connect call. Existing databases need `ALTER TABLE
  -- whatsapp_sessions ADD COLUMN last_qr TEXT` and `... ADD COLUMN last_qr_at INTEGER` (DEPLOY.md).
  last_qr             TEXT,
  last_qr_at          INTEGER,
  created_at          INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_portal ON whatsapp_sessions(portal_id);
-- Outbound routing resolves a session from the LINE carried by ONIMCONNECTORMESSAGEADD.
CREATE INDEX IF NOT EXISTS idx_sessions_line ON whatsapp_sessions(portal_id, bitrix_line_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_wasender ON whatsapp_sessions(wasender_session_id)
  WHERE wasender_session_id IS NOT NULL;

-- Maps a WhatsApp conversation to its Open Line chat. One row per contact - i.e. per
-- (session_id, wa_phone) - NOT per jid: see chat_id below and inbound.ts's upsertChatMap.
CREATE TABLE IF NOT EXISTS chat_map (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  -- The latest key.remoteJid seen for this contact. Informational/fallback only: WhatsApp
  -- addresses the same contact under two jids over time - the phone jid (5511964253002@s.whatsapp.net)
  -- and the privacy LID (37039881908374@lid) - and can switch mid-conversation, so this column
  -- moves. Never hand it to Bitrix as chat.id; that is chat_id's job.
  wa_jid          TEXT NOT NULL,
  -- The exact external chat.id Bitrix knows this contact's Open Line chat by: the jid the chat was
  -- created with. Set once on INSERT and never overwritten - Bitrix finds/creates the chat by
  -- CONNECTOR+LINE+CHAT_ID, and the value is also baked into the CRM contact's IM identifier
  -- (`imol|whatsapp_connector|<line>|<chat_id>|<user>`, see bitrix_line_id below). Passing the raw,
  -- jid-of-the-moment remoteJid instead is what split one customer across two Bitrix chats when
  -- their jid flipped: line 2 chats 5398 (phone jid) + 5400 (LID), line 3 chats
  -- 160777 + 160779 created 3 minutes apart mid-conversation. A brand-new contact gets
  -- inbound.ts's canonicalChatId (`<digits>@s.whatsapp.net`), the same id crm.ts's click-to-chat
  -- uses, so both entry points agree.
  --
  -- Existing databases need `ALTER TABLE chat_map ADD COLUMN chat_id TEXT` plus the backfill and
  -- dedupe in DEPLOY.md ("chat_map: one chat per contact"). A row still NULL here falls back to
  -- wa_jid (which was always the chat.id before this column existed), and upsertChatMap fills it
  -- in from wa_jid before ever moving wa_jid.
  chat_id         TEXT,
  -- key.cleanedSenderPn for a private chat. This is what Bitrix needs for user.id / phone in
  -- imconnector.send.messages. Not derivable from wa_jid. For a group (wa_jid ending in @g.us)
  -- this instead holds the group's own JID (same value as wa_jid) - see inbound.ts, groups are
  -- addressed as a single Bitrix "user" rather than per-participant, so whichever member sent a
  -- given message never matters here.
  wa_phone        TEXT,
  -- WhatsApp display name (Wasender's GET /api/contacts/{phone}: name || notify || verifiedName),
  -- resolved once per contact and sent as user.name in imconnector.send.messages so Bitrix shows
  -- it instead of its own "Guest" fallback. NULL if never resolved (lookup failed, or contact not
  -- yet synced on Wasender's side) - inbound.ts's resolveContactName retries on the next message.
  wa_name         TEXT,
  -- WhatsApp profile picture URL (same Wasender lookup's imgUrl), sent as user.picture.url so the
  -- Bitrix contact gets an avatar. Refreshed whenever that lookup runs again; NULL when the
  -- contact hides it or it was never looked up. Existing databases need `ALTER TABLE chat_map ADD
  -- COLUMN wa_picture TEXT` (DEPLOY.md).
  wa_picture      TEXT,
  -- 1 once imconnector.chat.name.set has titled this chat after the contact (inbound.ts's
  -- maybeRenameChat). user.name in send.messages names the Bitrix *user*, never the chat, and
  -- re-calling the rename on every message would be a wasted REST call. 0 (or a legacy row
  -- predating the column) means "never titled", so the contact's next message titles it - that is
  -- how every chat that existed before this column gets its real name. Existing databases need
  -- `ALTER TABLE chat_map ADD COLUMN chat_named INTEGER NOT NULL DEFAULT 0` (DEPLOY.md).
  chat_named      INTEGER NOT NULL DEFAULT 0,
  bitrix_chat_id  INTEGER,
  -- The Open Line this chat was actually created on. Bitrix pins a conversation to its line
  -- permanently - the id is baked into the CRM contact's own IM identifier, e.g.
  -- `imol|whatsapp_connector|6|351967380902@s.whatsapp.net|1030` - so a chat_map row only stays valid
  -- while the session still feeds that same line. Re-binding a number to a different line
  -- (sessions.ts's bindLine) leaves every earlier row pointing into the old one, and the
  -- click-to-chat widget then reopens a dead chat instead of starting a fresh one: confirmed live
  -- 2026-08-11 on contact 884, where replying failed instantly and emitted no connector event at
  -- all because line 6 had since been deactivated.
  --
  -- Existing databases need `ALTER TABLE chat_map ADD COLUMN bitrix_line_id INTEGER` run once via
  -- wrangler d1 execute (see DEPLOY.md). Rows predating that migration keep NULL, which
  -- findChatMatches treats as "not on the current line" - exactly the right answer, since a row
  -- written before this column existed cannot be proven to belong to the line in use now.
  bitrix_line_id  INTEGER,
  last_message_at INTEGER,
  -- Kept from the per-jid era. Still true under one-row-per-contact (a jid belongs to exactly one
  -- contact), and upsertChatMap never moves wa_jid onto a value another row already holds.
  UNIQUE(session_id, wa_jid)
);

-- Reverse lookup for outbound: chat_id -> jid.
CREATE INDEX IF NOT EXISTS idx_chat_map_bitrix ON chat_map(bitrix_chat_id);
-- Click-to-chat (CRM detail tab, src/crm.ts) looks up "does a conversation already exist for this
-- phone" by wa_phone, not wa_jid - the jid isn't known until a real WhatsApp message has actually
-- moved, but the phone is known the moment an operator opens the tab. Also the contact key every
-- inbound path resolves a chat by (inbound.ts's findContactChat).
CREATE INDEX IF NOT EXISTS idx_chat_map_phone ON chat_map(session_id, wa_phone);

-- Message log in both directions. Doubles as the idempotency ledger: Wasender re-delivers
-- webhooks, so wa_message_id is written before the Bitrix call and uniqueness rejects replays.
CREATE TABLE IF NOT EXISTS message_log (
  id                TEXT PRIMARY KEY,
  session_id        TEXT NOT NULL REFERENCES whatsapp_sessions(id) ON DELETE CASCADE,
  -- inbound = customer message; outbound = operator reply sent via Wasender; app_outbound = a
  -- message typed on the business phone's WhatsApp app, observed via messages.upsert and posted
  -- to Bitrix the same way inbound is (see inbound.ts, processAppSentMessage). Kept distinct from
  -- inbound rather than folded in so idempotency and admin filtering never conflate the two.
  direction         TEXT NOT NULL,        -- inbound | outbound | app_outbound
  -- Two different id spaces, deliberately in one column and never compared across directions:
  -- inbound/app_outbound hold the WhatsApp id from key.id ("3EB0..."), outbound holds Wasender's
  -- numeric msgId returned by /api/send-message. The unique index below is scoped by direction.
  wa_message_id     TEXT,
  bitrix_message_id INTEGER,
  status            TEXT NOT NULL,        -- pending | sent | delivered | failed | echo | deleted
  error             TEXT,
  -- echo_* columns are written only on 'outbound' rows, at send time, and read only when a
  -- fromMe messages.upsert webhook arrives (inbound.ts, detectOutboundEcho). Wasender's send
  -- response (numeric msgId) and the WhatsApp id on webhooks are different id spaces with no
  -- confirmed join between them (see docs/wasenderapi.md, "Still unverified"), so an upsert echo
  -- of our own outbound send is recognized by a pragmatic match instead: same session, sent
  -- recently, same target jid/phone, same normalized text. A match writes wa_message_id here via
  -- echo_message_id and skips reposting to Bitrix; no match means it was really typed on the
  -- phone. Replace with an id-based join once messages.update is confirmed to carry both ids.
  echo_jid          TEXT,                 -- outbound: the wa_jid (chat.id) the send targeted
  echo_phone        TEXT,                 -- outbound: the wa_phone the send targeted
  echo_text         TEXT,                 -- outbound: normalized text of what was sent
  echo_message_id   TEXT,                 -- outbound: WhatsApp id of the upsert matched to it
  transcription     TEXT,                 -- Phase 2: transcribed text of an inbound audio message
  created_at        INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_idempotency
  ON message_log(session_id, direction, wa_message_id)
  WHERE wa_message_id IS NOT NULL;

-- Outbound's pre-send idempotency key: wa_message_id isn't known until Wasender accepts the send
-- (it's Wasender's own response), so ONIMCONNECTORMESSAGEADD redelivery is guarded by Bitrix's
-- own message id instead, claimed before the send rather than after.
CREATE UNIQUE INDEX IF NOT EXISTS idx_msg_idempotency_outbound
  ON message_log(session_id, direction, bitrix_message_id)
  WHERE bitrix_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_msg_session_created ON message_log(session_id, created_at);
-- Admin panel (phase 7) filters failures across tenants.
CREATE INDEX IF NOT EXISTS idx_msg_failed ON message_log(status, created_at) WHERE status = 'failed';

-- Monthly usage counters per portal, keyed by UTC calendar month ('YYYY-MM'). Backs Maestro's
-- max_conversations_per_month feature. A "conversation" is counted once, the moment its first
-- chat_map row is created (see src/usage.ts, src/inbound.ts) - continuing an existing thread never
-- re-counts, mirroring how max_numbers only gates provisioning a *new* session.
CREATE TABLE IF NOT EXISTS usage_counters (
  portal_id                TEXT NOT NULL REFERENCES portals(id) ON DELETE CASCADE,
  period                   TEXT NOT NULL,
  conversations_initiated  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (portal_id, period)
);

-- Per-session inbound webhook counters, one row per session per unix minute
-- (Math.floor(Date.now()/60000)). Written by routes/webhook.ts on every delivery, before the
-- signature check, to cap a flood holding a leaked webhook_secret (see the 2026-09 incident in
-- src/middleware/edgeAuth.ts). Rows are never swept: one row per session per active minute is
-- small enough that cleanup would cost more than it saves.
CREATE TABLE IF NOT EXISTS webhook_rate (
  session_id  TEXT NOT NULL,
  bucket_min  INTEGER NOT NULL,
  count       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (session_id, bucket_min)
);
