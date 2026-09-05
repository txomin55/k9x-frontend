const UNKNOWN_JUDGE_PATTERN = /unknown/i;

export const UNKNOWN_JUDGE_LABEL = "??";

export function isUnknownJudge(name: string | null | undefined): boolean {
  return UNKNOWN_JUDGE_PATTERN.test(name ?? "");
}
