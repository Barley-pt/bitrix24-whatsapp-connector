import { useEffect, useState } from 'react';
import {
  type AppState,
  type Bootstrap,
  type WhatsAppSession,
  bindSessionToLine,
  fetchState,
  setGroupMessagesEnabled,
} from '../api';
import '../bx24';
import { useT } from '../i18n';

/**
 * Closes the small widget. `closeApplication` is the documented call for this - there is no
 * `placement.call('close')` command, that was a guess in the first version of this screen and
 * silently did nothing, leaving the Save button stuck on "Saving..." forever even though the
 * bind had already succeeded.
 */
function closeWidget() {
  const bx = window.BX24;
  if (!bx) return;
  bx.init(() => bx.closeApplication());
}

export function ConnectorSettings({ boot }: { boot: Bootstrap }) {
  const t = useT();
  const placement = boot.placement && 'lineId' in boot.placement ? boot.placement : null;

  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [groupEnabled, setGroupEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchState()
      .then((next) => {
        setState(next);
        const bound = next.sessions.find((s) => s.bitrix_line_id === placement?.lineId);
        const chosen = bound ?? next.sessions.find((s) => s.status === 'connected');
        setSelected(chosen?.id ?? '');
        setGroupEnabled(Boolean(chosen?.group_messages_enabled));
      })
      .catch((err: Error) => setError(err.message));
  }, [placement?.lineId]);

  /** Picking a different number should show *that* number's own group setting, not carry over. */
  function selectSession(s: WhatsAppSession) {
    setSelected(s.id);
    setGroupEnabled(Boolean(s.group_messages_enabled));
  }

  async function save() {
    if (!selected || !placement) return;
    setSaving(true);
    setError(null);
    try {
      const session = state?.sessions.find((s) => s.id === selected);
      if (session && Boolean(session.group_messages_enabled) !== groupEnabled) {
        await setGroupMessagesEnabled(selected, groupEnabled);
      }
      await bindSessionToLine(selected, placement.lineId);
      // The bind already succeeded server-side at this point - closing is best-effort, so a
      // stalled or unavailable BX24 script must not leave the button stuck on "Saving...".
      setSaving(false);
      setSaved(true);
      closeWidget();
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (!placement) {
    return (
      <div className="p-5 text-sm text-zinc-600 dark:text-zinc-300">
        {t('settings.openFromContactCenter')}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}

      {saved && (
        <p className="rounded-card border border-zinc-200 px-4 py-3 text-sm font-medium text-live-600 dark:border-zinc-700 dark:text-live-500">
          {t('settings.savedClose')}
        </p>
      )}

      {!state && !error && <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('common.loading')}</p>}

      {state && state.sessions.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('settings.noNumbers')}
        </p>
      )}

      {state && state.sessions.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-card border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          {state.sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="radio"
                id={s.id}
                name="session"
                checked={selected === s.id}
                disabled={s.status !== 'connected'}
                onChange={() => selectSession(s)}
              />
              <label htmlFor={s.id} className="flex-1 text-sm text-zinc-900 dark:text-zinc-50">
                {s.phone_number ?? t('common.numberPending')}
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {s.status === 'connected'
                    ? t('status.connected')
                    : t('common.notConnected', { status: s.status })}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {state && state.sessions.length > 0 && (
        <label className="flex items-start gap-2.5 rounded-card border border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <input
            type="checkbox"
            checked={groupEnabled}
            disabled={!state.license.groupConversationsAllowed}
            onChange={(e) => setGroupEnabled(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="block font-medium text-zinc-900 dark:text-zinc-50">
              {t('settings.allowGroup')}
            </span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">
              {state.license.groupConversationsAllowed
                ? t('settings.allowGroupHint')
                : t('settings.allowGroupNotInPlan')}
            </span>
          </span>
        </label>
      )}

      <button
        type="button"
        onClick={save}
        disabled={!selected || saving || saved}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-acp-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
      >
        {saved ? t('common.saved') : saving ? t('common.saving') : t('common.save')}
      </button>
    </div>
  );
}
