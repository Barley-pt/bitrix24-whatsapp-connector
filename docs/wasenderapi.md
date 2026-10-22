# WasenderAPI contract notes

What we have actually verified, and how. The docs site renders `/api-docs` pages slowly enough
that fetching them often times out; `https://wasenderapi.com/llms.txt` is the same content as
markdown and is the better source, though it also truncates partway on a slow connection.

Anything below marked **unverified** must be confirmed against the doc page before it is coded.
Spec section 8 exists because this API has already contradicted our assumptions twice.

## Authentication: two different tokens

This is the single most important thing to get right, and it is easy to miss.

| Token | Where it comes from | What it authorises |
|---|---|---|
| **Personal Access Token** | Profile settings, one per account | Session management: create, list, update, delete sessions |
| **Session API key** | Returned as `api_key` when a session is created | Everything scoped to one session: send messages, status, contacts, groups |

Both are sent as `Authorization: Bearer <token>`, so they are indistinguishable by shape and a
mix-up produces a confusing 401 rather than an obvious error.

Verified empirically on 2026-08-04 with a session key:

```
GET /api/whatsapp-sessions  -> 401 {"success":false,"message":"This endpoint requires a valid personal access token."}
GET /api/status             -> 200 {"status":"connected"}
GET /api/user               -> 200 {"success":true,"data":{"id":"...@s.whatsapp.net","name":"...","lid":"...@lid"}}
```

For the connector this maps directly onto central provisioning: the operator's **PAT** lives in Worker secrets as
`WASENDER_MASTER_TOKEN` and is used only to create sessions. Each session's own **api_key** is
returned at creation and stored encrypted per row in `whatsapp_sessions.wasender_api_key`. One
account can hold many sessions (confirmed by the operator), bounded by the plan's session limit.

## Sessions

`POST /api/whatsapp-sessions` (PAT). Required: `name`, `phone_number`, `account_protection`,
`log_messages`. Optional: `webhook_url`, `webhook_enabled`, `webhook_events[]`,
`read_incoming_messages`, `auto_reject_calls`, `ignore_groups`, `ignore_channels`,
`ignore_broadcasts`, `proxy_url`, `always_online`.

Docs example shows `data`:

```json
{
  "id": 1,
  "name": "Business WhatsApp",
  "phone_number": "+1234567890",
  "status": "connected",
  "webhook_url": "https://example.com/webhook",
  "webhook_enabled": true,
  "webhook_events": ["messages.received", "session.status", "messages.update"],
  "api_key": "75075a7b...",
  "webhook_secret": "fb61be92...",
  "created_at": "2025-04-01T12:00:00Z"
}
```

**Contradicted live 2026-08-05**: a real creation response has **no `status` field at all** — a
fresh session has never attempted to connect, so there is nothing to report yet. `status` only
starts appearing once `/connect` has been called at least once. Actual response also carries more
fields than documented:

```json
{
  "name": "Sales UAE",
  "phone_number": "+971557801481",
  "account_protection": true,
  "log_messages": true,
  "webhook_url": "https://YOUR_DOMAIN/webhook/...",
  "webhook_enabled": true,
  "ignore_groups": true,
  "ignore_broadcasts": true,
  "ignore_channels": true,
  "webhook_events": ["messages.received", "session.status", "messages.update"],
  "user_id": 43285,
  "updated_at": "2026-08-05T10:25:36.000000Z",
  "created_at": "2026-08-05T10:25:36.000000Z",
  "id": 106614,
  "api_key": "85332ade...",
  "webhook_secret": "08574582...",
  "is_restricted": false
}
```

The connector treats a missing `status` on creation as `disconnected` rather than trusting the doc's
`status` field to be there (`src/sessions.ts`, `provisionSession`).

`id` is an **integer**, not a uuid. `api_key` and `webhook_secret` are returned only here and by
the session detail endpoint, so both must be persisted at creation.

Over the limit: `{"success": false, "error": "You have reached your WhatsApp session limit. ..."}`

Endpoints we need (`{s}` = session id):

