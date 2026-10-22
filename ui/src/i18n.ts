import { useSyncExternalStore } from 'react';
import { type MessageKey, en } from './i18n/en';
import { ptBR } from './i18n/pt-BR';

/** Supported UI locales. Portuguese is Brazilian (pt-BR) — see ui/src/i18n/pt-BR.ts. */
export type Locale = 'en' | 'pt-BR';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'pt-BR'];

const STORAGE_KEY = 'acpzap.locale';

const catalogs: Record<Locale, Record<string, string>> = {
  en,
  'pt-BR': ptBR,
};

export { en, ptBR };
export type { MessageKey };

const listeners = new Set<() => void>();

function readStored(): Locale | null {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt-BR') return stored;
  } catch {
    // Storage is optional (tests, locked-down iframes).
  }
  return null;
}

let locale: Locale = readStored() ?? DEFAULT_LOCALE;

export function getLocale(): Locale {
  return locale;
}

export function setLocale(next: Locale): void {
  if (next !== 'en' && next !== 'pt-BR') return;
  locale = next;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, next);
  } catch {
    // Ignore quota / privacy-mode failures; in-memory locale still applies.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeLocale(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars[name] === undefined ? match : String(vars[name]),
  );
}

/**
 * Look up `key` in the active locale, then English. A missing key never echoes back
 * as the raw key — callers get the English string, or an empty string if EN lacks it too.
 */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const template = catalogs[locale]?.[key] || catalogs.en[key] || '';
  return interpolate(template, vars);
}

/** Subscribe to locale changes so a later language switcher can re-render without remounting. */
export function useT(): typeof t {
  useSyncExternalStore(subscribeLocale, getLocale, () => DEFAULT_LOCALE);
  return t;
}
