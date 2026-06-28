// themeList.ts — pure theme catalog (no node:fs), safe to import in client code.

export const THEMES = [
  { id: "midnight", label: "Midnight", swatch: ["#7c5cff", "#22d3ee", "#0b0b12"] },
  { id: "synthwave", label: "Synthwave", swatch: ["#ff2d95", "#19e3ff", "#16082e"] },
  { id: "terminal", label: "Terminal", swatch: ["#36ff7a", "#9dff5e", "#02060a"] },
  { id: "editorial", label: "Editorial", swatch: ["#c0392b", "#8a6d3b", "#f6f1e7"] },
  { id: "bubblegum", label: "Bubblegum", swatch: ["#ff4fa3", "#3fa9ff", "#fff5fb"] },
  { id: "sunset", label: "Sunset", swatch: ["#ffd166", "#fff0d2", "#e0426b"] },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const DEFAULT: ThemeId = "midnight";

export function isTheme(x: string | undefined | null): x is ThemeId {
  return !!x && THEMES.some((t) => t.id === x);
}

export function resolveTheme(x: string | undefined | null): ThemeId {
  return isTheme(x) ? x : DEFAULT;
}
