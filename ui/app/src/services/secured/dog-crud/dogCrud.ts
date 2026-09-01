import { createQuery } from "@tanstack/solid-query";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { queryClient } from "@/utils/http/query-client";
import {
  applyDogRemoval,
  applyDogUpsert,
  commitDogMutation,
  createDogRollbackPayload,
  getVisibleDogs,
  saveDogsSnapshot,
} from "./dogCrudOfflineUtils";
import type {
  CreateDogRequestDTO,
  Dog,
  DogPageDTO,
  UpdateDogRequestDTO,
} from "./dogCrud.types";
import {
  ALL_DOGS_SNAPSHOT_ID,
  DOGS_PAGE_SIZE,
  DOGS_SNAPSHOT_ID,
  OWNED_DOGS_SNAPSHOT_ID,
  getAllDogsQueryKey,
  getAllDogsSearchQueryKey,
  getDogsQueryKey,
  getDogsSearchQueryKey,
  getOwnedDogsQueryKey,
} from "./dogCrudConstants";
import { createDogPagesState, type DogPages } from "./dogPagesStore";
import { mergeDogsWithDrafts } from "./dogDraftStore";
import { getCachedCountries } from "@/services/secured/country-crud/countryCrud";
import { getCachedBreeds } from "@/services/secured/breed-crud/breedCrud";

const MY_DOGS_FILTERS = "owned=true&created=true";

/** Every dog in the kennel, for the organizer picking one to add to an event. */
const ALL_DOGS_FILTERS = "";

const buildDogsPath = (filters: string, params?: Record<string, string>) => {
  const query = new URLSearchParams(params);
  const search = query.toString();

  return `/secured/dogs${filters ? `?${filters}` : ""}${search ? `${filters ? "&" : "?"}${search}` : ""}`;
};

/**
 * What the caller is narrowing the list down to, beyond the fixed filters of the list itself. `name` and
 * `identification` are alternatives on the server: sending the same text as both returns the dogs matching
 * either of the two, which is what a single search box over the kennel is after.
 */
export type DogListSearch = {
  name?: string;
  country?: string;
  identification?: string;
};

const fetchDogsPage = (filters: string, page: number, search?: DogListSearch) =>
  rawRequest<DogPageDTO>({
    path: buildDogsPath(filters, {
      page: String(page),
      size: String(DOGS_PAGE_SIZE),
      ...(search?.name ? { name: search.name } : {}),
      ...(search?.country ? { country: search.country } : {}),
      ...(search?.identification
        ? { identification: search.identification }
        : {}),
    }),
  });

const appendDogs = (previousDogs: Dog[], nextDogs: Dog[]) => {
  const known = new Set(previousDogs.map((dog) => dog.identification));

  return [
    ...previousDogs,
    ...nextDogs.filter((dog) => !known.has(dog.identification)),
  ];
};

/**
 * A dog list the caller walks one page at a time: `first` starts it over, `loadMore` appends the next
 * page to the same cache entry, and `pages` says how far it has got. Both the user's own dogs and the
 * whole kennel are read this way, filtered or not.
 */
const pagedDogs = (filters: string, pages: DogPages) => ({
  pages,
  first: async (queryKey: readonly unknown[], search?: DogListSearch) => {
    pages.reset();

    const page = await fetchDogsPage(filters, 0, search);

    pages.pageLoaded(page.page, page.total, page.totalPages);
    queryClient.setQueryData(queryKey, page.items);

    return page.items;
  },
  // Dogs already in the cache are not repeated: one created while scrolling can come back in a later page.
  loadMore: async (queryKey: readonly unknown[], search?: DogListSearch) => {
    if (!pages.hasMore() || pages.state().isLoadingMore) return;

    pages.startLoadingMore();

    try {
      const page = await fetchDogsPage(filters, pages.nextPage(), search);

      queryClient.setQueryData<Dog[]>(queryKey, (previousDogs) =>
        appendDogs(previousDogs ?? [], page.items),
      );
      pages.pageLoaded(page.page, page.total, page.totalPages);
    } catch (error) {
      pages.stopLoadingMore();
      throw error;
    }
  },
});

