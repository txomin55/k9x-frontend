import { getCurrentLocale } from "@/stores/i18n/i18n";

export const AWARDS_SNAPSHOT_PREFIX = "awards:";

export const getAwardsSnapshotId = (disciplineId: string) =>
  `${AWARDS_SNAPSHOT_PREFIX}${disciplineId}`;

export const getAwardsQueryKey = (disciplineId: string) =>
  ["awards", disciplineId, getCurrentLocale()] as const;
