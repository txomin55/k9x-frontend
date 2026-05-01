import {
  CollectionRequest,
  CollectionsRequest,
} from "@/services/secured/collection-crud/collectionCrud.types";
import { createSignal } from "solid-js";

const [collectionDrafts, setCollectionDrafts] = createSignal<
  Record<string, CollectionsRequest>
>({});
const [removedCollectionIds, setRemovedCollectionsIds] = createSignal<string[]>(
  [],
);
const [collectionByIdDrafts, setCollectionByIdDrafts] = createSignal<
  Record<string, CollectionRequest>
>({});

export const mergeCollectionsWithDrafts = (
  baseCollections?: CollectionsRequest[],
) => {
  const drafts = collectionDrafts();
  const removedIds = new Set(removedCollectionIds());
  const collections = baseCollections ?? [];
  const nextCollections = collections
    .filter((collection) => !removedIds.has(collection.eventId))
    .map((collection) => drafts[collection.eventId] ?? collection);
  const baseIds = new Set(collections.map((collection) => collection.eventId));
  const appendedDrafts = Object.values(drafts).filter(
    (collection) =>
      !baseIds.has(collection.eventId) && !removedIds.has(collection.eventId),
  );

  return [...appendedDrafts, ...nextCollections];
};

export const mergeCollectionByIdWithDraft = (
  collectionId: string,
  baseCollection?: CollectionRequest,
) => collectionByIdDrafts()[collectionId] ?? baseCollection;

export const upsertCollectionByIdDraft = (
  collectionId: string,
  collection: CollectionRequest,
) => {
  setCollectionByIdDrafts((current) => ({
    ...current,
    [collectionId]: collection,
  }));
};

export const replaceCollectionByIdDraft = (
  collectionId: string,
  visibleCollection: CollectionRequest | null,
  baseCollection?: CollectionRequest,
) => {
  setCollectionByIdDrafts((current) => {
    const nextDrafts = { ...current };

    if (
      visibleCollection &&
      (!baseCollection ||
        JSON.stringify(baseCollection) !== JSON.stringify(visibleCollection))
    ) {
      nextDrafts[collectionId] = visibleCollection;
      return nextDrafts;
    }

    delete nextDrafts[collectionId];

    return nextDrafts;
  });
};