| | |
|---|---|
| `GET /api/whatsapp-sessions` | list (PAT) |
| `POST /api/whatsapp-sessions` | create (PAT) |
| `PUT /api/whatsapp-sessions/{s}` | update; syncs webhook settings if connected (PAT) |
| `DELETE /api/whatsapp-sessions/{s}` | delete (PAT) |
| `POST /api/whatsapp-sessions/{s}/connect` | start linking, QR by default (PAT) |
| `GET /api/whatsapp-sessions/{s}/qrcode` | fetch QR (PAT) |
| `POST /api/whatsapp-sessions/{s}/disconnect` | log out (PAT) |
| `POST /api/whatsapp-sessions/{s}/regenerate-key` | rotate the session api_key (PAT) |
| `GET /api/status` | session status (session key) |
| `GET /api/user` | which WhatsApp account this key is bound to (session key) |
| `POST /api/send-message` | all outbound message types (session key) |

## Inbound webhook payload

`messages.received` fires for **incoming only**. `messages.upsert` fires for incoming *and*
outgoing (`key.fromMe` tells them apart).

**Update 2026-08-06**: the connector now subscribes to both. `messages.received` alone missed messages
typed on the business phone's WhatsApp app directly (not sent through Bitrix) - those are
outgoing from Wasender's point of view, so only `messages.upsert` observes them. The trade-off
this section originally avoided is real: `messages.upsert` also echoes every message the connector sends
through `/api/send-message`, `fromMe: true` either way, with no id shared between an outbound
send and its echo to join on (see "Still unverified" below). The connector resolves this with a
pragmatic match against a recent outbound `message_log` row (target jid/phone + normalized text)
rather than an id-based join - see `schema.sql`'s comment on `message_log`'s `echo_*` columns and
`src/inbound.ts`'s `detectOutboundEcho`. `src/routes/webhook.ts` drops `fromMe: false` upsert
deliveries outright, since `messages.received` already covers those.

Before committing to this, `message.sent` (also listed under "Webhook configuration" below) was
checked as a possible clean alternative - an event that might fire *only* for messages the phone
app itself sends, leaving `messages.upsert` unsubscribed entirely. The `/api-docs` pages render
client-side and reliably time out on fetch (confirmed again during this investigation - plain
`curl` gets 22KB of an empty shell with no server-rendered content, matching the warning at the
top of this file), so this rests on search-engine snippets of the "Webhook: Message Sent" page
rather than the full page text. Those snippets describe `message.sent` only as firing "when a
message is successfully sent from your session," with a `fromMe: true` payload shape - no wording
distinguishes an API-triggered send from an app-typed one. That is the same ambiguity
`messages.upsert` already has, so it would not have avoided needing the echo match. **Treat this
as unverified** rather than confirmed; a live test (send one message via `/api/send-message` with
`message.sent` as the only outbound-shaped subscription, and see whether it fires) would confirm
or refute it far better than doc-scraping did.

```json
{
  "event": "messages.received",
  "timestamp": 1633456789,
  "data": {
    "messages": {
      "key": {
        "id": "3EB0X123456789",
        "fromMe": false,
        "remoteJid": "123456789@lid",
        "cleanedSenderPn": "5551234567",
        "senderLid": "123456789@lid"
      },
      "messageBody": "Hello! This is a test.",
      "message": { "conversation": "Hello! This is a test." }
    }
  }
}
```

Two traps here, both called out explicitly by the docs:

1. **`data.messages` is a single object, not an array.** The docs note this as a change from an
   earlier shape, so older examples and blog posts are wrong.
2. **`remoteJid` is not reliably a phone number.** It is frequently a LID (`...@lid`). The phone
   number lives in `key.cleanedSenderPn` for private chats and `key.cleanedParticipantPn` for
   group chats.

That second point drives a schema decision: `chat_map.wa_jid` stores `remoteJid` because that is
what routes a reply back, but Bitrix needs a real phone number for `user.id`/`phone` in
`imconnector.send.messages`, so `chat_map.wa_phone` stores the cleaned number separately. Deriving
one from the other is not possible.

`messageBody` is the unified text for plain text, captions and replies alike. Media lives in the
raw `message` object under `imageMessage`, `videoMessage`, `audioMessage`, `documentMessage`,
`stickerMessage`, and can be decrypted server-side via `POST /api/decrypt-media` rather than
reimplementing the HKDF unwrapping.

### contextInfo (reply context) — read since 2026-10-13

