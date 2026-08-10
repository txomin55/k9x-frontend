import { getCurrentLocale } from "@/stores/i18n/i18n";

export const RANKINGS_SNAPSHOT_ID = "rankings";

export const getRankingsQueryKey = () =>
  ["rankings", getCurrentLocale()] as const;

export const RANKING_SNAPSHOT_PREFIX = "ranking:";

export const getRankingSnapshotId = (id: string) =>
  `${RANKING_SNAPSHOT_PREFIX}${id}`;

export const getRankingQueryKey = (id: string) =>
  ["ranking", id, getCurrentLocale()] as const;

export const RANKING_GROUP_BYS_SNAPSHOT_ID = "ranking-group-bys";

export const getRankingGroupBysQueryKey = () =>
  ["ranking-group-bys", getCurrentLocale()] as const;

export const RANKING_INCLUDE_BYS_SNAPSHOT_ID = "ranking-include-bys";

export const getRankingIncludeBysQueryKey = () =>
  ["ranking-include-bys", getCurrentLocale()] as const;
