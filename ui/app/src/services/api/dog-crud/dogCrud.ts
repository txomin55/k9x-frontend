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
  saveDogsSnapshot,
} from "./dogCrudOfflineUtils";
import type { CreateDogRequest, Dog } from "./dogCrud.types";
import { DOGS_SNAPSHOT_ID, getDogsQueryKey } from "./dogCrudConstants";
import { mergeDogsWithDrafts } from "./dogDraftStore";

const refreshDogsSnapshot = async () => {
  const dogs = await rawRequest<Dog[]>({
    path: "/api/dogs",
  });

  await saveDogsSnapshot(dogs);
  queryClient.setQueryData(getDogsQueryKey(), dogs);

  return dogs;
};

const fetchDogs = () =>
  fetchWithOfflineSnapshot(DOGS_SNAPSHOT_ID, refreshDogsSnapshot);

const dogsQuery = defineQuery({
  fetcher: fetchDogs,
  queryKey: ["dogs"] as const,
});

const createDogsQuery = (options?: TanstackCreateQuery) =>
  dogsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  } as any);

export const prefetchDogs = (options?: TanstackCreateQuery) => {
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
  const dogs = createDogsQuery(options as any);
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
});

export const getCachedDogs = () =>
  queryClient.getQueryData<Dog[]>(getDogsQueryKey()) ?? [];

export const createDog = (payload: CreateDogRequest) => {
  const previousDogs = getCachedDogs();
  const draftDog = mergeDogWithPayload(payload);

  applyDogUpsert(draftDog);

  void (async () => {
    await commitDogMutation({
      entityId: draftDog.id,
      method: "POST",
      payload: draftDog,
      rollbackPayload: await createDogRollbackPayload(
        draftDog.id,
        null,
        previousDogs,
      ),
      url: "/api/dogs",
    });
  })();

  return draftDog;
};

export const deleteDog = (id: string) => {
  const previousDogs = getCachedDogs();
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
      url: `/api/dogs/${id}`,
    });
  })();
};