`messageBody` is the message's own text only; what it was *answering* rides `contextInfo` on the
envelope carrying the message (`extendedTextMessage.contextInfo`, `imageMessage.contextInfo`, …,
sometimes one wrapper level down under `ephemeralMessage.message`). Wasender's docs never show
this block for an inbound delivery — the only example in `wasenderapi-api-docs.md` is the
`GET /api/messages/{msgId}/info` response — so its live shape on inbound traffic is **unverified**
here. `src/inbound.ts` (`findContextInfo`/`replyContext`) reads two known Baileys payloads:

- `externalAdReply` — click-to-WhatsApp ad traffic: `title`, `body`, and usually a **plaintext**
  `thumbnailUrl` (unlike first-party media, which is encrypted). Rendered as
  `In reply to ad: <title>` + body, with the thumbnail attached as `ad-thumbnail.*` when the URL
  is fetchable; a base64 `jpegThumbnail` is ignored (Bitrix cannot fetch a data payload).
- `quotedMessage` — the message replied to, rendered as one `Replied to: <kind> "<snippet>"` line.
  Its media is deliberately *not* re-attached: it is already in the chat timeline, and the case
  that genuinely needed rendering was the ad creative, which never entered the thread.

Every rendered context emits a `inbound reply context rendered` log line carrying the observed
`contextInfo` field names (`contextFields`) and whether a thumbnail was attachable — the cheap way
to confirm the real production shape without storing raw payloads.

Neither `messages.received` nor `messages.upsert` carries a pushName/notify field anywhere in
`data.messages` - confirmed against the full API reference (`wasenderapi-api-docs.md`, repo root),
not just this file's earlier (looser) example. A contact's display name has to be fetched
separately.

## Contact name lookup

`GET /api/contacts/{contactPhoneNumber}` (session key), confirmed against
`wasenderapi-api-docs.md`:

```json
{
  "success": true,
  "data": { "id": "...", "name": "Contact Name", "notify": "Notification Name", "verifiedName": null, "imgUrl": null, "status": null }
}
```

`name` is the sender's own WhatsApp address-book entry for themselves (rarely set), `notify` is
the pushName the account broadcasts (the common case for an unsaved contact), `verifiedName` only
appears for verified business accounts. `WasenderClient.getContactInfo` (`src/wasender.ts`) picks
`name || notify || verifiedName`, used so `imconnector.send.messages`'s `user.name` can carry a
real name instead of leaving Bitrix to fall back to "Guest" (`src/inbound.ts`,
`resolveContactName`). Not yet verified against a live account - a contact WhatsApp hasn't synced
yet may 404, which `resolveContactName` treats the same as "no name available" rather than failing
the delivery.

## Webhook configuration

Per session, settable at creation or via `PUT`, and also editable in the dashboard: payload URL,
a rotatable webhook secret, and filters for ignoring groups, broadcasts and channels. Available
subscriptions seen in the dashboard: `messages.received`, `messages-group.received`,
`messages-newsletter.received`, `messages-personal.received`, `call`, `message.sent`,
`session.status`, `qrcode.updated`, `passkey.updated`.

Since the connector creates sessions through the API, it sets `webhook_url` itself and never depends on
someone configuring the dashboard by hand.

## Webhook authentication: a shared secret, not a signature

Header name is `x-webhook-signature`, and despite the name **verification is a plain string
comparison against the session's `webhook_secret`**. There is no HMAC and the request body is not
integrity-protected. The official SDK implements exactly this and its own source comments flag the
weakness, asking users to confirm with Wasender that a direct comparison really is the only method:

```ts
declare const WEBHOOK_SIGNATURE_HEADER = "x-webhook-signature";
declare function verifyWasenderWebhookSignature(
  requestSignature: string | undefined | null,
  configuredSecret: string,
): boolean;
```

Consequences for the connector: the header is a bearer credential, so compare it in constant time, never
log it, and treat the body as unauthenticated input. It also means a leaked secret lets anyone
inject messages into a customer's Open Line, which is an argument for rotating it if a session
ever misbehaves (`webhook_secret` is rotatable from the dashboard).

## Sending

`POST /api/send-message` (session key). `to` accepts an E.164 phone number, a group JID or a
channel JID. One endpoint covers every type, discriminated by `messageType`: `text`, `image`,
`video`, `document`, `audio`, `sticker`, `contact`, `location`. Media is passed by URL
(`imageUrl`, `videoUrl`, `documentUrl`, `audioUrl`, `stickerUrl`) with per-type size caps: image
5 MB, video 16 MB, audio 16 MB, sticker 100 KB, document 100 MB.

