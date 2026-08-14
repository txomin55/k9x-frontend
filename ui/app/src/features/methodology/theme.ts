import type { RankLetter } from "./types";

export const RANK_COLORS: Record<RankLetter, { bg: string; fg: string }> = {
  E: { bg: "rgb(254,226,226)", fg: "#b91c1c" },
  D: { bg: "rgb(254,243,199)", fg: "#b45309" },
  C: { bg: "rgb(228,228,231)", fg: "#3f3f46" },
  B: { bg: "rgb(219,234,254)", fg: "#1d4ed8" },
  A: { bg: "rgb(220,252,231)", fg: "#15803d" },
  S: { bg: "rgb(237,233,254)", fg: "#6d28d9" },
};

const FALLBACK_RANK = { bg: "rgb(228,228,231)", fg: "#3f3f46" };

/** The scale is data-driven, so an unknown letter must degrade to a neutral swatch, not throw. */
export const rankColors = (letter: RankLetter) =>
  RANK_COLORS[letter] ?? FALLBACK_RANK;

const parseColor = (value: string): [number, number, number] => {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    return [0, 2, 4].map((offset) =>
      Number.parseInt(hex.slice(offset, offset + 2), 16),
    ) as [number, number, number];
  }

  return value.slice(value.indexOf("(") + 1, value.indexOf(")")).split(",").map(Number) as [
    number,
    number,
    number,
  ];
};

/** How far the darkest category travels from the badge fill towards the badge ink. */
const MAX_CATEGORY_SHADE = 0.7;

/**
 * A bar starts from the *fill* of its rank badge — the pale wash the reader already associates with that
 * letter — and darkens towards the badge's ink as the category climbs. So the lowest category matches the
 * badge exactly, and categories sharing a letter (Club, Open and the WC qualifier are all B in grade 3)
 * stay distinguishable without leaving the letter's hue.
 */
export const rankBarColor = (
  letter: RankLetter,
  categoryIndex: number,
  categoryCount: number,
) => {
  const { bg, fg } = rankColors(letter);
  const shade =
    categoryCount <= 1
      ? 0
      : MAX_CATEGORY_SHADE * (categoryIndex / (categoryCount - 1));
  const from = parseColor(bg);
  const to = parseColor(fg);
  const [r, g, b] = from.map((channel, index) =>
    Math.round(channel + (to[index]! - channel) * shade),
  );

  return `rgb(${r}, ${g}, ${b})`;
};

/** The pale end of the ramp needs an outline to read against the card background. */
export const rankBarBorder = (letter: RankLetter) => rankColors(letter).fg;

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
