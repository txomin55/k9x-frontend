import { getCurrentLocale } from "@/stores/i18n/i18n";

export const DOGS_SNAPSHOT_ID = "dogs";

/** Dogs fetched per request while scrolling the my-dogs list. */
export const DOGS_PAGE_SIZE = 50;

export const ALL_DOGS_SNAPSHOT_ID = "dogs-all";

export const OWNED_DOGS_SNAPSHOT_ID = "dogs-owned";

export const getDogsQueryKey = () => ["dogs", getCurrentLocale()] as const;

export const getAllDogsQueryKey = () =>
  ["dogs", "all", getCurrentLocale()] as const;

export const getOwnedDogsQueryKey = () =>
  ["dogs", "owned", getCurrentLocale()] as const;

export const getDogsSearchQueryKey = (search: {
  name?: string;
  country?: string;
}) =>
  [
    "dogs",
    "search",
    search.name ?? "",
    search.country ?? "",
    getCurrentLocale(),
  ] as const;

export const getAllDogsSearchQueryKey = (name: string) =>
  ["dogs", "all", "search", name, getCurrentLocale()] as const;