const myDogs = pagedDogs(MY_DOGS_FILTERS, createDogPagesState());

/**
 * The name search is served by the API, so it is kept apart from the list cache: that cache is the base
 * of the local-first list, and seeding it with a filtered subset would read as "these dogs are gone".
 */
const myDogsSearch = pagedDogs(MY_DOGS_FILTERS, createDogPagesState());

const allDogs = pagedDogs(ALL_DOGS_FILTERS, createDogPagesState());

const allDogsSearch = pagedDogs(ALL_DOGS_FILTERS, createDogPagesState());

export const myDogsPages = myDogs.pages;

export const dogsSearchPages = myDogsSearch.pages;

export const allDogsPages = allDogs.pages;

export const allDogsSearchPages = allDogsSearch.pages;

const refreshDogsSnapshot = () => myDogs.first(getDogsQueryKey());

export const loadMoreDogs = () => myDogs.loadMore(getDogsQueryKey());

export const loadMoreDogsSearch = (search: DogListSearch) =>
  myDogsSearch.loadMore(getDogsSearchQueryKey(search), search);

export const loadMoreAllDogs = () => allDogs.loadMore(getAllDogsQueryKey());

/** The kennel is searched by dog name or by identification, so the typed text goes as both. */
const allDogsSearchOf = (term: string): DogListSearch => ({
  name: term,
  identification: term,
});

export const loadMoreAllDogsSearch = (term: string) =>
  allDogsSearch.loadMore(getAllDogsSearchQueryKey(term), allDogsSearchOf(term));

/**
 * Built on `createQuery` rather than on the query factory: the searched name changes as the user types,
 * and the factory takes its arguments once, which would pin the query to the name it was created with.
 *
 * Every keystroke asks for a different key, and a key with no data yet suspends the page — taking the
 * search box, and the caret in it, with it. So the query always starts with something to show: the
 * results of the previous search, or the dogs already listed, which the caller narrows down locally
 * while the server answers. The list is then replaced under a search box that never moves.
 */
const dogSearchQuery = (
  search: () => DogListSearch,
  queryKey: (search: DogListSearch) => readonly unknown[],
  pages: ReturnType<typeof pagedDogs>,
  loadedKey: () => readonly unknown[],
) =>
  withMergedDogDrafts(
    createQuery(() => ({
      queryKey: queryKey(search()),
      queryFn: () => pages.first(queryKey(search()), search()),
      networkMode: "always" as const,
      enabled: Boolean(search().name || search().country),
      placeholderData: (previousDogs: Dog[] | undefined) =>
        previousDogs ?? queryClient.getQueryData<Dog[]>(loadedKey()) ?? [],
    })),
  );

export const useDogsSearch = (search: () => DogListSearch) =>
  dogSearchQuery(search, getDogsSearchQueryKey, myDogsSearch, getDogsQueryKey);

export const useAllDogsSearch = (term: () => string) =>
  dogSearchQuery(
    () => allDogsSearchOf(term()),
    (search) => getAllDogsSearchQueryKey(search.name ?? ""),
    allDogsSearch,
    getAllDogsQueryKey,
  );

const fetchDogs = () =>
  fetchWithOfflineSnapshot(DOGS_SNAPSHOT_ID, refreshDogsSnapshot);

const refreshAllDogsSnapshot = () => allDogs.first(getAllDogsQueryKey());

const fetchAllDogs = () =>
  fetchWithOfflineSnapshot(ALL_DOGS_SNAPSHOT_ID, refreshAllDogsSnapshot);

const refreshOwnedDogsSnapshot = async () => {
  const dogs = (
    await rawRequest<DogPageDTO>({
      path: "/secured/dogs?owned=true",
    })
  ).items;

  queryClient.setQueryData(getOwnedDogsQueryKey(), dogs);

  return dogs;
};

const fetchOwnedDogs = () =>
  fetchWithOfflineSnapshot(OWNED_DOGS_SNAPSHOT_ID, refreshOwnedDogsSnapshot);

const createDogsQuery = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchDogs,
    queryKey: ["dogs"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  } as any);

