import { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import {
  COLLECTIONS_SNAPSHOT_ID,
  getCollectionByIdQueryKey,
  getCollectionSnapshotId,
  getCollectionsQueryKey
} from "@/services/api/collection-crud/collectionCrudConstants";
import { rawRequest } from "@/utils/http/client";
import {
  saveCollectionSnapshot,
  saveCollectionsSnapshot
} from "@/services/api/collection-crud/collectionCrudOfflineUtils";
import { CollectionsRequest, CompetitorScores } from "@/services/api/collection-crud/collectionCrud.types";
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

const refreshCollectionSnapshot = async (id: string) => {
  const collection = await rawRequest<CompetitorScores[]>({
    path: `/api/collections/${id}`,
  });

  await saveCollectionSnapshot(id, collection);
  queryClient.setQueryData(getCollectionByIdQueryKey(id), collection);

  return collection;
};

const fetchCollectionById = (id: string) =>
  fetchWithOfflineSnapshot(getCollectionSnapshotId(id), () =>
    refreshCollectionSnapshot(id),
  );

const collectionsQuery = defineQuery({
  fetcher: fetchCollections,
  queryKey: ["collections"] as const,
});

const collectionByIdQuery = defineQuery({
  fetcher: fetchCollectionById,
  queryKey: (id: string) => ["collection", id] as const,
});

const createCollectionsQuery = (options?: TanstackCreateQuery) =>
  collectionsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

const createCollectionByIdQuery = (id: string, options?: TanstackCreateQuery) =>
  collectionByIdQuery.useQuery([id], {
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

export const prefetchCollectionById = (
  id: string,
  options?: TanstackCreateQuery,
) => {
  const { queryFn, queryKey } = collectionByIdQuery.options(id);

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

export const useCollectionById = (id: string, options?: TanstackCreateQuery) =>
  createCollectionByIdQuery(id, options);

export const getCachedCollectionById = (id: string) =>
  queryClient.getQueryData<CompetitorScores[]>(getCollectionByIdQueryKey(id));
