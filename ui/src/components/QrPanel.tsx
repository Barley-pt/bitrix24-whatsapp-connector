import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { requestQr, sessionStatus } from '../api';
import { useT } from '../i18n';

interface Props {
  sessionId: string;
  onConnected: () => void;
  onClose: () => void;
}

const POLL_MS = 3000;
const CONNECTED_HOLD_MS = 1500;

/**
 * Wasender returns the raw WhatsApp QR string (`2@...`), not an image, so it is encoded here.
 * A data URI is handled too, in case the API ever returns one.
 */
export function QrPanel({ sessionId, onConnected, onClose }: Props) {
  const t = useT();
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    requestQr(sessionId)
      .then((res) => {
        if (cancelled) return;
        setQr(res.qrCode);
        setStatus(res.status);
      })
      .catch((err: Error) => !cancelled && setError(err.message));

    // The session.status webhook is the authoritative signal, but it lands server-side; the open
    // panel polls so the operator sees the change without reloading.
    const timer = setInterval(async () => {
      try {
        const next = await sessionStatus(sessionId);
        if (cancelled) return;
        setStatus(next);
        if (next === 'connected') clearInterval(timer);
      } catch {
        // A failed poll is not worth surfacing; the next tick retries.
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionId]);

  // Hold the checkmark on screen briefly before the parent reloads, so the operator sees it.
  useEffect(() => {
    if (status !== 'connected') return;
    const timer = setTimeout(onConnected, CONNECTED_HOLD_MS);
    return () => clearTimeout(timer);
  }, [status, onConnected]);

  return (
    <div className="grid justify-items-center gap-4 py-2 text-center">
      {status === 'connected' ? (
        <>
          <svg
            width={80}
            height={80}
            viewBox="0 0 80 80"
            aria-hidden="true"
            className="animate-scale-in"
          >
            <circle cx="40" cy="40" r="40" fill="#25D366" />
            <path
              d="M24 41l11 11 21-23"
              fill="none"
              stroke="#fff"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {t('qr.connected')}
          </p>
        </>
      ) : error ? (
        <p
          role="alert"
          className="rounded-field border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      ) : qr ? (
        <>
          <div className="rounded-card bg-white p-4">
            {qr.startsWith('data:') ? (
              <img src={qr} alt={t('qr.alt')} width={220} height={220} />
            ) : (
              <QRCodeSVG value={qr} size={220} level="M" />
            )}
          </div>
          <div className="max-w-sm">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t('qr.scanTitle')}
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t('qr.scanHint')}
            </p>
          </div>
        </>
      ) : (
        <div className="h-[252px] w-[252px] animate-pulse rounded-card bg-zinc-200/70 dark:bg-zinc-800" />
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('qr.status', { status })}</p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {t('qr.done')}
      </button>
    </div>
  );
}
