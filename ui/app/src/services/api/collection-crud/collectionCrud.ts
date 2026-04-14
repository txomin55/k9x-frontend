import { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import {
  COLLECTIONS_SNAPSHOT_ID,
  getCollectionsQueryKey
} from "@/services/api/collection-crud/collectionCrudConstants";
import { rawRequest } from "@/utils/http/client";
import { saveCollectionsSnapshot } from "@/services/api/collection-crud/collectionCrudOfflineUtils";
import { CollectionsRequest } from "@/services/api/collection-crud/collectionCrud.types";
import { createMemo } from "solid-js";
import { mergeCollectionsWithDrafts } from "@/services/api/collection-crud/collectionsDrafStore";

const refreshCollectionsSnapshot = async () => {
  const collections = await rawRequest<CollectionsRequest[]>({
    path: "/api/collections",
  });

  await saveCollectionsSnapshot(collections);
  queryClient.setQueryData(getCollectionsQueryKey(), collections);

  return collections;
};

const fetchCollections = () =>
  fetchWithOfflineSnapshot(COLLECTIONS_SNAPSHOT_ID, refreshCollectionsSnapshot);

const collectionsQuery = defineQuery({
  fetcher: fetchCollections,
  queryKey: ["collections"] as const,
});

const createCollectionsQuery = (options?: TanstackCreateQuery) =>
  collectionsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

export const useCollections = (options?: TanstackCreateQuery) => {
  const collections = createCollectionsQuery(options);
  const mergedData = createMemo(() =>
    mergeCollectionsWithDrafts(collections.data ?? []),
  );

  return new Proxy(collections, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergedData();
      }

      return Reflect.get(target, property, receiver);
    },
  });
};

export const prefetchCollections = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = collectionsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const getCachedCollections = () =>
  mergeCollectionsWithDrafts(
    queryClient.getQueryData<CollectionsRequest[]>(getCollectionsQueryKey()),
  );
