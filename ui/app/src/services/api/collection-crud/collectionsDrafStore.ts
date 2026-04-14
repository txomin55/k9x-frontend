import { CollectionsRequest } from "@/services/api/collection-crud/collectionCrud.types";
import { createSignal } from "solid-js";

const [collectionDrafts, setCollectionDrafts] = createSignal<
  Record<string, CollectionsRequest>
>({});
const [removedCollectionIds, setRemovedCollectionsIds] = createSignal<string[]>(
  [],
);

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
