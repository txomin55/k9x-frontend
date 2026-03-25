const DATABASE_NAME = "k9x-local-first";
const DATABASE_VERSION = 3;
const STORE_NAME = "pending_tasks";
const STATUS_INDEX = "status";
const ENTITY_ID_INDEX = "entityId";
const ENTITY_TYPE_INDEX = "entityType";
const TIMESTAMP_INDEX = "timestamp";
const STATUS_TIMESTAMP_INDEX = "status_timestamp";
const QUERY_SNAPSHOTS_STORE_NAME = "query_snapshots";
const QUERY_SNAPSHOTS_UPDATED_AT_INDEX = "updatedAt";

let databasePromise: Promise<IDBDatabase> | undefined;

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const getPendingTasksDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        const querySnapshotsStore = database.objectStoreNames.contains(
          QUERY_SNAPSHOTS_STORE_NAME,
        )
          ? request.transaction?.objectStore(QUERY_SNAPSHOTS_STORE_NAME)
          : database.createObjectStore(QUERY_SNAPSHOTS_STORE_NAME, {
              keyPath: "id",
            });
        const store = database.objectStoreNames.contains(STORE_NAME)
          ? request.transaction?.objectStore(STORE_NAME)
          : database.createObjectStore(STORE_NAME, { keyPath: "id" });

        if (
          querySnapshotsStore &&
          !querySnapshotsStore.indexNames.contains(QUERY_SNAPSHOTS_UPDATED_AT_INDEX)
        ) {
          querySnapshotsStore.createIndex(
            QUERY_SNAPSHOTS_UPDATED_AT_INDEX,
            "updatedAt",
            { unique: false },
          );
        }

        if (!store) return;

        if (!store.indexNames.contains(STATUS_INDEX)) {
          store.createIndex(STATUS_INDEX, "status", { unique: false });
        }

        if (!store.indexNames.contains(ENTITY_ID_INDEX)) {
          store.createIndex(ENTITY_ID_INDEX, "entityId", { unique: false });
        }

        if (!store.indexNames.contains(ENTITY_TYPE_INDEX)) {
          store.createIndex(ENTITY_TYPE_INDEX, "entityType", { unique: false });
        }

        if (!store.indexNames.contains(TIMESTAMP_INDEX)) {
          store.createIndex(TIMESTAMP_INDEX, "timestamp", { unique: false });
        }

        if (!store.indexNames.contains(STATUS_TIMESTAMP_INDEX)) {
          store.createIndex(STATUS_TIMESTAMP_INDEX, ["status", "timestamp"], {
            unique: false,
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onblocked = () =>
        reject(new Error("IndexedDB upgrade blocked for pending_tasks"));
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
};

const withStore = async <TResult>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TResult> | TResult,
): Promise<TResult> => {
  const database = await getPendingTasksDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => undefined;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);

    Promise.resolve(callback(store)).then(resolve).catch(reject);
  });
};

const toPromise = <TResult>(request: IDBRequest<TResult>) =>
  new Promise<TResult>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const createPendingTaskId = ({
  entityId,
  entityType,
  method,
  timestamp,
}: {
  entityId: string;
  entityType: string;
  method: PendingTaskMethod;
  timestamp: number;
}) => `${entityId}-${entityType}-${method.toLowerCase()}-${timestamp}`;

export const enqueuePendingTask = (task: PendingTask) =>
  withStore("readwrite", async (store) => {
    await toPromise(store.put(toSerializable(task)));
  });

export const getPendingTask = (id: string) =>
  withStore("readonly", (store) => toPromise(store.get(id)));

export const getRetryablePendingTasks = async (processingStaleMs: number) =>
  withStore("readonly", async (store) => {
    const tasks = (await toPromise(store.getAll())) as PendingTask[];
    const staleProcessingBefore = Date.now() - processingStaleMs;

    return tasks
      .filter((task) => {
        if (task.status === "pending" || task.status === "failed") return true;
        return (
          task.status === "processing" && task.updatedAt <= staleProcessingBefore
        );
      })
      .sort((left, right) => left.timestamp - right.timestamp);
  });

export const updatePendingTask = async (
  id: string,
  updater: (task: PendingTask) => PendingTask,
) =>
  withStore("readwrite", async (store) => {
    const existingTask = (await toPromise(store.get(id))) as PendingTask | undefined;
    if (!existingTask) return;
    await toPromise(store.put(toSerializable(updater(existingTask))));
  });

export const removePendingTask = (id: string) =>
  withStore("readwrite", async (store) => {
    await toPromise(store.delete(id));
  });

export type PendingTaskStatus = "pending" | "processing" | "failed";
export type PendingTaskMethod = "POST" | "PUT" | "DELETE";

export interface PendingTask {
  attemptCount: number;
  entityId: string;
  entityType: string;
  id: string;
  method: PendingTaskMethod;
  payload: unknown;
  status: PendingTaskStatus;
  timestamp: number;
  updatedAt: number;
  url: string;
}
