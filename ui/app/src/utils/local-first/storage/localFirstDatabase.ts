import type { Table } from "dexie";
import type Dexie from "dexie";

const DATABASE_NAME = "k9x-local-first";
const DATABASE_VERSION = 3;

export const LOCAL_FIRST_STORE_NAMES = {
  pendingTasks: "pending_tasks",
  querySnapshots: "query_snapshots",
} as const;

type LocalFirstStoreName =
  (typeof LOCAL_FIRST_STORE_NAMES)[keyof typeof LOCAL_FIRST_STORE_NAMES];

let databasePromise: Promise<Dexie> | undefined;

const loadDatabase = async (): Promise<Dexie> => {
  const { default: Dexie } = await import("dexie");
  const database = new Dexie(DATABASE_NAME);

  database.version(DATABASE_VERSION).stores({
    [LOCAL_FIRST_STORE_NAMES.pendingTasks]:
      "id,status,entityId,entityType,timestamp,[status+timestamp]",
    [LOCAL_FIRST_STORE_NAMES.querySnapshots]: "id,updatedAt",
  });

  return database;
};

export const getLocalFirstDatabase = (): Promise<Dexie> => {
  if (!databasePromise) {
    databasePromise = loadDatabase();
  }

  return databasePromise;
};

export const getLocalFirstTable = async <TData, TKey>(
  storeName: LocalFirstStoreName,
): Promise<Table<TData, TKey>> => {
  const database = await getLocalFirstDatabase();
  return database.table<TData, TKey>(storeName);
};

export const clearLocalFirstData = async () => {
  const database = await getLocalFirstDatabase();
  await Promise.all(database.tables.map((table) => table.clear()));
};
