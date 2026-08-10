import type { CreateRankingRequestDTO } from "@/services/secured/ranking-crud/rankingCrud.types";

export const RANKING_GROUP_BY = {
  INDIVIDUAL: "INDIVIDUAL",
  TEAM: "TEAM",
  COUNTRY: "COUNTRY",
} as const;

export const RANKING_INCLUDE_BY = {
  HIGHEST: "HIGHEST",
  LOWEST: "LOWEST",
  ALL: "ALL",
} as const;

export const RANKING_ID_PREFIX = "ranking_";

/**
 * A competition owns exactly one ranking, so its identifier is derived rather than generated: the same
 * competition always resolves to the same ranking, which is what makes the POST an idempotent upsert.
 */
export const getRankingId = (competitionId: string) =>
  `${RANKING_ID_PREFIX}${competitionId}`;

/**
 * Default configuration of a brand new ranking: group individually and discard nothing.
 */
export const createDefaultRanking = (
  competitionId: string,
  name: string,
): CreateRankingRequestDTO => ({
  rankingId: getRankingId(competitionId),
  name,
  eventIds: [],
  groupBy: RANKING_GROUP_BY.INDIVIDUAL,
  includeBy: RANKING_INCLUDE_BY.ALL,
  includedCount: null,
});

export const includesAll = (includeBy: string) =>
  includeBy === RANKING_INCLUDE_BY.ALL;
