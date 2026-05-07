import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type {
  PendingTask,
  PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import type { Dog, DogRollbackPayload } from "./dogCrud.types";
import {
  mergeDogsWithDrafts,
  removeDogDraft,
  replaceDogDrafts,
  upsertDogDraft,
} from "./dogDraftStore";
import { DOGS_SNAPSHOT_ID, getDogsQueryKey } from "./dogCrudConstants";

const DOG_SNAPSHOT_PREFIX = "dog:";

export const toDogListItem = (dog: Dog, previousDog?: Dog): Dog => ({
  id: dog.id,
  name: dog.name ?? previousDog?.name ?? "",
  image: dog.image ?? previousDog?.image ?? "",
  breed: dog.breed ?? previousDog?.breed ?? "",
  identifier: dog.identifier ?? previousDog?.identifier,
  owner: dog.owner ?? previousDog?.owner,
  team: dog.team ?? previousDog?.team,
  country: dog.country ?? previousDog?.country,
  owned: dog.owned ?? previousDog?.owned,
  creator: dog.creator ?? previousDog?.creator,
});

export const buildNextDogs = (previousDogs: Dog[], dog: Dog) => {
  const nextDog = toDogListItem(
    dog,
    previousDogs.find(({ id }) => id === dog.id),
  );
  const existingIndex = previousDogs.findIndex(({ id }) => id === dog.id);

  return existingIndex === -1
    ? [nextDog, ...previousDogs]
    : previousDogs.map((previousDog) =>
        previousDog.id === dog.id ? nextDog : previousDog,
      );
};

export const buildDogsWithoutEntity = (previousDogs: Dog[], id: string) =>
  previousDogs.filter((dog) => dog.id !== id);

const getBaseDogsFromCache = () =>
  queryClient.getQueryData<Dog[]>(getDogsQueryKey()) ?? [];

export const getVisibleDogs = () => mergeDogsWithDrafts(getBaseDogsFromCache());

const syncDogRemovalToCache = (id: string) => {
  queryClient.setQueryData<Dog[] | undefined>(
    getDogsQueryKey(),
    (previousDogs) => buildDogsWithoutEntity(previousDogs ?? [], id),
  );
};

const syncDogsToCache = (dogs: Dog[]) => {
  queryClient.setQueryData<Dog[]>(getDogsQueryKey(), dogs);
};

export const commitDogMutationSuccess = async ({
  entityId,
  method,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
}) => {
  const visibleDogs = getVisibleDogs();

  if (method === "DELETE") {
    syncDogRemovalToCache(entityId);
  } else if (method === "POST" || method === "PUT") {
    syncDogsToCache(visibleDogs);
  } else {
    return;
  }

  const nextBaseDogs = getBaseDogsFromCache();

  replaceDogDrafts(visibleDogs, nextBaseDogs);
  await saveDogsSnapshot(nextBaseDogs);
};

export const readDogsSnapshot = () =>
  removeQuerySnapshotsByPrefix(DOG_SNAPSHOT_PREFIX).then(() =>
    getPersistedQuerySnapshot<Dog[]>(DOGS_SNAPSHOT_ID),
  );

export const saveDogsSnapshot = (dogs: Dog[]) =>
  removeQuerySnapshotsByPrefix(DOG_SNAPSHOT_PREFIX).then(() =>
    saveQuerySnapshot(DOGS_SNAPSHOT_ID, dogs),
  );

export const createDogRollbackPayload = async (
  entityId: string,
  previousDog: Dog | null,
  previousDogsFromCache?: Dog[],
): Promise<DogRollbackPayload> => ({
  entityId,
  previousDog,
  previousDogs: previousDogsFromCache ?? (await readDogsSnapshot()) ?? null,
});

export const commitDogMutation = async ({
  entityId,
  method,
  onCommitted,
  payload,
  rollbackPayload,
  url,
}: {
  entityId: string;
  method: PendingTaskMethod;
  onCommitted?: () => Promise<void> | void;
  payload?: unknown;
  rollbackPayload: DogRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "dog",
    method,
    onCommitted,
    payload,
    rollback: rollbackDogPayload,
    rollbackPayload,
    url,
  });

const isDogRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is DogRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "entityId" in rollbackPayload;

const rollbackDogTask = async (task: PendingTask) => {
  if (!isDogRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackDogPayload(task.rollbackPayload);
};

const rollbackDogPayload = async (rollbackPayload: DogRollbackPayload) => {
  if (rollbackPayload.previousDogs) {
    await saveDogsSnapshot(rollbackPayload.previousDogs);
    replaceDogDrafts(rollbackPayload.previousDogs, getBaseDogsFromCache());
  } else {
    await removeQuerySnapshot(DOGS_SNAPSHOT_ID);
    replaceDogDrafts([], getBaseDogsFromCache());
  }
};

const commitDogTask = async (task: PendingTask) => {
  await commitDogMutationSuccess({
    entityId: task.entityId,
    method: task.method,
  });
};

const dogPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackDogTask,
  onSuccess: commitDogTask,
};

registerPendingTaskHandler("dog", dogPendingTaskHandler);

export const applyDogUpsert = (dog: Dog) => {
  upsertDogDraft(dog);
  void saveDogsSnapshot(buildNextDogs(getVisibleDogs(), dog));
};

export const applyDogRemoval = (id: string) => {
  removeDogDraft(id);
  void saveDogsSnapshot(buildDogsWithoutEntity(getVisibleDogs(), id));
};
