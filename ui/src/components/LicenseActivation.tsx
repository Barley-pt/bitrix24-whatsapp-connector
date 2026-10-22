import { useState } from 'react';
import { activateLicense } from '../api';
import { useT } from '../i18n';

export function LicenseActivation({ onActivated }: { onActivated: () => void }) {
  const t = useT();
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await activateLicense(key);
      setKey('');
      onActivated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t('license.activateTitle')}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {t('license.activateHint')}
      </p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="ACP-XXXX-XXXX-XXXX-XXXX"
          required
          autoCapitalize="characters"
          className="w-full flex-1 rounded-field border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {busy ? t('license.activating') : t('license.activate')}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-field border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
    </section>
  );
}
