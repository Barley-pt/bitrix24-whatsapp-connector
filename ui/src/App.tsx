import { MoonIcon, PlusIcon, SunIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { type AppState, type Bootstrap, bootstrap, fetchState } from './api';
import { AddNumber } from './components/AddNumber';
import { ConnectorSettings } from './components/ConnectorSettings';
import { CrmTab } from './components/CrmTab';
import { LicenseActivation } from './components/LicenseActivation';
import { LicenseBadge } from './components/LicenseBadge';
import { NumberList } from './components/NumberList';
import { PortalCard } from './components/PortalCard';
import { QrPanel } from './components/QrPanel';
import { getLocale, setLocale, useT } from './i18n';
import { type Theme, resolveTheme, setTheme } from './theme';

type Panel = { kind: 'list' } | { kind: 'add' } | { kind: 'qr'; sessionId: string };

/**
 * Bitrix opens several distinct URLs into this same bundle: the main app tab, the small
 * connector-settings widget from Contact Center, and the CRM lead/deal/contact/company detail tab
 * (see routes/install.ts). Branching here, before any sub-component's hooks run, keeps each one's
 * hook order unconditional.
 */
export function App() {
  const boot = bootstrap();
  if (boot && boot.view === 'connector-settings') {
    return <ConnectorSettings boot={boot} />;
  }
  if (boot && boot.view === 'crm-tab') {
    return <CrmTab boot={boot} />;
  }
  return <SetupApp boot={boot} />;
}

function SetupApp({ boot }: { boot: Bootstrap | null }) {
  const t = useT();
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>({ kind: 'list' });
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme());

  const reload = useCallback(() => {
    fetchState()
      .then((next) => {
        setState(next);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!boot?.session) return;
    reload();
  }, [boot?.session, reload]);

  const displayError = !boot?.session ? t('app.openFromPortal') : error;

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  const onConnected = useCallback(() => reload(), [reload]);

  const atLimit =
    state?.license.enforced === true &&
    state.license.maxNumbers !== null &&
    state.sessions.length >= state.license.maxNumbers;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-5 px-5 py-7">
      <header className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-acp-500 text-lg font-semibold text-white"
        >
          Z
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('app.title')}
          </h1>
          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
            {state?.portal.domain ?? t('app.loadingPortal')}
          </p>
        </div>

        {state && <LicenseBadge license={state.license} />}

        <LanguageSwitcher />

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('app.theme.toLight') : t('app.theme.toDark')}
          className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acp-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>
      </header>

      {displayError && (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {displayError}
        </p>
      )}

      {!state && !displayError && (
        <div className="space-y-3" aria-busy="true">
          <div className="h-28 animate-pulse rounded-card bg-zinc-200/70 dark:bg-zinc-800" />
          <div className="h-40 animate-pulse rounded-card bg-zinc-200/70 dark:bg-zinc-800" />
        </div>
      )}

      {/* Nothing else on this screen shows a problem when Bitrix events can't be authenticated -
          numbers read "connected", the connector is registered, inbound messages keep arriving -
          while every operator reply is silently discarded (routes/events.ts). This banner is the
          only surface that failure has. It clears itself: each app open retries the repair, so an
          operator who reloads after reinstalling sees it disappear. */}
      {state && !state.portal.eventsReady && (
        <p
          role="alert"
          className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <strong className="font-semibold">{t('app.eventsNotReady.title')}</strong>{' '}
          {t('app.eventsNotReady.body')}
        </p>
      )}

      {state && !state.license.licensed && <LicenseActivation onActivated={reload} />}

      {state && (
        <>
          <section className="rounded-card border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {t('app.numbers.title')}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t('app.numbers.subtitle')}
                </p>
              </div>

              {panel.kind === 'list' && (
                <button
                  type="button"
                  onClick={() => setPanel({ kind: 'add' })}
                  disabled={atLimit}
                  title={
                    atLimit
                      ? t('app.planAllowsNumbers', { n: state.license.maxNumbers ?? 0 })
                      : undefined
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-acp-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 disabled:active:scale-100 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                >
                  <PlusIcon size={16} weight="bold" />
                  {t('app.addNumber')}
                </button>
              )}
            </div>

            {panel.kind === 'add' && (
              <AddNumber
                onCreated={(sessionId) => {
                  reload();
                  setPanel({ kind: 'qr', sessionId });
                }}
                onCancel={() => setPanel({ kind: 'list' })}
              />
            )}

            {panel.kind === 'qr' && (
              <QrPanel
                sessionId={panel.sessionId}
                onConnected={onConnected}
                onClose={() => {
                  reload();
                  setPanel({ kind: 'list' });
                }}
              />
            )}

            {panel.kind === 'list' && (
              <NumberList
                sessions={state.sessions}
                onReconnect={(sessionId) => setPanel({ kind: 'qr', sessionId })}
              />
            )}
          </section>

          <PortalCard portal={state.portal} license={state.license} />
        </>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const t = useT();
  const locale = getLocale();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('app.language.label')}</span>
      <div
        role="group"
        aria-label={t('app.language.label')}
        className="inline-flex h-9 items-center rounded-full border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
      >
        <button
          type="button"
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
          className={
            locale === 'en'
              ? 'h-8 min-w-[2.25rem] rounded-full bg-acp-500 px-2.5 text-xs font-semibold text-white'
              : 'h-8 min-w-[2.25rem] rounded-full px-2.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acp-500 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }
        >
          {t('app.language.en')}
        </button>
        <button
          type="button"
          aria-pressed={locale === 'pt-BR'}
          onClick={() => setLocale('pt-BR')}
          className={
            locale === 'pt-BR'
              ? 'h-8 min-w-[2.25rem] rounded-full bg-acp-500 px-2.5 text-xs font-semibold text-white'
              : 'h-8 min-w-[2.25rem] rounded-full px-2.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acp-500 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }
        >
          {t('app.language.pt')}
        </button>
      </div>
    </div>
  );
}
