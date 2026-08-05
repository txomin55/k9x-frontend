import type { RankLetter } from "./types";

export const RANK_COLORS: Record<RankLetter, { bg: string; fg: string }> = {
  E: { bg: "rgb(254,226,226)", fg: "#b91c1c" },
  D: { bg: "rgb(254,243,199)", fg: "#b45309" },
  C: { bg: "rgb(228,228,231)", fg: "#3f3f46" },
  B: { bg: "rgb(219,234,254)", fg: "#1d4ed8" },
  A: { bg: "rgb(220,252,231)", fg: "#15803d" },
  S: { bg: "rgb(237,233,254)", fg: "#6d28d9" },
};

export const SERIES_COLORS = {
  blue: "#2a78d6",
  orange: "#eb6834",
  red: "#d03b3b",
  gray: "#898781",
  violet: "#7c3aed",
  amber: "#eda100",
  obdx: "#F59E0B",
  fillerBg: "#FEF3C7",
  fillerFg: "#92400E",
};

export const DOG_COLORS: Record<string, string> = {
  dogA: SERIES_COLORS.gray,
  dogB: SERIES_COLORS.blue,
  dogC: SERIES_COLORS.violet,
  dogD: SERIES_COLORS.amber,
};

export const dogColor = (id: string) => DOG_COLORS[id] ?? SERIES_COLORS.blue;

const readVariable = (name: string, fallback: string) => {
  if (typeof globalThis.document === "undefined") return fallback;

  const value = globalThis
    .getComputedStyle(globalThis.document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
};

/**
 * Chart.js only accepts resolved color strings, so the design tokens have to be read from the
 * document at build time. Callers re-read them whenever the theme signal flips.
 */
export const readChartTheme = () => ({
  grid: readVariable("--border", "#e8e8e4"),
  tick: readVariable("--text-secondary", "#898781"),
  surface: readVariable("--surface", "#ffffff"),
});

export const AXIS_FONT = { size: 12 };