export const prefetchDogs = (options?: TanstackCreateQuery) => {
  const dogsQuery = defineQuery({
    fetcher: fetchDogs,
    queryKey: ["dogs"] as const,
  });
  const { queryFn, queryKey } = dogsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

const withMergedDogDrafts = <T extends { data?: Dog[] }>(dogs: T): T =>
  new Proxy(dogs, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergeDogsWithDrafts(target.data ?? []);
      }

      return Reflect.get(target, property, receiver);
    },
  });

export const useDogs = (options?: TanstackCreateQuery) =>
  withMergedDogDrafts(createDogsQuery(options));

const createAllDogsQuery = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchAllDogs,
    queryKey: ["dogs", "all"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    get enabled() {
      return options?.enabled ? options.enabled() : true;
    },
  } as any);

export const useAllDogs = (options?: TanstackCreateQuery) =>
  withMergedDogDrafts(createAllDogsQuery(options));

export const prefetchOwnedDogs = (options?: TanstackCreateQuery) => {
  const ownedDogsQuery = defineQuery({
    fetcher: fetchOwnedDogs,
    queryKey: ["dogs", "owned"] as const,
  });
  const { queryFn, queryKey } = ownedDogsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

const createOwnedDogsQuery = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchOwnedDogs,
    queryKey: ["dogs", "owned"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    get enabled() {
      return options?.enabled ? options.enabled() : true;
    },
  } as any);

export const useOwnedDogs = (options?: TanstackCreateQuery) =>
  withMergedDogDrafts(createOwnedDogsQuery(options));

const toCreateDogRequest = (draftDog: Dog): CreateDogRequestDTO => ({
  identification: draftDog.identification,
  name: draftDog.name,
  image: draftDog.image,
  breed: draftDog.breed.id,
  origin: draftDog.origin,
  license: draftDog.license,
  owner: draftDog.owner,
  handler: draftDog.handler,
  team: draftDog.team,
  country: draftDog.country.id,
  sex: draftDog.sex,
  withersCm: draftDog.withersCm,
  threeFciGenerationsConfirmed: draftDog.threeFciGenerationsConfirmed,
});

export const createDog = (draftDog: Dog, onConflict?: () => void) => {
  const previousDogs = getVisibleDogs();

  applyDogUpsert(draftDog);

  void (async () => {
    await commitDogMutation({
      entityId: draftDog.identification,
      method: "POST",
      onConflict,
      payload: toCreateDogRequest(draftDog),
      rollbackPayload: await createDogRollbackPayload(
        draftDog.identification,
        null,
        previousDogs,
      ),
      url: "/secured/dogs",
    });
  })();

  return draftDog;
};

const updateDogProjection = (
  existingDog: Dog,
  payload: UpdateDogRequestDTO,
): Dog => ({
  ...existingDog,
  ...payload,
  breed: getCachedBreeds()?.find((breed) => breed.id === payload.breed) ?? {
    ...existingDog.breed,
    id: payload.breed,
  },
  country: getCachedCountries()?.find(
    (country) => country.id === payload.country,
  ) ?? { ...existingDog.country, id: payload.country },
});

export const updateDog = (id: string, payload: UpdateDogRequestDTO) => {
  const previousDogs = getVisibleDogs();
  const previousDog =
    previousDogs.find((dog) => dog.identification === id) ?? null;

  if (!previousDog) {
    throw new Error(`Dog ${id} not found`);
  }

  const draftDog = updateDogProjection(previousDog, payload);

  applyDogUpsert(draftDog);

  void (async () => {
    await commitDogMutation({
      entityId: id,
      method: "PUT",
      payload,
      rollbackPayload: await createDogRollbackPayload(
        id,
        previousDog,
        previousDogs,
      ),
      url: `/secured/dogs/${id}`,
    });
  })();

  return draftDog;
};

export const deleteDog = (id: string) => {
  const previousDogs = getVisibleDogs();
  const previousDog =
    previousDogs.find((dog) => dog.identification === id) ?? null;

  applyDogRemoval(id);

  void (async () => {
    await commitDogMutation({
      entityId: id,
      method: "DELETE",
      rollbackPayload: await createDogRollbackPayload(
        id,
        previousDog,
        previousDogs,
      ),
      url: `/secured/dogs/${id}`,
    });
  })();
};
