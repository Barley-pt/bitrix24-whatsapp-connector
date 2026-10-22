import type { InboundMessage } from './wasender';

/**
 * Enqueued by the webhook route, consumed by index.ts's queue() handler.
 * `firstAttemptAt`/`bindWaitCount` track the "session not yet bound to a Line" wait, which is
 * driven by the consumer re-enqueueing a fresh message rather than by the queue's own retry
 * count - see src/inbound.ts.
 */
export interface InboundQueueMessage {
  sessionId: string;
  firstAttemptAt: number;
  bindWaitCount: number;
  /** Unix seconds, from the webhook envelope's top-level `timestamp` (sibling of `data`). */
  timestamp: number;
  message: InboundMessage;
  /**
   * True when this delivery came from `messages.upsert` with `key.fromMe: true` - a message sent
   * from the WhatsApp mobile app, not through Bitrix (see wasender.ts's WEBHOOK_EVENTS comment).
   * inbound.ts branches on this: it may be a genuine app-typed message (post to Bitrix, labeled
   * SENT FROM MOBILE) or an echo of our own outbound.ts send (recognized and skipped). Always false
   * for ordinary `messages.received` deliveries.
   */
  appSent: boolean;
  /** Absent on message deliveries - discriminates them from InboundNoteQueueMessage. */
  kind?: undefined;
}

/**
 * A non-message WhatsApp event (call, reaction, deletion) to be posted into the contact's existing
 * Open Line chat as a one-line note. Rides the same queue as InboundQueueMessage, consumed by
 * inbound.ts's processInboundNote. Built by routes/webhook.ts, which has already turned the event
 * into its final text - the consumer only needs to find the chat and post it.
 */
export interface InboundNoteQueueMessage {
  kind: 'note';
  sessionId: string;
  /** Unix seconds, from the webhook envelope's top-level `timestamp`. */
  timestamp: number;
  /**
   * Stable per-event id, e.g. `call:<callId>`. Doubles as the message_log idempotency key
   * (direction 'event') and the imconnector message id, so a webhook redelivery posts nothing.
   */
  eventId: string;
  /**
   * The chat the event belongs to, as Wasender sent it - either a real jid or, on
   * reaction/delete payloads, a bare "+1234567890" (wasenderapi-api-docs.md). Resolved against
   * chat_map's wa_jid or wa_phone.
   */
  remoteJid: string;
  /** Note text. `{contact}` is replaced with the contact's display name at post time. */
  text: string;
}

/**
 * Enqueued by /events/message-add (ONIMCONNECTORMESSAGEADD), one per MESSAGES[] item, consumed by
 * index.ts's queue() handler / src/outbound.ts. `waJid` is `chat.id` from the event - the same
 * external chat id the connector set when it called imconnector.send.messages in phase 3, so it doubles
 * as the chat_map lookup key for resolving the real phone number to send to.
 */
/**
 * One attachment on an operator's reply, as ONIMCONNECTORMESSAGEADD delivered it (routes/events.ts,
 * parseFiles). Only the fields needed to fetch and classify the file are kept.
 */
export interface OutboundFile {
  /** Bitrix's download URL, absolute or portal-relative - resolved in media.ts at fetch time. */
  link: string;
  /** Original file name. Drives both the document fileName WhatsApp shows and kind detection. */
  name: string;
  /** Bitrix's own coarse kind ('image', 'audio', 'video', 'file'), when it sends one. */
  type?: string;
}

