import type { Env } from './types';

/**
 * WasenderAPI client. See docs/wasenderapi.md for how this contract was verified.
 *
 * Two token types that look identical on the wire:
 *   - the Personal Access Token manages sessions (create, list, connect, delete)
 *   - each session's own api_key does everything session-scoped (send, status)
 * Passing the wrong one yields a confusing 401, so the two are kept in separate methods here
 * rather than left to the caller.
 */

export type SessionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'need_scan'
  | 'logged_out'
  | 'expired';

export interface WasenderSession {
  id: number;
  name: string;
  phone_number: string;
  // Absent on creation: a fresh session has never connected, so there is nothing to report yet.
  // Present on the detail/list endpoints once linking has been attempted.
  status?: SessionStatus;
  api_key: string;
  webhook_secret: string;
  webhook_url: string | null;
  webhook_enabled: boolean;
  webhook_events: string[];
}

export interface RateLimit {
  limit: number | null;
  remaining: number | null;
  /** Seconds until the window resets, as sent by the API. */
  resetSeconds: number | null;
}

export class WasenderError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly rateLimit?: RateLimit,
  ) {
    super(message);
    this.name = 'WasenderError';
  }

  /** Whether retrying later could plausibly succeed. */
  get retryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

/**
 * Events the connector subscribes to. `messages.upsert` was added to fix a real bug: messages typed on
 * the business phone's WhatsApp app (not sent through Bitrix) never reached the Open Line,
 * because `messages.received` only fires for incoming messages. The cost, and the reason upsert
 * was excluded originally, is that it also echoes every message the connector itself sends through
 * outbound.ts - both look identical (`fromMe: true`). webhook.ts drops `fromMe: false` upsert
 * deliveries outright (messages.received already covers those); inbound.ts's
 * `detectOutboundEcho` then tells a genuine app-typed message apart from an echo of our own send
 * by matching it against a recent outbound `message_log` row (target jid/phone + normalized
 * text) - an id-based join isn't possible today, since Wasender's send response (`msgId`) and
 * the WhatsApp id on webhooks are different id spaces (see `sendText` below).
 *
 * Investigated `message.sent` (also listed in the Wasender dashboard's subscription list) as a
 * cleaner alternative first: WasenderAPI's docs describe it only as firing "when a message is
 * successfully sent from your session", with no wording that distinguishes an API-triggered send
 * from one typed on the phone - the same `fromMe`-shaped ambiguity as `messages.upsert`, so it
 * would not avoid needing the same echo match. See docs/wasenderapi.md.
 *
 * `messages-group.received` is a separate event from `messages.received` - group traffic is not
 * folded into it (wasenderapi-api-docs.md, "Webhook: Group Message Received"). Always subscribed
 * regardless of a session's own group_messages_enabled: `ignore_groups` (createSession/
 * updateSession) is what actually gates delivery, so the subscription is inert on a session that
 * has groups turned off and needs no separate sync when a session later turns them on.
 *
 * `messages-personal.received` duplicates `messages.received` for 1:1 chats; it is subscribed but
 * acknowledged without enqueueing (routes/webhook.ts explains why). `message.sent` (singular - Wasender's own name, see
 * wasenderapi-api-docs.md "Webhook: Message Sent") is only used to log a send failure;
 * `call`/`messages.reaction`/`messages.delete` become system notes in the Open Line and
 * `qrcode.updated` is mirrored onto the session row (all in routes/webhook.ts).
 */
export const WEBHOOK_EVENTS = [
  'messages.received',
  'messages.upsert',
  'messages-group.received',
  'messages-personal.received',
  'session.status',
  'messages.update',
  'message.sent',
  'qrcode.updated',
  'call',
  'messages.reaction',
  'messages.delete',
];

/**
 * The four media kinds Wasender can send. No sticker equivalent is documented (unlike inbound,
 * where stickerMessage is one of the five envelopes), so a sticker travelling outbound is sent as
 * a document rather than dropped - see outbound.ts's mediaKind.
 */
export type OutboundMediaKind = 'image' | 'video' | 'audio' | 'document';

