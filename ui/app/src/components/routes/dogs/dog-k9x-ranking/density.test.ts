import { densityLines } from "@/components/routes/dogs/dog-k9x-ranking/density";
import type { K9xRankingBucket } from "@/services/fetch-dogs/fetchDogs.types";

const buckets = (dogs: Record<number, number>): K9xRankingBucket[] =>
  Array.from({ length: 45 }, (_, band) => {
    const from = 100 + band * 20;
    return { from, to: from + 20, dogs: dogs[from] ?? 0 };
  });

const at = (lines: { x: number; value: number }[], x: number) =>
  lines.find((line) => line.x === x)!.value;

describe("ranking density", () => {
  test("samples the whole scale every 10 points", () => {
    const lines = densityLines(buckets({ 400: 10 }));

    expect(lines).toHaveLength(101);
    expect(lines[0]!.x).toBe(0);
    expect(lines.at(-1)!.x).toBe(1000);
  });

  test("is flat when nobody is charted", () => {
    expect(densityLines(buckets({})).every((line) => line.value === 0)).toBe(
      true,
    );
  });

  test("smooths lumpy counts into a single hump peaking where the field is", () => {
    // spikes and holes, as a small field piles up on a few values
    const lines = densityLines(
      buckets({ 300: 50, 320: 5, 340: 60, 360: 2, 380: 70, 400: 3, 420: 55 }),
    );

    const inside = lines.filter((line) => line.value > 0);
    const peak = inside.reduce((best, line) =>
      line.value > best.value ? line : best,
    );
    expect(peak.x).toBeGreaterThanOrEqual(340);
    expect(peak.x).toBeLessThanOrEqual(390);
    // rises to the peak and falls after it, with no dip for the near-empty bands
    const rising = inside.filter((line) => line.x <= peak.x);
    const falling = inside.filter((line) => line.x >= peak.x);
    expect(
      rising.every((line, i) => i === 0 || line.value >= rising[i - 1]!.value),
    ).toBe(true);
    expect(
      falling.every(
        (line, i) => i === 0 || line.value <= falling[i - 1]!.value,
      ),
    ).toBe(true);
  });

  test("draws nothing outside the bands the dogs occupy", () => {
    const lines = densityLines(buckets({ 400: 10, 880: 1 }));

    expect(at(lines, 390)).toBe(0);
    expect(at(lines, 400)).toBeGreaterThan(0);
    expect(at(lines, 890)).toBeGreaterThan(0);
    expect(at(lines, 900)).toBe(0);
  });
});
