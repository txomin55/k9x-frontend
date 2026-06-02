import { getCurrentLocale } from "@/stores/i18n/i18n";

export const DOGS_SNAPSHOT_ID = "dogs";

export const ALL_DOGS_SNAPSHOT_ID = "dogs-all";

export const getDogsQueryKey = () => ["dogs", getCurrentLocale()] as const;

export const getAllDogsQueryKey = () =>
  ["dogs", "all", getCurrentLocale()] as const;
