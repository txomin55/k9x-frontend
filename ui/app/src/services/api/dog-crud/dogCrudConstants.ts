import { getCurrentLocale } from "@/stores/i18n";

export const DOGS_SNAPSHOT_ID = "dogs";

export const getDogsQueryKey = () =>
  ["dogs", getCurrentLocale()] as const;
