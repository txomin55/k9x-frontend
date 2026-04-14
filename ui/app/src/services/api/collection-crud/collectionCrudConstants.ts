import { getCurrentLocale } from "@/stores/i18n";

export const COLLECTIONS_SNAPSHOT_ID = "collections";

export const getCollectionsQueryKey = () =>
  ["collections", getCurrentLocale()] as const;
