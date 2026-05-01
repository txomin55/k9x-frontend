import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import {
  COLLECTIONS_SNAPSHOT_ID,
  getCollectionByIdQueryKey,
  getCollectionSnapshotId,
} from "@/services/secured/collection-crud/collectionCrudConstants";
import {
  CollectionRequest,
  CollectionRollbackPayload,
  CollectionsRequest,
} from "@/services/secured/collection-crud/collectionCrud.types";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import {
  type PendingTask,
  type PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import {
  mergeCollectionByIdWithDraft,
  replaceCollectionByIdDraft,
  upsertCollectionByIdDraft,
} from "@/services/secured/collection-crud/collectionsDrafStore";

export const saveCollectionsSnapshot = (collections: CollectionsRequest[]) =>
  saveQuerySnapshot(COLLECTIONS_SNAPSHOT_ID, collections);

export const saveCollectionSnapshot = (
  id: string,
  collection: CollectionRequest,
) => saveQuerySnapshot(getCollectionSnapshotId(id), collection);

const getBaseCollectionByIdFromCache = (id: string) =>
  queryClient.getQueryData<CollectionRequest>(getCollectionByIdQueryKey(id));

export const getVisibleCollectionById = (id: string) =>
  mergeCollectionByIdWithDraft(id, getBaseCollectionByIdFromCache(id));

export const readCollectionSnapshot = (id: string) =>
  getPersistedQuerySnapshot<CollectionRequest>(getCollectionSnapshotId(id));

export const createCollectionRollbackPayload = async (
  collectionId: string,
  previousCollectionFromCache?: CollectionRequest | null,
): Promise<CollectionRollbackPayload> => ({
  collectionId,
  previousCollection:
    previousCollectionFromCache ??
    (await readCollectionSnapshot(collectionId)) ??
    null,
});

export const commitCollectionMutation = async ({
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
  rollbackPayload: CollectionRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "collection",
    method,
    onCommitted,
    payload,
    rollback: rollbackCollectionPayload,
    rollbackPayload,
    url,
  });

export const commitCollectionMutationSuccess = async ({
  collectionId,
  method,
}: {
  collectionId: string;
  method: PendingTaskMethod;
}) => {
  const visibleCollection = getVisibleCollectionById(collectionId);

  if (!visibleCollection || method !== "PUT") {
    return;
  }

  queryClient.setQueryData<CollectionRequest>(
    getCollectionByIdQueryKey(collectionId),
    visibleCollection,
  );

  const nextBaseCollection = getBaseCollectionByIdFromCache(collectionId);

  replaceCollectionByIdDraft(
    collectionId,
    visibleCollection,
    nextBaseCollection,
  );
  await saveCollectionSnapshot(
    collectionId,
    nextBaseCollection ?? visibleCollection,
  );
};

const rollbackCollectionPayload = async (
  rollbackPayload: CollectionRollbackPayload,
) => {
  const baseCollection = getBaseCollectionByIdFromCache(
    rollbackPayload.collectionId,
  );

  if (rollbackPayload.previousCollection) {
    queryClient.setQueryData<CollectionRequest>(
      getCollectionByIdQueryKey(rollbackPayload.collectionId),
      rollbackPayload.previousCollection,
    );
    await saveCollectionSnapshot(
      rollbackPayload.collectionId,
      rollbackPayload.previousCollection,
    );
    replaceCollectionByIdDraft(
      rollbackPayload.collectionId,
      rollbackPayload.previousCollection,
      baseCollection,
    );
    return;
  }

  queryClient.setQueryData<CollectionRequest | undefined>(
    getCollectionByIdQueryKey(rollbackPayload.collectionId),
    undefined,
  );
  await removeQuerySnapshot(
    getCollectionSnapshotId(rollbackPayload.collectionId),
  );
  replaceCollectionByIdDraft(
    rollbackPayload.collectionId,
    null,
    baseCollection,
  );
};

const isCollectionRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is CollectionRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "collectionId" in rollbackPayload;

const rollbackCollectionTask = async (task: PendingTask) => {
  if (!isCollectionRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackCollectionPayload(task.rollbackPayload);
};

const commitCollectionTask = async (task: PendingTask) => {
  if (!isCollectionRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await commitCollectionMutationSuccess({
    collectionId: task.rollbackPayload.collectionId,
    method: task.method,
  });
};

const collectionPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackCollectionTask,
  onSuccess: commitCollectionTask,
};

registerPendingTaskHandler("collection", collectionPendingTaskHandler);

export const applyCollectionUpsert = (
  collectionId: string,
  collection: CollectionRequest,
) => {
  queryClient.setQueryData<CollectionRequest>(
    getCollectionByIdQueryKey(collectionId),
    collection,
  );
  upsertCollectionByIdDraft(collectionId, collection);
  void saveCollectionSnapshot(collectionId, collection);
};
