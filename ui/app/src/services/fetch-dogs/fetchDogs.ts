import { createQuery } from "@tanstack/solid-query";
import { getCurrentLocale } from "@/stores/i18n/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { createPagesState } from "@/utils/pagination/pagesStore";
import type {
  DogIndexTimeline,
  DogParticipationYear,
  K9xRanking,
  PublicDog,
  PublicDogDetail,
  PublicDogPageDTO,
  PublicDogSearch,
} from "@/services/fetch-dogs/fetchDogs.types";

/**
 * Every filter combination is its own cache entry, and typing makes a new one per keystroke. They are
 * dropped soon after nothing reads them, so a long search does not leave the discarded ones in memory.
 */
const SEARCH_RESULTS_GC_TIME = 30_000;

/** Dogs fetched per request while scrolling the public directory. */
export const PUBLIC_DOGS_PAGE_SIZE = 50;

export const getPublicDogQueryKey = (identification: string) =>
  ["public-dog", identification, getCurrentLocale()] as const;

export const getPublicDogParticipationsQueryKey = (identification: string) =>
  ["public-dog-participations", identification, getCurrentLocale()] as const;

export const getPublicDogIndexQueryKey = (identification: string) =>
  ["public-dog-index", identification, getCurrentLocale()] as const;

export const getPublicK9xRankingQueryKey = (
  identification: string,
  country: string | undefined,
) =>
  [
    "public-k9x-ranking",
    identification,
    country ?? "",
    getCurrentLocale(),
  ] as const;

export const getPublicDogsQueryKey = (search: PublicDogSearch) =>
  [
    "public-dogs",
    search.name ?? "",
    search.handler ?? "",
    search.country ?? "",
    getCurrentLocale(),
  ] as const;

const fetchPublicDogsPage = (page: number, search: PublicDogSearch) =>
  rawRequest<PublicDogPageDTO>({
    path: `/dogs?${new URLSearchParams({
      page: String(page),
      size: String(PUBLIC_DOGS_PAGE_SIZE),
      ...(search.name ? { name: search.name } : {}),
      ...(search.handler ? { handler: search.handler } : {}),
      ...(search.country ? { country: search.country } : {}),
    })}`,
  });

const appendDogs = (previousDogs: PublicDog[], nextDogs: PublicDog[]) => {
  const known = new Set(previousDogs.map((dog) => dog.identification));

  return [
    ...previousDogs,
    ...nextDogs.filter((dog) => !known.has(dog.identification)),
  ];
};

const pages = createPagesState();

/** How far the directory has been scrolled, for the views that show "loading more" and stop asking. */
export const publicDogsPages = pages;

const firstPage = async (search: PublicDogSearch) => {
  pages.reset();

  const page = await fetchPublicDogsPage(0, search);

  pages.pageLoaded(page.page, page.total, page.totalPages);
  queryClient.setQueryData(getPublicDogsQueryKey(search), page.items);

  return page.items;
};

/**
 * Appends the next page to the same cache entry. Dogs already in it are not repeated: the server orders
 * by index, and a dog whose index changes between two requests could otherwise come back twice.
 */
export const loadMorePublicDogs = async (search: PublicDogSearch) => {
  if (!pages.hasMore() || pages.state().isLoadingMore) return;

  pages.startLoadingMore();

  try {
    const page = await fetchPublicDogsPage(pages.nextPage(), search);

    queryClient.setQueryData<PublicDog[]>(
      getPublicDogsQueryKey(search),
      (previousDogs) => appendDogs(previousDogs ?? [], page.items),
    );
    pages.pageLoaded(page.page, page.total, page.totalPages);
  } catch (error) {
    pages.stopLoadingMore();
    throw error;
  }
};

/**
 * The public dog directory, one page at a time. Every filter is served by the API, so each combination
 * is its own cache entry — and a key with no data yet would empty the list, taking the filter fields
 * and the caret in them with it. So a new search starts on the results of the previous one, which the
 * list keeps showing while the server answers, and swaps them under filters that never move.
 *
 * The very first load has no previous results to stand in, so it stays pending and the page shows its
 * skeleton rather than claiming for a moment that nothing matches.
 */
