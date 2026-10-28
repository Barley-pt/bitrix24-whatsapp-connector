import { CheckCircleIcon, QrCodeIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { type WhatsAppSession, disconnectSession } from '../api';
import { useT } from '../i18n';

/** Wasender's own vocabulary, mapped to operator-facing wording rather than remapped upstream. */
const STATUS_CLASS: Record<WhatsAppSession['status'], string> = {
  connected: 'text-live-600 dark:text-live-500',
  need_scan: 'text-amber-600 dark:text-amber-400',
  connecting: 'text-amber-600 dark:text-amber-400',
  disconnected: 'text-zinc-500 dark:text-zinc-400',
  logged_out: 'text-red-600 dark:text-red-400',
  expired: 'text-red-600 dark:text-red-400',
};

const FALLBACK_CLASS = 'text-zinc-500 dark:text-zinc-400';

const STATUS_KEY: Record<WhatsAppSession['status'], 'status.connected' | 'status.need_scan' | 'status.connecting' | 'status.disconnected' | 'status.logged_out' | 'status.expired'> = {
  connected: 'status.connected',
  need_scan: 'status.need_scan',
  connecting: 'status.connecting',
  disconnected: 'status.disconnected',
  logged_out: 'status.logged_out',
  expired: 'status.expired',
};

/**
 * The statuses where there is something to take down: a live WhatsApp link, or a linking attempt
 * already under way. The rest (disconnected, logged_out, expired) have nothing upstream to drop,
 * so the action would only be a confusing no-op button.
 */
const DISCONNECTABLE: readonly WhatsAppSession['status'][] = ['connected', 'connecting', 'need_scan'];

function StatusIcon({ status }: { status: WhatsAppSession['status'] }) {
  if (status === 'connected') return <CheckCircleIcon size={18} weight="fill" />;
  if (status === 'need_scan' || status === 'connecting') return <QrCodeIcon size={18} />;
  return <WarningCircleIcon size={18} />;
}

interface Props {
  sessions: WhatsAppSession[];
  onReconnect: (sessionId: string) => void;
  /**
   * Called once a disconnect has actually succeeded, so the page re-reads /api/state and the row
   * it just changed shows its new status. Same reload the reconnect path ends in (App.tsx), not a
   * local status guess - the Worker is the one that knows what Wasender said.
   */
  onDisconnected: () => void;
}

export function NumberList({ sessions, onReconnect, onDisconnected }: Props) {
  const t = useT();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-zinc-300 px-5 py-8 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t('numbers.emptyTitle')}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {t('numbers.emptyBody')}
        </p>
      </div>
    );
  }

  async function disconnect(session: WhatsAppSession) {
    // Taking a number offline stops its conversations reaching Bitrix24 until it is reconnected, so
    // it is confirmed first - the same guard Remove-style destructive actions get elsewhere.
    const name = session.phone_number ?? t('common.numberPending');
    if (!window.confirm(t('numbers.confirmDisconnect', { number: name }))) return;

    setBusyId(session.id);
    setError(null);
    try {
      await disconnectSession(session.id);
      onDisconnected();
    } catch (err) {
      // The Worker forwards Wasender's own wording, which is already operator-readable.
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="rounded-field border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {sessions.map((session) => {
          const statusKey = STATUS_KEY[session.status];
          const className = STATUS_CLASS[session.status] ?? FALLBACK_CLASS;
          const label = statusKey ? t(statusKey) : t('status.unknown');
          return (
            <li key={session.id} className="flex items-center gap-3 py-3">
              <span className={className} aria-hidden>
                <StatusIcon status={session.status} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {session.phone_number ?? t('common.numberPending')}
                </p>
                <p className={`truncate text-xs ${className}`}>
                  {label}
                  {session.bitrix_line_id ? ` · ${t('status.openLine', { id: session.bitrix_line_id })}` : ''}
                </p>
              </div>

              {DISCONNECTABLE.includes(session.status) && (
                <button
                  type="button"
                  onClick={() => disconnect(session)}
                  disabled={busyId === session.id}
                  className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {busyId === session.id ? t('numbers.disconnecting') : t('numbers.disconnect')}
                </button>
              )}

              {session.status !== 'connected' && (
                <button
                  type="button"
                  onClick={() => onReconnect(session.id)}
                  className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t('numbers.reconnect')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
