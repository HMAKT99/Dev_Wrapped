// themeColors.ts — explicit color tokens for image rendering (satori/ImageResponse
// can't parse the CSS theme files). Keep roughly in sync with themes/*.css.
import type { ThemeId } from "./themeList";

export interface ThemeColors {
  bg: string; // page background (may be a gradient)
  card: string; // card surface
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
}

export const THEME_COLORS: Record<ThemeId, ThemeColors> = {
  midnight: {
    bg: "linear-gradient(135deg,#15121f,#0b0b12)",
    card: "#1a1a28", fg: "#f5f5fa", muted: "#9aa0b5",
    accent: "#7c5cff", accent2: "#22d3ee",
  },
  synthwave: {
    bg: "linear-gradient(135deg,#2a1055,#0a0418)",
    card: "rgba(255,255,255,0.07)", fg: "#ffe9ff", muted: "#b98fd6",
    accent: "#ff2d95", accent2: "#19e3ff",
  },
  terminal: {
    bg: "linear-gradient(135deg,#04100a,#02060a)",
    card: "#0a1410", fg: "#c6ffd0", muted: "#5f9c72",
    accent: "#36ff7a", accent2: "#9dff5e",
  },
  editorial: {
    bg: "linear-gradient(135deg,#f8f3ea,#efe7d6)",
    card: "#fffaf0", fg: "#1a1714", muted: "#7d7468",
    accent: "#c0392b", accent2: "#8a6d3b",
  },
  bubblegum: {
    bg: "linear-gradient(135deg,#fff5fb,#ffe3f3)",
    card: "#ffffff", fg: "#2a0f24", muted: "#9a6c8c",
    accent: "#ff4fa3", accent2: "#3fa9ff",
  },
  sunset: {
    bg: "linear-gradient(135deg,#ff8a3d,#7a1f5c)",
    card: "rgba(255,255,255,0.14)", fg: "#fff7ef", muted: "#ffe3d2",
    accent: "#ffd166", accent2: "#fff0d2",
  },
};
