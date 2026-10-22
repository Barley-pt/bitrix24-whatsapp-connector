import { useState } from 'react';
import { addSession } from '../api';
import { useT } from '../i18n';

interface Props {
  onCreated: (sessionId: string) => void;
  onCancel: () => void;
}

export function AddNumber({ onCreated, onCancel }: Props) {
  const t = useT();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await addSession(name, phone);
      onCreated(session.id);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const field =
    'w-full rounded-field border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acp-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-400';

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="grid gap-2">
        <label htmlFor="wa-name" className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {t('add.label')}
        </label>
        <input
          id="wa-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sales UAE"
          required
          className={field}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('add.labelHint')}
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="wa-phone" className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {t('add.phone')}
        </label>
        <input
          id="wa-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+971557801481"
          required
          inputMode="tel"
          className={field}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('add.phoneHint')}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="sm:col-span-2 rounded-field border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-acp-500 px-4 py-2 text-sm font-medium text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
        >
          {busy ? t('add.creating') : t('add.create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t('add.cancel')}
        </button>
      </div>
    </form>
  );
}
