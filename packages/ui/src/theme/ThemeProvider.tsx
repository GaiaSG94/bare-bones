import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { I18nBundle, ThemeTokens } from "@bare-bones/core";
import { createTranslator } from "@bare-bones/core";
import type { Translator } from "@bare-bones/core";
import { DEFAULT_THEME, themeToCssVars } from "./tokens.js";

export interface ThemeContextValue {
  readonly theme: ThemeTokens;
  readonly t: Translator;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  t: createTranslator({ locale: "en", strings: {} }),
});

export function ThemeProvider({
  theme,
  i18n,
  children,
}: {
  theme?: ThemeTokens | undefined;
  i18n?: I18nBundle | undefined;
  children: ReactNode;
}) {
  const value = useMemo<ThemeContextValue>(() => {
    const merged = { ...DEFAULT_THEME, ...theme };
    return {
      theme: merged,
      t: createTranslator(i18n ?? { locale: "en", strings: {} }),
    };
  }, [theme, i18n]);

  const style = useMemo<CSSProperties>(
    () => ({ ...themeToCssVars(value.theme) }) as CSSProperties,
    [value.theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="bb-root" style={style} data-bb-locale={i18n?.locale ?? "en"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useBbTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