/** All four ride the same POST /api/send-message; only the URL parameter's name differs. */
const MEDIA_URL_PARAM: Record<OutboundMediaKind, string> = {
  image: 'imageUrl',
  video: 'videoUrl',
  audio: 'audioUrl',
  document: 'documentUrl',
};

function readRateLimit(res: Response): RateLimit {
  const num = (h: string) => {
    const v = res.headers.get(h);
    return v === null || v === '' ? null : Number(v);
  };
  return {
    limit: num('x-ratelimit-limit'),
    remaining: num('x-ratelimit-remaining'),
    resetSeconds: num('x-ratelimit-reset'),
  };
}

export class WasenderClient {
  constructor(
    private readonly baseUrl: string,
    private readonly masterToken: string,
  ) {}

  private async call<T>(
    path: string,
    token: string,
    init: { method?: string; body?: unknown } = {},
  ): Promise<{ data: T; rateLimit: RateLimit }> {
    const res = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });

    const rateLimit = readRateLimit(res);
    const body = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: T; message?: string; error?: string; status?: string }
      | null;

    // Failures arrive under `message` on some endpoints and `error` on others, so both are read.
    if (!res.ok || body?.success === false) {
      const reason = body?.message ?? body?.error ?? `HTTP ${res.status}`;
      throw new WasenderError(res.status, reason, rateLimit);
    }
    if (!body) throw new WasenderError(res.status, 'unparseable response', rateLimit);

    // GET /api/status answers with a bare object rather than the usual success/data envelope.
    return { data: (body.data ?? (body as unknown)) as T, rateLimit };
  }

  // --- session management (Personal Access Token) -------------------------------------------

  async createSession(input: {
    name: string;
    phoneNumber: string;
    webhookUrl: string;
    /**
     * Off by default: a brand new number provisions with groups ignored until the customer opts
     * in (routes/api.ts's POST /api/sessions/:id/group-messages), mirroring the
     * group_messages_enabled column's own default. Channel and broadcast traffic still has no
     * destination in Bitrix regardless, so those stay dropped at the source unconditionally.
     */
    ignoreGroups?: boolean;
  }): Promise<WasenderSession> {
    const { data } = await this.call<WasenderSession>('/api/whatsapp-sessions', this.masterToken, {
      method: 'POST',
      body: {
        name: input.name,
        phone_number: input.phoneNumber,
        account_protection: true,
        log_messages: true,
        webhook_url: input.webhookUrl,
        webhook_enabled: true,
        webhook_events: WEBHOOK_EVENTS,
        ignore_groups: input.ignoreGroups ?? true,
        ignore_channels: true,
        ignore_broadcasts: true,
      },
    });
    return data;
  }

  async listSessions(): Promise<WasenderSession[]> {
    const { data } = await this.call<WasenderSession[]>('/api/whatsapp-sessions', this.masterToken);
    return data;
  }

  async getSession(sessionId: string): Promise<WasenderSession> {
    const { data } = await this.call<WasenderSession>(
      `/api/whatsapp-sessions/${sessionId}`,
      this.masterToken,
    );
    return data;
  }

  /** Starts linking. Often returns the QR directly, saving a second call. */
  async connectSession(
    sessionId: string,
  ): Promise<{ status: SessionStatus; qrCode?: string; message?: string }> {
    const { data } = await this.call<{ status: SessionStatus; qrCode?: string; message?: string }>(
      `/api/whatsapp-sessions/${sessionId}/connect`,
      this.masterToken,
      { method: 'POST' },
    );
    return data;
  }

  /** Errors with "Session does not need scanning" when the session is already connected. */
  async getQrCode(sessionId: string): Promise<string> {
    const { data } = await this.call<{ qrCode: string }>(
      `/api/whatsapp-sessions/${sessionId}/qrcode`,
      this.masterToken,
    );
    return data.qrCode;
  }

  async disconnectSession(sessionId: string): Promise<void> {
    await this.call(`/api/whatsapp-sessions/${sessionId}/disconnect`, this.masterToken, {
      method: 'POST',
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.call(`/api/whatsapp-sessions/${sessionId}`, this.masterToken, { method: 'DELETE' });
  }

  /**
   * Two independent callers share this: the repair path for sessions provisioned before
   * `messages.upsert` was added to WEBHOOK_EVENTS (routes/api.ts, POST
   * /api/sessions/:id/repair-webhook - PUTs `webhookEvents` alone), and the group-messages toggle
   * (POST /api/sessions/:id/group-messages - PUTs `ignoreGroups` alone). Wasender syncs settings
   * to the live connection on PUT while the session is connected (docs/wasenderapi.md); a
   * disconnected session picks up the change on its next reconnect. `webhookEvents`, when passed,
   * should always be the full current WEBHOOK_EVENTS list rather than a diff, so re-running this
   * is harmless.
   */
  async updateSession(
    sessionId: string,
    input: { webhookEvents?: string[]; ignoreGroups?: boolean },
  ): Promise<WasenderSession> {
    const { data } = await this.call<WasenderSession>(
      `/api/whatsapp-sessions/${sessionId}`,
      this.masterToken,
      {
        method: 'PUT',
        body: {
          ...(input.webhookEvents ? { webhook_events: input.webhookEvents } : {}),
          ...(input.ignoreGroups === undefined ? {} : { ignore_groups: input.ignoreGroups }),
        },
      },
    );
    return data;
  }

  // --- session-scoped (per-session api_key) -------------------------------------------------

  async getStatus(apiKey: string): Promise<SessionStatus> {
    const { data } = await this.call<{ status: SessionStatus }>('/api/status', apiKey);
    return data.status;
  }

  /**
   * Send a text message. Returns Wasender's numeric msgId, which is NOT the WhatsApp message id
   * seen on inbound webhooks.
   *
   * `status: "in_progress"` means accepted, not delivered; delivery arrives later on
   * messages.update.
   */
  async sendText(
    apiKey: string,
    to: string,
    text: string,
  ): Promise<{ msgId: number; status: string; rateLimit: RateLimit }> {
    const { data, rateLimit } = await this.call<{ msgId: number; jid: string; status: string }>(
      '/api/send-message',
      apiKey,
      { method: 'POST', body: { to, text } },
    );
    return { msgId: data.msgId, status: data.status, rateLimit };
  }

  /**
   * Send one attachment, optionally with a caption. Same endpoint and same response shape as
   * sendText - the only difference is which `<kind>Url` parameter carries the file
   * (wasenderapi-api-docs.md, "Send Image/Video/Audio/Document Message").
   *
   * The URL must be publicly fetchable: Wasender downloads it server-side while processing the
   * send, which is what src/media.ts exists to provide for a Bitrix attachment.
   */
  async sendMedia(
    apiKey: string,
    to: string,
    media: { kind: OutboundMediaKind; url: string; fileName?: string },
    text?: string,
  ): Promise<{ msgId: number; status: string; rateLimit: RateLimit }> {
    const body: Record<string, unknown> = { to, [MEDIA_URL_PARAM[media.kind]]: media.url };

    // audioUrl is documented as "sent as voice note", and a WhatsApp voice note has nowhere to put
    // a caption - outbound.ts sends that text as its own message instead of losing it here.
    if (text && media.kind !== 'audio') body.text = text;
    // Only the document endpoint documents fileName; for the others WhatsApp shows the media
    // itself, not a name, so sending one would be ignored at best.
    if (media.kind === 'document' && media.fileName) body.fileName = media.fileName;

    const { data, rateLimit } = await this.call<{ msgId: number; jid: string; status: string }>(
      '/api/send-message',
      apiKey,
      { method: 'POST', body },
    );
    return { msgId: data.msgId, status: data.status, rateLimit };
  }

  /**
   * Decrypt an inbound media message. Verified live against the docs 2026-08-05: the request
   * body is the webhook's own `data.messages` object forwarded verbatim (key + the one
   * `<type>Message` block that's present), not a reconstructed shape. The response returns a
   * `publicUrl` on Wasender's own domain rather than the file bytes - it stays valid for **one
   * hour**, which is why this must be called just before building the Bitrix payload, never
   * cached for later.
   */
  async decryptMedia(apiKey: string, message: InboundMessage): Promise<string> {
    const { data } = await this.call<{ publicUrl: string }>('/api/decrypt-media', apiKey, {
      method: 'POST',
      body: { data: { messages: message } },
    });
    return data.publicUrl;
  }

  /**
   * Contact detail lookup, used so a new Open Line contact gets a real display name instead of
   * Bitrix's own "Guest" fallback (imconnector.send.messages never received a user.name before
   * this existed). Shape confirmed against wasenderapi-api-docs.md (repo root): `{success, data:
   * {id, name, notify, verifiedName, imgUrl, status}}` - the same envelope `call()` already
   * unwraps. `name` is the sender's own WhatsApp address-book entry (rarely set), `notify` is the
   * pushName the account broadcasts (the common case), `verifiedName` only appears for verified
   * business accounts. `imgUrl` is the profile picture, used as the Bitrix contact's avatar.
   */
  async getContactInfo(apiKey: string, phone: string): Promise<ContactInfo> {
    const { data } = await this.call<ContactInfo>(
      `/api/contacts/${encodeURIComponent(phone)}`,
      apiKey,
    );
    return data;
  }

  /**
   * Profile picture URL from the dedicated endpoint: GET /api/contacts/{phone}/picture answers
   * `{success, data: {imgUrl}}` (wasenderapi-api-docs.md, "Get Contact Profile Picture").
   * getContactInfo's own imgUrl is documented as frequently null - its example returns
   * `"imgUrl": null` - even when the contact does have a picture, so this is the fallback
   * inbound.ts uses for the Bitrix avatar. Undefined when the contact has no picture or the call
   * fails: an avatar is cosmetic and must never cost a message.
   */
  async getContactPicture(apiKey: string, phone: string): Promise<string | undefined> {
    try {
      const { data } = await this.call<{ imgUrl?: string | null }>(
        `/api/contacts/${encodeURIComponent(phone)}/picture`,
        apiKey,
      );
      return data?.imgUrl?.startsWith('http') ? data.imgUrl : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Group counterpart to getContactInfo: `subject` is the group's own display name, used the
   * same way - so a new Open Line chat for a group shows its real name instead of Bitrix's
   * "Guest" fallback (inbound.ts's resolveContactName). Shape confirmed against
   * wasenderapi-api-docs.md, "Get Group Metadata".
   */
  async getGroupMetadata(apiKey: string, groupJid: string): Promise<GroupMetadata> {
    const { data } = await this.call<GroupMetadata>(
      `/api/groups/${encodeURIComponent(groupJid)}/metadata`,
      apiKey,
    );
    return data;
  }
}

export interface ContactInfo {
  name?: string | null;
  notify?: string | null;
  verifiedName?: string | null;
  /**
   * WhatsApp profile picture URL, passed to Bitrix as the contact's avatar (inbound.ts,
   * user.picture). Documented as nullable (wasenderapi-api-docs.md, "Get Contact Info" example
   * returns `"imgUrl": null`) - a contact whose privacy settings hide the picture has none.
   */
  imgUrl?: string | null;
}

export interface GroupMetadata {
  jid: string;
  subject?: string | null;
}

/**
 * The `messages.received` webhook payload's `data.messages` value. Modeled loosely and on
 * demand (only the fields the connector actually reads) rather than the full WhatsApp message schema -
 * everything else is opaque data passed through to decryptMedia untouched.
 */
export interface InboundMessage {
  key: {
    id: string;
    fromMe: boolean;
    remoteJid: string;
    cleanedSenderPn?: string;
    cleanedParticipantPn?: string;
  };
  messageBody?: string;
  message?: Record<string, unknown>;
}

/** The five media envelopes documented under `message`. Each carries at least a mimetype. */
export const MEDIA_MESSAGE_KEYS = [
  'imageMessage',
  'videoMessage',
  'audioMessage',
  'documentMessage',
  'stickerMessage',
] as const;

export const wasender = (env: Env) =>
  new WasenderClient(env.WASENDER_BASE_URL, env.WASENDER_MASTER_TOKEN);
