import type { AppState } from '../api';
import { type MessageKey, useT } from '../i18n';

const LABELS: Record<string, MessageKey> = {
  active: 'license.status.active',
  expired: 'license.status.expired',
  suspended: 'license.status.suspended',
  unlicensed: 'license.status.unlicensed',
};

export function LicenseBadge({ license }: { license: AppState['license'] }) {
  const t = useT();
  const healthy = license.status === 'active';
  const key = LABELS[license.status];
  const label = key ? t(key) : license.status;

  return (
    <span
      className={
        healthy
          ? 'rounded-full bg-live-500/15 px-3 py-1 text-xs font-medium text-live-600 dark:text-live-500'
          : 'rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
      }
    >
      {label}
      {license.tier ? ` · ${license.tier}` : ''}
    </span>
  );
}
