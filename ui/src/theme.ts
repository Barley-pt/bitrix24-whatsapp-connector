export type Theme = 'light' | 'dark';

const KEY = 'acpzap.theme';

/** System preference is the default; an explicit choice overrides it and persists. */
export function resolveTheme(): Theme {
  const stored = localStorage.getItem(KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

export function applyStoredTheme(): void {
  applyTheme(resolveTheme());
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
  applyTheme(theme);
}
