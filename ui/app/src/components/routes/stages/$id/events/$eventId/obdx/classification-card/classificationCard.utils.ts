import type {
  StageEventClassificationExerciseScoresResponseDTO,
  StageEventClassificationScoreResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export type RatingColor = "green" | "yellow" | "red" | "grey";

export type TrendDirection = "up" | "down" | "same";

export function positionTrend(
  previous: number | undefined,
  current: number,
): TrendDirection {
  if (previous === undefined || previous === current) return "same";
  return previous > current ? "up" : "down";
}

export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function ratingColorClass(
  rating: number | null | undefined,
): RatingColor {
  if (rating === null || rating === undefined) return "grey";
  if (rating >= 80) return "green";
  if (rating >= 50) return "yellow";
  return "red";
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
