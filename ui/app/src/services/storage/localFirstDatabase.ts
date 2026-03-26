const DATABASE_NAME = "k9x-local-first";
const DATABASE_VERSION = 3;

const PENDING_TASKS_STORE_NAME = "pending_tasks";
const QUERY_SNAPSHOTS_STORE_NAME = "query_snapshots";

let databasePromise: Promise<IDBDatabase> | undefined;

const ensurePendingTasksStore = (
  database: IDBDatabase,
  transaction: IDBTransaction | null,
) => {
  const store = database.objectStoreNames.contains(PENDING_TASKS_STORE_NAME)
    ? transaction?.objectStore(PENDING_TASKS_STORE_NAME)
    : database.createObjectStore(PENDING_TASKS_STORE_NAME, { keyPath: "id" });

  if (!store) return;

  if (!store.indexNames.contains("status")) {
    store.createIndex("status", "status", { unique: false });
  }

  if (!store.indexNames.contains("entityId")) {
    store.createIndex("entityId", "entityId", { unique: false });
  }

  if (!store.indexNames.contains("entityType")) {
    store.createIndex("entityType", "entityType", { unique: false });
  }

  if (!store.indexNames.contains("timestamp")) {
    store.createIndex("timestamp", "timestamp", { unique: false });
  }

  if (!store.indexNames.contains("status_timestamp")) {
    store.createIndex("status_timestamp", ["status", "timestamp"], {
      unique: false,
    });
  }
};

const ensureQuerySnapshotsStore = (
  database: IDBDatabase,
  transaction: IDBTransaction | null,
) => {
  const store = database.objectStoreNames.contains(QUERY_SNAPSHOTS_STORE_NAME)
    ? transaction?.objectStore(QUERY_SNAPSHOTS_STORE_NAME)
    : database.createObjectStore(QUERY_SNAPSHOTS_STORE_NAME, { keyPath: "id" });

  if (!store) return;

  if (!store.indexNames.contains("updatedAt")) {
    store.createIndex("updatedAt", "updatedAt", { unique: false });
  }
};

const getLocalFirstDatabase = () => {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = globalThis.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        const transaction = request.transaction;

        ensurePendingTasksStore(database, transaction);
        ensureQuerySnapshotsStore(database, transaction);
      };

      request.onsuccess = () => resolve(request.result);
      request.onblocked = () =>
        reject(new Error("IndexedDB upgrade blocked for local-first database"));
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
};

export const withLocalFirstStore = async <TResult>(
  storeName: typeof PENDING_TASKS_STORE_NAME | typeof QUERY_SNAPSHOTS_STORE_NAME,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TResult> | TResult,
): Promise<TResult> => {
  const database = await getLocalFirstDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);

    Promise.resolve(callback(store)).then(resolve).catch(reject);
  });
};

export const toRequestPromise = <TResult>(request: IDBRequest<TResult>) =>
  new Promise<TResult>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const LOCAL_FIRST_STORE_NAMES = {
  pendingTasks: PENDING_TASKS_STORE_NAME,
  querySnapshots: QUERY_SNAPSHOTS_STORE_NAME,
} as const;
