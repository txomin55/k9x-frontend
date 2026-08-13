import { getCurrentLocale } from "@/stores/i18n/i18n";

export const CATEGORIES_SNAPSHOT_PREFIX = "categories:";

export const getCategoriesSnapshotId = (disciplineId: string) =>
  `${CATEGORIES_SNAPSHOT_PREFIX}${disciplineId}`;

export const getCategoriesQueryKey = (disciplineId: string) =>
  ["categories", disciplineId, getCurrentLocale()] as const;
