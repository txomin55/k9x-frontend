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
import type { CreateDogRequest, Dog, UpdateDogRequest } from "./dogCrud.types";
import { DOGS_SNAPSHOT_ID, getDogsQueryKey } from "./dogCrudConstants";
import { mergeDogsWithDrafts } from "./dogDraftStore";

const refreshDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/secured/dogs",
  });

  await saveDogsSnapshot(dogs);
  queryClient.setQueryData(getDogsQueryKey(), dogs);

  return dogs;
};

const fetchDogs = () =>
  fetchWithOfflineSnapshot(DOGS_SNAPSHOT_ID, refreshDogsSnapshot);

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

const mergeDogWithPayload = (
  payload: CreateDogRequest,
  existingDog?: Dog,
): Dog => ({
  id: payload.id ?? existingDog?.id ?? globalThis.crypto.randomUUID(),
  name: payload.name ?? existingDog?.name ?? "",
  image: payload.image ?? existingDog?.image ?? "",
  breed: payload.breed ?? existingDog?.breed ?? "",
  identifier: payload.identifier ?? existingDog?.identifier,
  owner: payload.owner ?? existingDog?.owner,
  team: payload.team ?? existingDog?.team,
  country: payload.country ?? existingDog?.country,
  owned: payload.owned ?? existingDog?.owned,
  creator: existingDog?.creator ?? "",
});

export const createDog = (payload: CreateDogRequest) => {
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
  payload: UpdateDogRequest,
): Dog => ({
  ...existingDog,
  ...payload,
});

export const updateDog = (id: string, payload: UpdateDogRequest) => {
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
