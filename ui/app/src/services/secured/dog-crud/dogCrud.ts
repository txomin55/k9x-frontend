import { createMemo } from "solid-js";
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
  getAllDogsQueryKey,
  getDogsQueryKey,
} from "./dogCrudConstants";
import { mergeDogsWithDrafts } from "./dogDraftStore";

const refreshDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/secured/dogs?onlyOwned=true",
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

export const useDogs = (options?: TanstackCreateQuery) => {
  const dogs = createDogsQuery(options);
  const mergedData = createMemo(() => mergeDogsWithDrafts(dogs.data ?? []));

  return new Proxy(dogs, {
    get(target, property, receiver) {
      if (property === "data") {
        return mergedData();
      }

      return Reflect.get(target, property, receiver);
    },
  });
};

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

export const useAllDogs = (options?: TanstackCreateQuery) =>
  defineQuery({
    fetcher: fetchAllDogs,
    queryKey: ["dogs", "all"] as const,
  }).useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  } as any);

const mergeDogWithPayload = (payload: CreateDogRequestDTO): Dog => ({
  id: payload.id,
  name: payload.name,
  image: payload.image,
  breed: payload.breed,
  identifier: payload.identifier,
  owner: payload.owner,
  team: payload.team,
  country: payload.country,
  owned: payload.owned,
});

export const createDog = (payload: CreateDogRequestDTO) => {
  const previousDogs = getVisibleDogs();
  const draftDog = mergeDogWithPayload(payload);

  applyDogUpsert(draftDog);

  void (async () => {
    await commitDogMutation({
      entityId: draftDog.id,
      method: "POST",
      payload,
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
