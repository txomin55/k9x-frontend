import { getCurrentLocale } from "@/stores/i18n/i18n";

export const COLLECTIONS_SNAPSHOT_ID = "collections";
export const COLLECTION_SNAPSHOT_PREFIX = "collection:";

export const getCollectionsQueryKey = () =>
  ["collections", getCurrentLocale()] as const;

export const getCollectionSnapshotId = (id: string) =>
  `${COLLECTION_SNAPSHOT_PREFIX}${id}`;

export const getCollectionByIdQueryKey = (id: string) =>
  ["collection", id, getCurrentLocale()] as const;
