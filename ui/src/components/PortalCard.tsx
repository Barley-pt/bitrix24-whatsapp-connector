import type { AppState } from '../api';
import { getLocale, useT } from '../i18n';

const formatDate = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString(getLocale() === 'pt-BR' ? 'pt-BR' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export function PortalCard({
  portal,
  license,
}: {
  portal: AppState['portal'];
  license: AppState['license'];
}) {
  const t = useT();
  return (
    <section className="rounded-card border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('portal.title')}</h2>

      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('portal.portal')}</dt>
          <dd className="truncate text-sm text-zinc-900 dark:text-zinc-100">{portal.domain}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('portal.installed')}</dt>
          <dd className="text-sm text-zinc-900 dark:text-zinc-100">
            {formatDate(portal.installedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('portal.channel')}</dt>
          <dd className="text-sm text-zinc-900 dark:text-zinc-100">
            {portal.connectorRegistered ? t('portal.registered') : t('portal.notRegistered')}
          </dd>
        </div>
        {license.maxConversationsPerMonth !== null && (
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t('portal.conversationsThisMonth')}</dt>
            <dd className="text-sm text-zinc-900 dark:text-zinc-100">
              {license.conversationsThisMonth} / {license.maxConversationsPerMonth}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
