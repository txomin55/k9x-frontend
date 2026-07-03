import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { BREEDS_SNAPSHOT_ID, getBreedsQueryKey } from "./breedCrudConstants";

const refreshBreedsSnapshot = async () => {
  const breeds = await rawRequest<IdNameDTO[]>({
    path: "/secured/breeds",
  });

  await saveQuerySnapshot(BREEDS_SNAPSHOT_ID, breeds);
  queryClient.setQueryData(getBreedsQueryKey(), breeds);

  return breeds;
};

const fetchBreeds = () =>
  fetchWithOfflineSnapshot(BREEDS_SNAPSHOT_ID, refreshBreedsSnapshot);

const breedsQuery = defineQuery({
  fetcher: fetchBreeds,
  queryKey: ["breeds"] as const,
});

export const prefetchBreeds = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = breedsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useBreeds = (options?: TanstackCreateQuery) =>
  breedsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

export const getCachedBreeds = () =>
  queryClient.getQueryData<IdNameDTO[]>(getBreedsQueryKey());
