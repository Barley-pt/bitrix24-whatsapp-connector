import { t } from './i18n';

export interface WhatsAppSession {
  id: string;
  phone_number: string | null;
  status: 'connected' | 'disconnected' | 'connecting' | 'need_scan' | 'logged_out' | 'expired';
  bitrix_line_id: number | null;
  connector_active: number;
  group_messages_enabled: number;
  last_status_at: number | null;
  last_error: string | null;
}

export interface AppState {
  portal: {
    domain: string;
    installedAt: number;
    connectorRegistered: boolean;
    /** False = Bitrix events can't be authenticated, so operator replies never reach WhatsApp. */
    eventsReady: boolean;
  };
  sessions: WhatsAppSession[];
  license: {
    tier: string | null;
    status: string;
    licensed: boolean;
    expiresAt: number | null;
    maxNumbers: number | null;
    maxConversationsPerMonth: number | null;
    conversationsThisMonth: number;
    groupConversationsAllowed: boolean;
    messageSchedulingAllowed: boolean;
    enforced: boolean;
  };
}

export type CrmEntityType = 'lead' | 'deal' | 'contact' | 'company' | 'dynamic';

export interface CrmPlacement {
  entityType: CrmEntityType;
  entityId: number;
  /** Only set when entityType is 'dynamic' - which Smart Process (SPA) type the tab is open on. */
  entityTypeId?: number;
}

export interface Bootstrap {
  session: string;
  view: 'setup' | 'connector-settings' | 'crm-tab';
  appVersion: string;
  /**
   * Which Open Line the connector-settings widget is configuring, or which CRM entity the
   * click-to-chat tab is open on. Null outside the matching placement.
   */
  placement: { lineId: number } | CrmPlacement | null;
}

/** Injected by the Worker into index.html. Absent when the bundle is opened directly. */
export function bootstrap(): Bootstrap | null {
  const raw = (window as unknown as { __ACPZAP__?: unknown }).__ACPZAP__;
  return raw && typeof raw === 'object' ? (raw as Bootstrap) : null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = bootstrap()?.session;
  if (!token) throw new Error(t('api.openFromPortal'));

  const res = await fetch(path, {
    ...init,
    headers: { 'X-App-Session': token, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

  const body = (await res.json().catch(() => null)) as
    | (T & { message?: string; error?: string })
    | null;

  if (!res.ok) {
    // The Worker forwards Wasender's own wording, which is already operator-readable.
    throw new Error(body?.message ?? body?.error ?? t('api.requestFailed', { status: res.status }));
  }
  if (!body) throw new Error(t('api.emptyResponse'));
  return body;
}

export const fetchState = () => request<AppState>('/api/state');

export const activateLicense = (licenseKey: string) =>
  request<{ ok: true; license: AppState['license'] }>('/api/license/activate', {
    method: 'POST',
    body: JSON.stringify({ licenseKey }),
  }).then((r) => r.license);

export const addSession = (name: string, phoneNumber: string) =>
  request<{ session: WhatsAppSession }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ name, phoneNumber }),
  }).then((r) => r.session);

export const requestQr = (id: string) =>
  request<{ status: string; qrCode: string | null }>(`/api/sessions/${id}/qr`, { method: 'POST' });

export const sessionStatus = (id: string) =>
  request<{ status: string }>(`/api/sessions/${id}/status`).then((r) => r.status);

export const deleteSession = (id: string) =>
  request<{ ok: true }>(`/api/sessions/${id}`, { method: 'DELETE' });

export const bindSessionToLine = (id: string, lineId: number) =>
  request<{ session: WhatsAppSession }>(`/api/sessions/${id}/bind`, {
    method: 'POST',
    body: JSON.stringify({ lineId }),
  }).then((r) => r.session);

export const setGroupMessagesEnabled = (id: string, enabled: boolean) =>
  request<{ session: WhatsAppSession }>(`/api/sessions/${id}/group-messages`, {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  }).then((r) => r.session);

export interface ChatMatch {
  phone: string;
  bitrixChatId: number;
  lastMessageAt: number | null;
}

export interface CrmContext {
  phones: string[];
  sessions: (WhatsAppSession & { matches: ChatMatch[] })[];
}

export const fetchCrmContext = (placement: CrmPlacement) => {
  const params = new URLSearchParams({
    entityType: placement.entityType,
    entityId: String(placement.entityId),
    ...(placement.entityTypeId ? { entityTypeId: String(placement.entityTypeId) } : {}),
  });
  return request<CrmContext>(`/api/crm/context?${params}`);
};

/** The placement travels with the request purely so the Worker can name the customer - a chat
 * created without a name is titled "Guest - <line name>" (see src/crm.ts, resolveClientName). */
export const startCrmConversation = (sessionId: string, phone: string, placement: CrmPlacement) =>
  request<{ bitrixChatId: number }>('/api/crm/start', {
    method: 'POST',
    body: JSON.stringify({ sessionId, phone, ...placement }),
  }).then((r) => r.bitrixChatId);
