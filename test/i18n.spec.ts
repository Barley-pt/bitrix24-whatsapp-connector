import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  en,
  getLocale,
  ptBR,
  setLocale,
  subscribeLocale,
  t,
} from '../ui/src/i18n';

const LOCALE_STORAGE_KEY = 'acpzap.locale';

function installMemoryStorage() {
  const store = new Map<string, string>();
  const memoryStorage = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: memoryStorage,
  });
  return memoryStorage;
}

beforeEach(() => {
  installMemoryStorage();
  setLocale(DEFAULT_LOCALE);
});

afterEach(() => {
  setLocale(DEFAULT_LOCALE);
});

describe('i18n', () => {
  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(getLocale()).toBe('en');
    expect(t('app.title')).toBe('WhatsApp Connector');
  });

  it('returns Portuguese copy after setLocale(pt-BR)', () => {
    setLocale('pt-BR');
    expect(getLocale()).toBe('pt-BR');
    expect(t('app.title')).toBe('Conector do WhatsApp');
    expect(t('app.addNumber')).toBe('Adicionar número');
  });

  it('falls back to English when a key is missing from Portuguese, never a raw key', () => {
    const missingFromPt = '__missing_from_pt__' as Parameters<typeof t>[0];
    // Inject a key that exists only in EN for this assertion.
    (en as Record<string, string>).__missing_from_pt__ = 'English fallback copy';
    delete (ptBR as Record<string, string>).__missing_from_pt__;

    setLocale('pt-BR');
    expect(t(missingFromPt)).toBe('English fallback copy');
    expect(t(missingFromPt)).not.toBe('__missing_from_pt__');

    delete (en as Record<string, string>).__missing_from_pt__;
  });

  it('never returns a raw key when both catalogs omit it', () => {
    const ghost = '__ghost_key__' as Parameters<typeof t>[0];
    expect(t(ghost)).not.toBe('__ghost_key__');
    expect(t(ghost).includes('__ghost_key__')).toBe(false);
  });

  it('interpolates placeholders in both locales', () => {
    expect(t('app.planAllowsNumbers', { n: 2 })).toBe('Your plan allows 2 number(s).');
    setLocale('pt-BR');
    expect(t('app.planAllowsNumbers', { n: 2 })).toBe('Seu plano permite 2 número(s).');
  });

  it('covers every English key with a non-empty Brazilian Portuguese string', () => {
    const enKeys = Object.keys(en).sort();
    const ptKeys = Object.keys(ptBR).sort();
    expect(ptKeys).toEqual(enKeys);

    for (const key of enKeys) {
      const value = ptBR[key as keyof typeof ptBR];
      expect(value, key).toEqual(expect.any(String));
      expect(value.trim().length, key).toBeGreaterThan(0);
    }
  });

  it('persists the chosen locale under acpzap.locale and honors it after setLocale', () => {
    setLocale('pt-BR');
    expect(globalThis.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('pt-BR');
    expect(getLocale()).toBe('pt-BR');

    setLocale('en');
    expect(globalThis.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(getLocale()).toBe('en');
  });

  it('notifies subscribers so the UI can re-render without remounting', () => {
    let ticks = 0;
    const unsubscribe = subscribeLocale(() => {
      ticks += 1;
    });
    setLocale('pt-BR');
    setLocale('en');
    unsubscribe();
    const afterUnsub = ticks;
    setLocale('pt-BR');
    expect(ticks).toBe(2);
    expect(afterUnsub).toBe(2);
  });

  it('exposes labeled language-switcher copy in both catalogs', () => {
    expect(t('app.language.label')).toBe('Language');
    expect(t('app.language.en')).toBe('EN');
    expect(t('app.language.pt')).toBe('PT');
    setLocale('pt-BR');
    expect(t('app.language.label')).toBe('Idioma');
    expect(t('app.language.en')).toBe('EN');
    expect(t('app.language.pt')).toBe('PT');
  });
});
