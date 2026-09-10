import { createQuery } from "@tanstack/solid-query";
import { getCurrentLocale } from "@/stores/i18n/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { createPagesState } from "@/utils/pagination/pagesStore";
import type {
  PublicDog,
  PublicDogPageDTO,
  PublicDogSearch,
} from "@/services/fetch-dogs/fetchDogs.types";

/** Dogs fetched per request while scrolling the public directory. */
export const PUBLIC_DOGS_PAGE_SIZE = 50;

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
    placeholderData: (previousDogs: PublicDog[] | undefined) => previousDogs,
  }));
