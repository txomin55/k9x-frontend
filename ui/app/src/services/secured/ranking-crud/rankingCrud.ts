import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { includesAll } from "@/utils/ranking";
import { invalidateRankingClassification } from "@/services/fetch-rankings/fetchRankings";
import type {
  CreateRankingRequestDTO,
  RankingListItemResponseDTO,
  RankingResponseDTO,
} from "./rankingCrud.types";
import {
  applyRankingRemoval,
  applyRankingUpsert,
  commitRankingMutation,
  createRankingRollbackPayload,
  getVisibleRanking,
  saveRankingSnapshot,
} from "./rankingCrudOfflineUtils";
import {
  getRankingQueryKey,
  getRankingsQueryKey,
  getRankingSnapshotId,
  RANKINGS_SNAPSHOT_ID,
  RANKING_INCLUDE_BYS_SNAPSHOT_ID,
  RANKING_GROUP_BYS_SNAPSHOT_ID,
  getRankingIncludeBysQueryKey,
  getRankingGroupBysQueryKey,
} from "./rankingCrudConstants";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { mergeRankingWithDraft } from "./rankingDraftStore";

const refreshRankingsSnapshot = async () => {
  const rankings = await rawRequest<RankingListItemResponseDTO[]>({
    path: "/secured/rankings",
  });

  await saveQuerySnapshot(RANKINGS_SNAPSHOT_ID, rankings);
  queryClient.setQueryData(getRankingsQueryKey(), rankings);

  return rankings;
};

const rankingsQuery = defineQuery({
  fetcher: () =>
    fetchWithOfflineSnapshot(RANKINGS_SNAPSHOT_ID, refreshRankingsSnapshot),
  queryKey: ["rankings"] as const,
});

export const prefetchRankings = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = rankingsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useRankings = (options?: TanstackCreateQuery) =>
  rankingsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    get enabled() {
      return options?.enabled ? options.enabled() : true;
    },
  } as never);

/**
 * The list is a projection of the rankings, so it is stale after any write. Invalidated rather than patched
 * in place: a create or delete changes both membership and the event counts.
 */
export const invalidateRankings = () =>
  queryClient.invalidateQueries({ queryKey: ["rankings"] });

const refreshRankingSnapshot = async (id: string) => {
  // The endpoint answers 204 when the competition has no ranking yet, and rawRequest turns that into
  // undefined. Normalised to null so "no ranking" is a value the cache can hold.
  const ranking =
    (await rawRequest<RankingResponseDTO | undefined>({
      path: `/secured/rankings/${id}`,
    })) ?? null;

  await saveRankingSnapshot(id, ranking);
  queryClient.setQueryData(getRankingQueryKey(id), ranking);

  return ranking;
};

const fetchRanking = (id: string) =>
  fetchWithOfflineSnapshot(getRankingSnapshotId(id), () =>
    refreshRankingSnapshot(id),
  );

const rankingQuery = defineQuery({
  fetcher: fetchRanking,
  queryKey: (id: string) => ["ranking", id] as const,
});

export const prefetchRanking = (id: string, options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = rankingQuery.options(id);

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

const withMergedRankingDraft = <T extends { data?: RankingResponseDTO | null }>(
  ranking: T,
  id: string,
): T =>
  new Proxy(ranking, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergeRankingWithDraft(id, target.data ?? null);
      }

      return Reflect.get(target, property, receiver);
    },
  });

export const useRanking = (id: string, options?: TanstackCreateQuery) =>
  withMergedRankingDraft(
    rankingQuery.useQuery([id], {
      staleTime: options?.staleTime,
      gcTime: options?.gcTime,
      // Required: without it TanStack Query short-circuits while offline and the IndexedDB snapshot is
      // never read.
      networkMode: "always",
      refetchOnMount: options?.refetchOnMount,
      enabled: !!id,
    }),
    id,
  );

export const getCachedRanking = (id: string) =>
  queryClient.getQueryData<RankingResponseDTO | null>(getRankingQueryKey(id));

