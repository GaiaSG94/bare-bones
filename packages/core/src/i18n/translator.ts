import type { I18nBundle } from "../types.js";

export type Translator = (key: string, fallback?: string) => string;

export function createTranslator(bundle: I18nBundle): Translator {
  const strings = bundle.strings;
  return (key: string, fallback?: string) =>
    strings[key] ?? fallback ?? key;
}

export function withFallbacks(
  bundle: I18nBundle,
  fallbacks: Readonly<Record<string, string>>,
): I18nBundle {
  return { ...bundle, strings: { ...fallbacks, ...bundle.strings } };
}
