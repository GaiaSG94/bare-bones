import type { ThemeTokens } from "@bare-bones/core";

export const DEFAULT_THEME: ThemeTokens = {
  colors: {
    background: "#f4f3f0",
    surface: "#ffffff",
    ink: "#1a1a1a",
    muted: "#6f6f6f",
    accent: "#1f6feb",
    line: "#d9d7d2",
    good: "#2e7d32",
    neutral: "#9e9e9e",
    bad: "#c62828",
  },
  fonts: {
    sans: "Inter, system-ui, sans-serif",
    mono: "'Geist Mono', ui-monospace, monospace",
    serif: "'Instrument Serif', Georgia, serif",
  },
  radii: {
    card: "22px",
    pill: "999px",
  },
  spacing: {
    unit: "8px",
  },
};

/**
 * Turns declarative theme tokens into CSS custom properties. Themes live
 * in each app's explorer config, never hardcoded in the kit.
 */
export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--bb-color-${key}`] = value;
  }
  for (const [key, value] of Object.entries(theme.fonts)) {
    vars[`--bb-font-${key}`] = value;
  }
  for (const [key, value] of Object.entries(theme.radii)) {
    vars[`--bb-radius-${key}`] = value;
  }
  for (const [key, value] of Object.entries(theme.spacing)) {
    vars[`--bb-space-${key}`] = value;
  }
  return vars;
}