const toRankingProjection = (
  payload: CreateRankingRequestDTO,
  eventNamesById: Map<string, string>,
): RankingResponseDTO => ({
  rankingId: payload.rankingId,
  name: payload.name,
  events: payload.eventIds.map((eventId) => ({
    id: eventId,
    name: eventNamesById.get(eventId) ?? eventId,
  })),
  groupBy: payload.groupBy,
  includeBy: payload.includeBy,
  includedCount: includesAll(payload.includeBy) ? null : payload.includedCount,
  includeReserves: payload.includeReserves,
});

/**
 * Stores the ranking. Synchronous by convention: the optimistic projection is applied and returned right
 * away, and the request is committed (or queued while offline) in a floating promise.
 *
 * The POST replaces the whole ranking, so it is idempotent: several queued saves converge on the last one.
 */
export const saveRanking = (
  payload: CreateRankingRequestDTO,
  eventNames: IdNameDTO[] = [],
) => {
  const previousRanking = getVisibleRanking(payload.rankingId);
  const eventNamesById = new Map<string, string>([
    ...(previousRanking?.events ?? []).map(
      (event) => [event.id, event.name] as const,
    ),
    ...eventNames.map((event) => [event.id, event.name] as const),
  ]);
  const draftRanking = toRankingProjection(payload, eventNamesById);

  applyRankingUpsert(draftRanking);

  void (async () => {
    await commitRankingMutation({
      entityId: draftRanking.rankingId,
      method: "POST",
      // The results are derived from the events and criteria, so they have to be read again once the new
      // configuration is stored. onCommitted is the online path; a mutation replayed from the offline queue
      // goes through commitRankingMutationSuccess instead.
      onCommitted: async () => {
        await invalidateRankingClassification(draftRanking.rankingId);
        // The list shows the name and the event count, so it is stale after a save too.
        await invalidateRankings();
      },
      payload,
      rollbackPayload: await createRankingRollbackPayload(
        draftRanking.rankingId,
        previousRanking,
      ),
      url: "/secured/rankings",
    });
  })();

  return draftRanking;
};

export const deleteRanking = (id: string) => {
  const previousRanking = getVisibleRanking(id);

  applyRankingRemoval(id);

  void (async () => {
    await commitRankingMutation({
      entityId: id,
      method: "DELETE",
      onCommitted: async () => {
        await invalidateRankingClassification(id);
        await invalidateRankings();
      },
      rollbackPayload: await createRankingRollbackPayload(id, previousRanking),
      url: `/secured/rankings/${id}`,
    });
  })();
};

const refreshRankingGroupBysSnapshot = async () => {
  const groupBys = await rawRequest<IdNameDTO[]>({
    path: "/secured/rankings/group-bys",
  });

  await saveQuerySnapshot(RANKING_GROUP_BYS_SNAPSHOT_ID, groupBys);
  queryClient.setQueryData(getRankingGroupBysQueryKey(), groupBys);

  return groupBys;
};

const rankingGroupBysQuery = defineQuery({
  fetcher: () =>
    fetchWithOfflineSnapshot(
      RANKING_GROUP_BYS_SNAPSHOT_ID,
      refreshRankingGroupBysSnapshot,
    ),
  queryKey: ["ranking-group-bys"] as const,
});

export const prefetchRankingGroupBys = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = rankingGroupBysQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useRankingGroupBys = (options?: TanstackCreateQuery) =>
  rankingGroupBysQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

const refreshRankingIncludeBysSnapshot = async () => {
  const includeBys = await rawRequest<IdNameDTO[]>({
    path: "/secured/rankings/include-bys",
  });

  await saveQuerySnapshot(RANKING_INCLUDE_BYS_SNAPSHOT_ID, includeBys);
  queryClient.setQueryData(getRankingIncludeBysQueryKey(), includeBys);

  return includeBys;
};

const rankingIncludeBysQuery = defineQuery({
  fetcher: () =>
    fetchWithOfflineSnapshot(
      RANKING_INCLUDE_BYS_SNAPSHOT_ID,
      refreshRankingIncludeBysSnapshot,
    ),
  queryKey: ["ranking-include-bys"] as const,
});

export const prefetchRankingIncludeBys = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = rankingIncludeBysQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useRankingIncludeBys = (options?: TanstackCreateQuery) =>
  rankingIncludeBysQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });
