import type {
  StageEventClassificationExerciseScoresResponseDTO,
  StageEventClassificationScoreResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export type TrendDirection = "up" | "down" | "same";

export function positionTrend(
  previous: number | undefined,
  current: number,
): TrendDirection {
  if (previous === undefined || previous === current) return "same";
  return previous > current ? "up" : "down";
}

const YELLOW = "color-mix(in oklab, var(--warning), gold 28%)";

// Rating (%) -> position on the red(0)..yellow(1)..green(2) ramp.
// Flat within each band so the contrast lands on the 58->60 and 70->80 jumps.
const RATING_STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], // red
  [58, 0], // red (flat below 60)
  [60, 1], // yellow
  [70, 1], // yellow (flat band 60-70)
  [80, 2], // green
  [100, 2], // green (flat band 80+)
];

export function ratingColor(
  rating: number | null | undefined,
): string | null {
  if (rating === null || rating === undefined) return null;
  const clamped = Math.max(0, Math.min(100, rating));
  let pos = RATING_STOPS[RATING_STOPS.length - 1][1];
  for (let i = 1; i < RATING_STOPS.length; i++) {
    const [prevRating, prevPos] = RATING_STOPS[i - 1];
    const [nextRating, nextPos] = RATING_STOPS[i];
    if (clamped <= nextRating) {
      const t = (clamped - prevRating) / (nextRating - prevRating);
      pos = prevPos + t * (nextPos - prevPos);
      break;
    }
  }
  if (pos <= 1) {
    const p = Math.round(pos * 100);
    return `color-mix(in oklch, var(--error), ${YELLOW} ${p}%)`;
  }
  const p = Math.round((pos - 1) * 100);
  return `color-mix(in oklch, ${YELLOW}, var(--success) ${p}%)`;
}

const SHORT_CODE_STOP_WORDS = new Set([
  "on",
  "in",
  "of",
  "the",
  "a",
  "an",
  "and",
  "to",
  "at",
]);

export function exerciseShortCode(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 0 && !SHORT_CODE_STOP_WORDS.has(word.toLowerCase()),
    );

  const source = words.length > 0 ? words : name.trim().split(/\s+/);

  if (source.length >= 2) {
    return (source[0][0] + source[1][0]).toUpperCase();
  }
  return source[0]?.slice(0, 2).toUpperCase() ?? "";
}

export function judgeInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, 3);
}

export function averageValue(
  scores: StageEventClassificationScoreResponseDTO[],
): number | null {
  if (!scores || scores.length === 0) return null;
  const sum = scores.reduce((acc, score) => acc + score.value, 0);
  return sum / scores.length;
}

export function uniqueJudges(
  exercises: StageEventClassificationExerciseScoresResponseDTO[],
): IdNameDTO[] {
  const seen = new Set<string>();
  const judges: IdNameDTO[] = [];
  for (const exercise of exercises) {
    for (const score of exercise.scores) {
      if (!seen.has(score.judge.id)) {
        seen.add(score.judge.id);
        judges.push(score.judge);
      }
    }
  }
  return judges;
}

export function isLive(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalized = status.toLowerCase();
  return normalized.includes("live") || normalized.includes("progress");
}
