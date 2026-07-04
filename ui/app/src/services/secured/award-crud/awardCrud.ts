import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { getAwardsQueryKey, getAwardsSnapshotId } from "./awardCrudConstants";

const refreshAwardsSnapshot = async (disciplineId: string) => {
  const awards = await rawRequest<IdNameDTO[]>({
    path: `/secured/discipline/${disciplineId}/awards`,
  });

  await saveQuerySnapshot(getAwardsSnapshotId(disciplineId), awards);
  queryClient.setQueryData(getAwardsQueryKey(disciplineId), awards);

  return awards;
};

const fetchAwards = (disciplineId: string) =>
  fetchWithOfflineSnapshot(getAwardsSnapshotId(disciplineId), () =>
    refreshAwardsSnapshot(disciplineId),
  );

const awardsQuery = defineQuery({
  fetcher: fetchAwards,
  queryKey: (disciplineId: string) => ["awards", disciplineId] as const,
});

export const prefetchAwards = (
  disciplineId: string,
  options?: TanstackCreateQuery,
) => {
  const { queryFn, queryKey } = awardsQuery.options(disciplineId);
  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useAwards = (
  disciplineId: string,
  options?: TanstackCreateQuery,
) =>
  awardsQuery.useQuery([disciplineId], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    enabled: !!disciplineId,
  });

export const getCachedAwards = (disciplineId: string) =>
  queryClient.getQueryData<IdNameDTO[]>(getAwardsQueryKey(disciplineId));