export const usePublicDogs = (search: () => PublicDogSearch) =>
  createQuery(() => ({
    queryKey: getPublicDogsQueryKey(search()),
    queryFn: () => firstPage(search()),
    networkMode: "always" as const,
    gcTime: SEARCH_RESULTS_GC_TIME,
    placeholderData: (previousDogs: PublicDog[] | undefined) => previousDogs,
  }));

/** The public detail of one dog. A dog that is gone, or was never there, answers 404. */
export const usePublicDog = (identification: () => string) =>
  createQuery(() => ({
    queryKey: getPublicDogQueryKey(identification()),
    queryFn: () =>
      rawRequest<PublicDogDetail>({
        path: `/dogs/${encodeURIComponent(identification())}`,
      }),
    networkMode: "always" as const,
  }));

/**
 * Results only change once a day, when the snapshot runs. Keeping them fresh for a while also stops the tab
 * from asking again for what the prefetch has just brought.
 */
const PARTICIPATIONS_STALE_TIME = 5 * 60_000;

const publicDogParticipationsQuery = (identification: string) => ({
  queryKey: getPublicDogParticipationsQueryKey(identification),
  queryFn: () =>
    rawRequest<DogParticipationYear[]>({
      path: `/dogs/${encodeURIComponent(identification)}/participations`,
    }),
  staleTime: PARTICIPATIONS_STALE_TIME,
  networkMode: "always" as const,
});

/** Every event the dog was entered in, grouped by year, newest first. */
export const usePublicDogParticipations = (identification: () => string) =>
  createQuery(() => publicDogParticipationsQuery(identification()));

/**
 * Starts the participations request alongside the dog's own, so the tab usually has them by the time it is
 * opened. Fire-and-forget: nothing waits on it, and a failure is left for the tab's own query to retry.
 */
export const prefetchPublicDogParticipations = (identification: string) =>
  void queryClient.prefetchQuery(publicDogParticipationsQuery(identification));

const publicDogIndexQuery = (identification: string) => ({
  queryKey: getPublicDogIndexQueryKey(identification),
  queryFn: () =>
    rawRequest<DogIndexTimeline>({
      path: `/dogs/${encodeURIComponent(identification)}/index`,
    }),
  staleTime: PARTICIPATIONS_STALE_TIME,
  networkMode: "always" as const,
});

/** The dog's K9X index over its career: its results and the curve between them. */
export const usePublicDogIndex = (identification: () => string) =>
  createQuery(() => publicDogIndexQuery(identification()));

/** Same as {@link prefetchPublicDogParticipations}, for the K9X tab. */
export const prefetchPublicDogIndex = (identification: string) =>
  void queryClient.prefetchQuery(publicDogIndexQuery(identification));

/** The ranking snapshot is only rewritten twice a month, so it stays fresh as long as the dog's own index. */
const publicK9xRankingQuery = (identification: string, country?: string) => ({
  queryKey: getPublicK9xRankingQueryKey(identification, country),
  queryFn: () =>
    rawRequest<K9xRanking>({
      path: `/k9x/ranking?${new URLSearchParams({
        dog: identification,
        ...(country ? { country } : {}),
      })}`,
    }),
  staleTime: PARTICIPATIONS_STALE_TIME,
  networkMode: "always" as const,
});

/**
 * The world ranking chart with the dog placed on it, world-wide or within `country`. Switching the scope keeps
 * the previous chart on screen until the new one arrives, rather than blanking the panel to its skeleton.
 */
export const usePublicK9xRanking = (
  identification: () => string,
  country: () => string | undefined,
) =>
  createQuery(() => ({
    ...publicK9xRankingQuery(identification(), country()),
    placeholderData: (previous: K9xRanking | undefined) => previous,
  }));

/** Same as {@link prefetchPublicDogParticipations}, for the world-wide ranking of the K9X tab. */
export const prefetchPublicK9xRanking = (identification: string) =>
  void queryClient.prefetchQuery(publicK9xRankingQuery(identification));

/**
 * The dog the breadcrumb of the detail page names, without waiting for its own request: the directory the
 * reader came from already listed it. Undefined until one of the two has it.
 */
export const getCachedPublicDogName = (identification: string) =>
  queryClient.getQueryData<PublicDogDetail>(
    getPublicDogQueryKey(identification),
  )?.name ??
  queryClient
    .getQueriesData<PublicDog[]>({ queryKey: ["public-dogs"] })
    .flatMap(([, dogs]) => dogs ?? [])
    .find((dog) => dog.identification === identification)?.name;
