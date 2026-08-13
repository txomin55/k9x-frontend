import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import {
  getCategoriesQueryKey,
  getCategoriesSnapshotId,
} from "./categoryCrudConstants";

const refreshCategoriesSnapshot = async (disciplineId: string) => {
  const categories = await rawRequest<IdNameDTO[]>({
    path: `/secured/discipline/${disciplineId}/categories`,
  });

  await saveQuerySnapshot(getCategoriesSnapshotId(disciplineId), categories);
  queryClient.setQueryData(getCategoriesQueryKey(disciplineId), categories);

  return categories;
};

const fetchCategories = (disciplineId: string) =>
  fetchWithOfflineSnapshot(getCategoriesSnapshotId(disciplineId), () =>
    refreshCategoriesSnapshot(disciplineId),
  );

const categoriesQuery = defineQuery({
  fetcher: fetchCategories,
  queryKey: (disciplineId: string) => ["categories", disciplineId] as const,
});

export const prefetchCategories = (
  disciplineId: string,
  options?: TanstackCreateQuery,
) => {
  const { queryFn, queryKey } = categoriesQuery.options(disciplineId);
  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useCategories = (
  disciplineId: string,
  options?: TanstackCreateQuery,
) =>
  categoriesQuery.useQuery([disciplineId], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    enabled: !!disciplineId,
  });

export const getCachedCategories = (disciplineId: string) =>
  queryClient.getQueryData<IdNameDTO[]>(getCategoriesQueryKey(disciplineId));
