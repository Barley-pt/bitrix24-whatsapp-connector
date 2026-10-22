import { useEffect, useMemo, useState } from 'react';
import { type Bootstrap, type CrmContext, fetchCrmContext, startCrmConversation } from '../api';
import { useT } from '../i18n';
import '../bx24';

/** Opens the native Bitrix24 chat window - Messenger.openChat is the current API, but this app
 * already loads the legacy BX24 script (install.ts, ConnectorSettings.tsx), and BX24.im.openMessenger
 * is still the documented way to drive it from there. `chat<CHAT_ID>` is the same dialog id shape
 * im.dialog.get and im.dialog.messages.get use elsewhere. */
function openChat(bitrixChatId: number) {
  const bx = window.BX24;
  if (!bx?.im) return;
  bx.init(() => bx.im?.openMessenger(`chat${bitrixChatId}`));
}

export function CrmTab({ boot }: { boot: Bootstrap }) {
  const t = useT();
  const placement = boot.placement && 'entityType' in boot.placement ? boot.placement : null;

  const [context, setContext] = useState<CrmContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!placement) return;
    fetchCrmContext(placement)
      .then((next) => {
        setContext(next);
        const firstPhone = next.phones[0] ?? '';
        setPhone(firstPhone);
        const withMatch = next.sessions.find((s) => s.matches.some((m) => m.phone === firstPhone));
        const connected = next.sessions.find((s) => s.status === 'connected');
        setSessionId((withMatch ?? connected ?? next.sessions[0])?.id ?? '');
      })
      .catch((err: Error) => setError(err.message));
  }, [placement]);

  const session = context?.sessions.find((s) => s.id === sessionId) ?? null;
  const match = useMemo(
    () => session?.matches.find((m) => m.phone === phone) ?? null,
    [session, phone],
  );

  async function go() {
    if (match) {
      openChat(match.bitrixChatId);
      return;
    }
    if (!session || !placement) return;

    setStarting(true);
    setError(null);
    try {
      const bitrixChatId = await startCrmConversation(session.id, phone, placement);
      // Deliberately nothing else here between creating the chat and opening it. A prior version
      // called im.chat.user.add (then imopenlines.session.join) immediately after creation to let
      // the operator close/complete the chat before sending a message - but that call had been
      // silently dead since day one (a separate bug always threw before it could run), so
      // "opens correctly in Open Lines" was only ever proven for exactly this bare sequence:
      // create, then open. Fixing that other bug let this call start actually executing, which is
      // when chats started opening as a plain internal chat instead of an Open Line one - so it
      // comes back out rather than trading a minor operator convenience for a critical regression.
      // See imopenlines.dialog.get - a real Open Line chat's own dialog_id is `chat<CHAT_ID>`,
      // the same id openChat already uses below, which rules out the id format as the cause.
      openChat(bitrixChatId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStarting(false);
    }
  }

  if (!placement) {
    return (
      <div className="p-5 text-sm text-zinc-600 dark:text-zinc-300">
        {t('crm.openFromRecord')}
      </div>
    );
  }

  const canStart = Boolean(session) && (match !== null || session?.status === 'connected');
  const notBound = session && !session.bitrix_line_id;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-5">
      <div>
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('crm.title')}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('crm.subtitle')}
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

      {!context && !error && <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('common.loading')}</p>}

      {context && context.phones.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('crm.noPhone')}
        </p>
      )}

      {context && context.sessions.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('crm.noNumbers')}
        </p>
      )}

      {context && context.phones.length > 1 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t('crm.phoneLabel')}</span>
          <select
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-card border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {context.phones.map((p) => (
              <option key={p} value={p}>
                +{p}
              </option>
            ))}
          </select>
        </div>
      )}

      {context && context.sessions.length > 1 && (
        <ul className="divide-y divide-zinc-200 rounded-card border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          {context.sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <input
                type="radio"
                id={s.id}
                name="crm-session"
                checked={sessionId === s.id}
                onChange={() => setSessionId(s.id)}
              />
              <label htmlFor={s.id} className="flex-1 text-sm text-zinc-900 dark:text-zinc-50">
                {s.phone_number ?? t('common.numberPending')}
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {s.status === 'connected'
                    ? t('status.connected')
                    : t('common.notConnected', { status: s.status })}
                  {s.matches.some((m) => m.phone === phone) ? t('crm.existingConversation') : ''}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {!match && notBound && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('crm.notBound')}
        </p>
      )}

      {context && context.phones.length > 0 && context.sessions.length > 0 && (
        <button
          type="button"
          onClick={go}
          disabled={!canStart || (!match && Boolean(notBound)) || starting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-acp-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {starting ? t('crm.starting') : match ? t('crm.openConversation') : t('crm.startConversation')}
        </button>
      )}
    </div>
  );
}
