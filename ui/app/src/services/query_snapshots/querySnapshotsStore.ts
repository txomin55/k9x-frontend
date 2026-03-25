const DATABASE_NAME = "k9x-local-first";
const DATABASE_VERSION = 3;
const STORE_NAME = "query_snapshots";
const UPDATED_AT_INDEX = "updatedAt";
const PENDING_TASKS_STORE_NAME = "pending_tasks";
const PENDING_TASKS_STATUS_INDEX = "status";
const PENDING_TASKS_ENTITY_ID_INDEX = "entityId";
const PENDING_TASKS_ENTITY_TYPE_INDEX = "entityType";
const PENDING_TASKS_TIMESTAMP_INDEX = "timestamp";
const PENDING_TASKS_STATUS_TIMESTAMP_INDEX = "status_timestamp";

let databasePromise: Promise<IDBDatabase> | undefined;

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const getQuerySnapshotsDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        const pendingTasksStore = database.objectStoreNames.contains(
          PENDING_TASKS_STORE_NAME,
        )
          ? request.transaction?.objectStore(PENDING_TASKS_STORE_NAME)
          : database.createObjectStore(PENDING_TASKS_STORE_NAME, {
              keyPath: "id",
            });
        const store = database.objectStoreNames.contains(STORE_NAME)
          ? request.transaction?.objectStore(STORE_NAME)
          : database.createObjectStore(STORE_NAME, { keyPath: "id" });

        if (
          pendingTasksStore &&
          !pendingTasksStore.indexNames.contains(PENDING_TASKS_STATUS_INDEX)
        ) {
          pendingTasksStore.createIndex(PENDING_TASKS_STATUS_INDEX, "status", {
            unique: false,
          });
        }

        if (
          pendingTasksStore &&
          !pendingTasksStore.indexNames.contains(PENDING_TASKS_ENTITY_ID_INDEX)
        ) {
          pendingTasksStore.createIndex(
            PENDING_TASKS_ENTITY_ID_INDEX,
            "entityId",
            { unique: false },
          );
        }

        if (
          pendingTasksStore &&
          !pendingTasksStore.indexNames.contains(PENDING_TASKS_ENTITY_TYPE_INDEX)
        ) {
          pendingTasksStore.createIndex(
            PENDING_TASKS_ENTITY_TYPE_INDEX,
            "entityType",
            { unique: false },
          );
        }

        if (
          pendingTasksStore &&
          !pendingTasksStore.indexNames.contains(PENDING_TASKS_TIMESTAMP_INDEX)
        ) {
          pendingTasksStore.createIndex(
            PENDING_TASKS_TIMESTAMP_INDEX,
            "timestamp",
            { unique: false },
          );
        }

        if (
          pendingTasksStore &&
          !pendingTasksStore.indexNames.contains(
            PENDING_TASKS_STATUS_TIMESTAMP_INDEX,
          )
        ) {
          pendingTasksStore.createIndex(
            PENDING_TASKS_STATUS_TIMESTAMP_INDEX,
            ["status", "timestamp"],
            { unique: false },
          );
        }

        if (!store) return;

        if (!store.indexNames.contains(UPDATED_AT_INDEX)) {
          store.createIndex(UPDATED_AT_INDEX, "updatedAt", { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onblocked = () =>
        reject(new Error("IndexedDB upgrade blocked for query_snapshots"));
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
};

const withStore = async <TResult>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TResult> | TResult,
): Promise<TResult> => {
  const database = await getQuerySnapshotsDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

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

export const saveQuerySnapshot = <TData>(id: string, data: TData) =>
  withStore("readwrite", async (store) => {
    await toPromise(
      store.put({
        data: toSerializable(data),
        id,
        updatedAt: Date.now(),
      } satisfies QuerySnapshot<TData>),
    );
  });

export const getQuerySnapshot = <TData>(id: string) =>
  withStore("readonly", async (store) => {
    const snapshot = (await toPromise(store.get(id))) as QuerySnapshot<TData> | undefined;
    return snapshot?.data;
  });

export const removeQuerySnapshot = (id: string) =>
  withStore("readwrite", async (store) => {
    await toPromise(store.delete(id));
  });

export interface QuerySnapshot<TData = unknown> {
  data: TData;
  id: string;
  updatedAt: number;
}