Verified live on 2026-08-04:

```
POST /api/send-message  {"to":"+79266502455","text":"..."}
-> 200 {"success":true,"data":{"msgId":68809213,"jid":"+79266502455","status":"in_progress"}}
```

The SDK's own types are **wrong** here: they declare the send response as `{success, message}`
with no data at all. Trust the live response.

`msgId` is a Wasender-internal integer and is **not** the WhatsApp message id (`3EB0...`) that
arrives on inbound webhooks. They are separate id spaces, which is why `message_log` scopes its
uniqueness index by direction and never compares an inbound id to an outbound one. `editMessage`,
`deleteMessage` and `getMessageInfo` all take this numeric `msgId`.

`status: "in_progress"` means accepted for delivery, not delivered. Actual delivery arrives later
on the `messages.update` webhook, whose status is one of `delivered | read | played | error |
pending`. That is the trigger for `imconnector.send.status.delivery`.

## Rate limits: much tighter than expected

The live send returned:

```
x-ratelimit-limit: 1
x-ratelimit-remaining: 0
x-ratelimit-reset: 59
```

**One request per 60 seconds** on the account's current (trial) plan. Paid plans are higher, but
this has to be designed for rather than discovered in production: the outbound queue consumer must
read `x-ratelimit-remaining` / `x-ratelimit-reset` and pace itself, and treat 429 as a retry with
the reset window rather than a failure. A burst of operator replies would otherwise fail almost
entirely. Confirm the production plan's real limit before phase 4 sizing.

## Sessions and QR

```ts
type WhatsAppSessionStatus =
  "connected" | "disconnected" | "need_scan" | "connecting" | "logged_out" | "expired";

interface QRCodeResponseData { qrCode: string }                       // GET .../qrcode
interface ConnectSessionResponseData {                                // POST .../connect
  status: WhatsAppSessionStatus; qrCode?: string; message?: string;
}
```

`connect` can return the QR directly, so the happy path is connect, render `qrCode`, then watch
the `qrcode.updated` and `session.status` webhooks rather than polling.

Session status is stored verbatim in `whatsapp_sessions.status`. Note `need_scan` and
`logged_out`, which the original spec's `disconnected | qr_pending | connected | error` vocabulary
had no room for.

```ts
interface SessionStatusData { status: WhatsAppSessionStatus; session_id?: string; reason?: string }
interface QrCodeUpdatedData { qr: string; session_id?: string }
```

## Careful with the SDK as a source

`wasenderapi@0.4.0` was useful for the signature header, the status enums and the QR shapes, but it
lags the API in two known places:

1. Its `IncomingMessageKey` is `{id, fromMe, remoteJid, participant?}` with **no** `cleanedSenderPn`
   or `cleanedParticipantPn`, and it models message events as arrays. The docs describe the newer
   flattened payload with `messageBody` and a single `data.messages` object. Follow the docs, and
   parse defensively enough to survive either.
2. Its send response type omits the `data` object that the API actually returns.

## Still unverified

- The **production plan's rate limit**. The figure above is from a trial account.
- Whether `messages.update` delivery events carry the numeric `msgId`, the WhatsApp id, or both.
  This decides how delivery receipts join back to `message_log`, and would also let a
  `messages.upsert` echo be joined back to the outbound send that caused it - the pragmatic
  jid/text match in `src/inbound.ts`'s `detectOutboundEcho` exists only because this is unknown.
- Whether `messages.upsert`'s `data.messages` is a single object like `messages.received`'s, or an
  array as older docs/blog posts describe for other events. **Resolved (2026-08-06):** the full
  API reference (`wasenderapi-api-docs.md`, repo root) shows `messages.received` delivering a
  single object and `messages.upsert` delivering an **array**. `src/routes/webhook.ts`
  normalizes both shapes and enqueues one queue message per entry.
- Whether `message.sent` fires only for app-typed messages or for every outbound send including
  our own API calls. See the "Inbound webhook payload" section above - not adopted either way
  without a live test.
- `GET /api/contacts/{phone}`'s exact behavior for a contact WhatsApp hasn't synced yet (404? a
  data row with all fields null?) and whether it counts against the same tight rate limit as
  `/api/send-message`. See "Contact name lookup" above - shape is confirmed from docs, live
  behavior is not.
