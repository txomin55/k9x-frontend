import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { getCurrentLocale } from "@/stores/i18n/i18n";
import type { RankingClassificationResponseDTO } from "./fetchRankings.types";

export const getRankingClassificationQueryKey = (rankingId: string) =>
  ["ranking-classification", rankingId, getCurrentLocale()] as const;

/**
 * Public ranking results. The endpoint is unsecured, so this works for a visitor with no session.
 *
 * It answers 204 when the competition has no ranking saved, which `rawRequest` turns into undefined;
 * normalised to null so "no ranking" is a value the cache can hold.
 */
const fetchRankingClassification = async (rankingId: string) =>
  (await rawRequest<RankingClassificationResponseDTO | undefined>({
    path: `/rankings/${rankingId}`,
  })) ?? null;

const rankingClassificationQuery = defineQuery({
  fetcher: fetchRankingClassification,
  queryKey: (rankingId: string) =>
    ["ranking-classification", rankingId] as const,
});

export const useRankingClassification = (
  rankingId: string,
  options?: TanstackCreateQuery,
) =>
  rankingClassificationQuery.useQuery([rankingId], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    enabled: !!rankingId,
  });

export const getCachedRankingClassification = (rankingId: string) =>
  queryClient.getQueryData<RankingClassificationResponseDTO | null>(
    getRankingClassificationQueryKey(rankingId),
  );

/**
 * Drops the cached results so the next read recomputes them. Called after a configuration change, since the
 * ranking's events and criteria are what the results are derived from.
 */
export const invalidateRankingClassification = (rankingId: string) =>
  queryClient.invalidateQueries({
    queryKey: ["ranking-classification", rankingId],
  });
