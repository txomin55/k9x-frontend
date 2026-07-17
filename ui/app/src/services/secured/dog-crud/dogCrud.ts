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
  saveDogsSnapshot
} from "./dogCrudOfflineUtils";
import type { CreateDogRequestDTO, Dog, UpdateDogRequestDTO } from "./dogCrud.types";
import {
  ALL_DOGS_SNAPSHOT_ID,
  DOGS_SNAPSHOT_ID,
  OWNED_DOGS_SNAPSHOT_ID,
  getAllDogsQueryKey,
  getDogsQueryKey,
  getOwnedDogsQueryKey,
} from "./dogCrudConstants";
import { mergeDogsWithDrafts } from "./dogDraftStore";
import { getCachedCountries } from "@/services/secured/country-crud/countryCrud";
import { getCachedBreeds } from "@/services/secured/breed-crud/breedCrud";

const refreshDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/secured/dogs?owned=true&created=true",
  });

  await saveDogsSnapshot(dogs);
  queryClient.setQueryData(getDogsQueryKey(), dogs);

  return dogs;
};

const fetchDogs = () =>
  fetchWithOfflineSnapshot(DOGS_SNAPSHOT_ID, refreshDogsSnapshot);

const refreshAllDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/secured/dogs",
  });

  queryClient.setQueryData(getAllDogsQueryKey(), dogs);

  return dogs;
};

const fetchAllDogs = () =>
  fetchWithOfflineSnapshot(ALL_DOGS_SNAPSHOT_ID, refreshAllDogsSnapshot);

const refreshOwnedDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/secured/dogs?owned=true",
  });

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

export const prefetchAllDogs = (options?: TanstackCreateQuery) => {
  const allDogsQuery = defineQuery({
    fetcher: fetchAllDogs,
    queryKey: ["dogs", "all"] as const,
  });
  const { queryFn, queryKey } = allDogsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

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
  id: draftDog.id,
  name: draftDog.name,
  image: draftDog.image,
  breed: draftDog.breed.id,
  identity: draftDog.identity,
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
      entityId: draftDog.id,
      method: "POST",
      onConflict,
      payload: toCreateDogRequest(draftDog),
      rollbackPayload: await createDogRollbackPayload(
        draftDog.id,
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
  breed:
    getCachedBreeds()?.find((breed) => breed.id === payload.breed) ??
    { ...existingDog.breed, id: payload.breed },
  country:
    getCachedCountries()?.find((country) => country.id === payload.country) ??
    { ...existingDog.country, id: payload.country },
});

export const updateDog = (id: string, payload: UpdateDogRequestDTO) => {
  const previousDogs = getVisibleDogs();
  const previousDog = previousDogs.find((dog) => dog.id === id) ?? null;

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
  const previousDog = previousDogs.find((dog) => dog.id === id) ?? null;

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
