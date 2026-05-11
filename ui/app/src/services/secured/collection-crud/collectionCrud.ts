import { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import {
  COLLECTIONS_SNAPSHOT_ID,
  getCollectionByIdQueryKey,
  getCollectionSnapshotId,
  getCollectionsQueryKey,
} from "@/services/secured/collection-crud/collectionCrudConstants";
import { rawRequest } from "@/utils/http/client";
import {
  applyCollectionUpsert,
  commitCollectionMutation,
  commitCollectionMutationSuccess,
  createCollectionRollbackPayload,
  getVisibleCollectionById,
  saveCollectionSnapshot,
  saveCollectionsSnapshot,
} from "@/services//secured/collection-crud/collectionCrudOfflineUtils";
import {
  CollectionResponseDTO,
  CollectionsResponseDTO,
  UpdateCollectionScoreRequestDTO,
} from "@/services/secured/collection-crud/collectionCrud.types";
import { createMemo } from "solid-js";
import {
  mergeCollectionByIdWithDraft,
  mergeCollectionsWithDrafts,
} from "@/services/secured/collection-crud/collectionsDrafStore";

const refreshCollectionsSnapshot = async () => {
  const collections = await rawRequest<CollectionsResponseDTO[]>({
    path: "/secured/collections",
  });

  await saveCollectionsSnapshot(collections);
  queryClient.setQueryData(getCollectionsQueryKey(), collections);

  return collections;
};

const fetchCollections = () =>
  fetchWithOfflineSnapshot(COLLECTIONS_SNAPSHOT_ID, refreshCollectionsSnapshot);

const refreshCollectionSnapshot = async (id: string) => {
  const collection = await rawRequest<CollectionResponseDTO>({
    path: `/secured/events/${id}/collections`,
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
    queryClient.getQueryData<CollectionsResponseDTO[]>(
      getCollectionsQueryKey(),
    ),
  );

export const useCollectionById = (
  id: string,
  options?: TanstackCreateQuery,
) => {
  const collection = createCollectionByIdQuery(id, options);
  const mergedData = createMemo(() =>
    mergeCollectionByIdWithDraft(id, collection.data),
  );

  return new Proxy(collection, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergedData();
      }

      return Reflect.get(target, property, receiver);
    },
  });
};

export const getCachedCollectionById = (id: string) =>
  queryClient.getQueryData<CollectionResponseDTO>(
    getCollectionByIdQueryKey(id),
  );

const updateCollectionScoreProjection = (
  previousCollection: CollectionResponseDTO,
  payload: UpdateCollectionScoreRequestDTO,
): CollectionResponseDTO => ({
  ...previousCollection,
  obdx: {
    competitors: previousCollection.obdx.competitors.map((competitorScores) =>
      competitorScores.competitor.dog.id === payload.dogId
        ? {
            ...competitorScores,
            exercises: competitorScores.exercises.map((exerciseScores) =>
              exerciseScores.exercise.id === payload.exerciseId
                ? {
                    ...exerciseScores,
                    collectionScores: exerciseScores.collectionScores.map(
                      (scoreEntry) =>
                        scoreEntry.judge.id === payload.judgeId
                          ? {
                              ...scoreEntry,
                              score: payload.score,
                            }
                          : scoreEntry,
                    ),
                  }
                : exerciseScores,
            ),
          }
        : competitorScores,
    ),
  },
});

export const updateCollectionScore = (
  eventId: string,
  payload: UpdateCollectionScoreRequestDTO,
) => {
  const previousCollection = getVisibleCollectionById(eventId);

  if (!previousCollection) {
    throw new Error(`Collection ${eventId} not found`);
  }

  const nextCollection = updateCollectionScoreProjection(
    previousCollection,
    payload,
  );
  const entityId = [
    payload.dogId,
    payload.exerciseId,
    payload.judgeId,
    payload.eventId,
  ].join(":");

  applyCollectionUpsert(eventId, nextCollection);

  void (async () => {
    await commitCollectionMutation({
      entityId,
      method: "PUT",
      payload,
      onCommitted: () =>
        commitCollectionMutationSuccess({
          eventId,
          method: "PUT",
        }),
      rollbackPayload: await createCollectionRollbackPayload(
        eventId,
        previousCollection,
      ),
      url: `/secured/obdx/events/${eventId}/score`,
    });
  })();

  return nextCollection;
};