export interface OutboundQueueMessage {
  portalId: string;
  lineId: number;
  waJid: string;
  bitrixChatId: number;
  bitrixMessageId: number;
  /** Raw text as Bitrix sends it, BBCode and operator-name prefix included - see outbound.ts. */
  text: string;
  /**
   * Attachments on this reply, if any. Absent on a plain text message, and on every message
   * enqueued before media support existed - outbound.ts must treat undefined as "text only".
   */
  files?: OutboundFile[];
}

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  INBOUND_QUEUE: Queue<InboundQueueMessage | InboundNoteQueueMessage>;
  OUTBOUND_QUEUE: Queue<OutboundQueueMessage>;

  // vars
  PUBLIC_URL: string;
  CONNECTOR_ID: string;
  CONNECTOR_NAME: string;
  CONNECTOR_VERSION: string;
  APP_VERSION: string;
  BITRIX_CLIENT_ID: string;
  LICENSE_SERVER_URL: string;
  LICENSE_PRODUCT: string;
  LICENSE_PUBLIC_KEY: string;
  LICENSE_ENFORCE: string;
  WASENDER_BASE_URL: string;

  // secrets
  BITRIX_CLIENT_SECRET: string;
  APP_SECRET: string;
  TOKEN_ENC_KEY: string;
  /** Gates /admin/*: operator-only shared secret sent as X-Admin-Key. Never exposed to a portal. */
  ADMIN_SECRET: string;
  /**
   * Shared with the nginx front end. Only when a request presents it do we believe the
   * X-Real-Client-IP header it carries. Unset means "trust nothing, use CF-Connecting-IP".
   */
  EDGE_SECRET?: string;
  /** WasenderAPI master Personal Access Token. Creates and manages sessions; never sends messages. */
  WASENDER_MASTER_TOKEN: string;

  // R2 bindings
  AUDIO_STAGING: R2Bucket;
}

export interface SessionRow {
  id: string;
  portal_id: string;
  provisioning_mode: string;
  wasender_api_key: string | null;
  wasender_session_id: string | null;
  webhook_secret: string | null;
  webhook_token: string | null;
  phone_number: string | null;
  bitrix_line_id: number | null;
  connector_active: number;
  group_messages_enabled: number;
  status: string;
  last_error: string | null;
  last_status_at: number | null;
  /** Latest QR string from a qrcode.updated webhook (routes/webhook.ts). NULL until one arrives. */
  last_qr: string | null;
  last_qr_at: number | null;
  created_at: number;
}

export interface PortalRow {
  id: string;
  member_id: string;
  bitrix_domain: string;
  client_endpoint: string;
  access_token: string;
  refresh_token: string;
  application_token: string | null;
  connector_version: number | null;
  audio_bot_id: number | null;
  installed_at: number;
  updated_at: number;
  status: string;
}

/**
 * A Maestro (acp-license-manager) signed license envelope, verbatim from
 * /v1/activate|validate|trial. Shape and field set must stay identical to
 * acp-license-manager's LicenseEnvelope - src/license.ts's canonicalPayload
 * signs exactly these 11 fields (sorted), so drifting either side silently
 * breaks every signature check.
 */
export interface LicenseEnvelope {
  valid: true;
  license_key: string;
  product: string;
  portal_domain: string;
  tier: 'trial' | 'pro' | 'companion' | 'lifetime';
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  expires_at: string | null;
  features: Record<string, unknown>;
  customer_name: string | null;
  grace_days: number;
  issued_at: string;
  signed_at: string;
  signature: string;
}

/** D1 licenses row. One per portal - see schema.sql. */
export interface LicenseRow {
  portal_id: string;
  license_key: string | null;
  tier: string | null;
  status: string;
  expires_at: number | null;
  grace_days: number | null;
  signed_at: number | null;
  features: string | null; // JSON
  envelope: string | null; // verbatim signed envelope JSON, re-verified on every read
  last_checked_at: number;
}

/** Auth block Bitrix24 sends with ONAPPINSTALL and other event handlers. */
export interface BitrixEventAuth {
  access_token: string;
  refresh_token?: string;
  application_token?: string;
  member_id: string;
  domain: string;
  client_endpoint?: string;
  server_endpoint?: string;
  expires_in?: string | number;
  scope?: string;
  status?: string;
}

/** POST body Bitrix24 sends when it opens the app (or its install script) in the iframe. */
export interface BitrixFramePayload {
  DOMAIN: string;
  PROTOCOL: string;
  LANG: string;
  APP_SID: string;
  AUTH_ID: string;
  AUTH_EXPIRES: string;
  REFRESH_ID: string;
  member_id: string;
  status?: string;
  PLACEMENT?: string;
  PLACEMENT_OPTIONS?: string;
}
