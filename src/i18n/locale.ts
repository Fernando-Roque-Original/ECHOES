import type { Locale } from './types';

export const LOCALE_STORAGE_KEY = 'after-the-signal-locale';
export const DEFAULT_LOCALE: Locale = 'pt-BR';

export function isLocale(value: string | null): value is Locale {
  return value === 'pt-BR' || value === 'en';
}

export function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(storedLocale)) return storedLocale;
  } catch {
    // Storage can be unavailable in privacy modes; English remains the default.
  }

  return DEFAULT_LOCALE;
}

export function applyLocalePreference(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Persisting the preference is optional.
  }
}
