import { rankColors } from "@/features/methodology/theme";
import type {
  GlobalScaleRange,
  RankLetter,
} from "@/features/methodology/types";

/**
 * The rank letter of a value on the global 0-1000 scale: the highest band whose floor it has reached, so a
 * decimal score between two integer bands (200.5) falls in the lower one, as the scale's integer bounds mean.
 */
export const rankLetterOf = (
  value: number,
  ranges: GlobalScaleRange[],
): RankLetter | undefined =>
  [...ranges]
    .sort((a, b) => a.min - b.min)
    .filter((range) => value >= range.min)
    .at(-1)?.letter;

/**
 * The color a value is drawn in: its rank badge's ink on a light surface, and the badge's pale fill on a dark
 * one, where the ink would sink into the background. `fallback` covers the scale not being loaded yet.
 */
export const rankColorOf = (
  value: number,
  ranges: GlobalScaleRange[],
  dark: boolean,
  fallback: string,
) => {
  const letter = rankLetterOf(value, ranges);
  if (!letter) return fallback;
  const colors = rankColors(letter);
  return dark ? colors.bg : colors.fg;
};

/** `color` made translucent, for the faint score dots. Accepts the `#rrggbb` and `rgb(r, g, b)` forms. */
export const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith("#")) {
    return `${color}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
  }
  return color.replace(/^rgb\((.*)\)$/, `rgba($1, ${alpha})`);
};
