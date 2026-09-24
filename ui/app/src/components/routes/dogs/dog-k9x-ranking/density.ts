import type { K9xRankingBucket } from "@/services/fetch-dogs/fetchDogs.types";

/** One vertical line of the silhouette: where it stands on the index scale and how tall it is. */
export type DensityLine = { x: number; value: number };

export const SCALE_MIN = 0;
export const SCALE_MAX = 1000;
/** Index points between two lines of the silhouette. */
export const LINE_STEP = 10;
/**
 * The narrowest the kernel gets, in index points. The field is a couple of thousand dogs, not a million, and
 * the index piles up on a few values (the prior that fills empty slots, the band floors), so a narrower kernel
 * draws those piles as spikes instead of the field's overall shape.
 */
export const MIN_BANDWIDTH = 40;

/**
 * The field's silhouette over the index scale: a Gaussian kernel density estimate of the ranking's bands, each
 * band's dogs taken at its center, sampled every {@link LINE_STEP} points from {@link SCALE_MIN} to
 * {@link SCALE_MAX}. The bandwidth follows Silverman's rule of thumb, floored at {@link MIN_BANDWIDTH}, so the
 * shape reads as a bell rather than as the raw, lumpy counts.
 *
 * Smoothing spreads every dog a little onto its neighbours, so the silhouette is cut to the span the dogs
 * actually occupy: nothing is drawn below the lowest non-empty band nor at or past the top of the highest one
 * (bands are half-open), so the chart never suggests dogs ahead of the leader. Only the shape is meaningful — the heights are relative.
 */
export const densityLines = (buckets: K9xRankingBucket[]): DensityLine[] => {
  const occupied = buckets.filter((bucket) => bucket.dogs > 0);
  const lines: DensityLine[] = [];
  const xs = Array.from(
    { length: (SCALE_MAX - SCALE_MIN) / LINE_STEP + 1 },
    (_, line) => SCALE_MIN + line * LINE_STEP,
  );
  if (occupied.length === 0) return xs.map((x) => ({ x, value: 0 }));

  const points = occupied.map((bucket) => ({
    center: (bucket.from + bucket.to) / 2,
    dogs: bucket.dogs,
  }));
  const total = points.reduce((sum, point) => sum + point.dogs, 0);
  const mean =
    points.reduce((sum, point) => sum + point.center * point.dogs, 0) / total;
  const deviation = Math.sqrt(
    points.reduce(
      (sum, point) => sum + point.dogs * (point.center - mean) ** 2,
      0,
    ) / total,
  );
  const bandwidth = Math.max(1.06 * deviation * total ** -0.2, MIN_BANDWIDTH);
  const lowest = occupied[0]!.from;
  const highest = occupied.at(-1)!.to;

  for (const x of xs) {
    const value =
      x < lowest || x >= highest
        ? 0
        : points.reduce(
            (sum, point) =>
              sum +
              point.dogs *
                Math.exp(-(((x - point.center) / bandwidth) ** 2) / 2),
            0,
          );
    lines.push({ x, value });
  }
  return lines;
};
