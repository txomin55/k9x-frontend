import Dexie from "dexie";

const DATABASE_NAME = "k9x-local-first";
const DATABASE_VERSION = 3;

export const LOCAL_FIRST_STORE_NAMES = {
  pendingTasks: "pending_tasks",
  querySnapshots: "query_snapshots",
} as const;

export const localFirstDatabase = new Dexie(DATABASE_NAME);

localFirstDatabase.version(DATABASE_VERSION).stores({
  [LOCAL_FIRST_STORE_NAMES.pendingTasks]:
    "id,status,entityId,entityType,timestamp,[status+timestamp]",
  [LOCAL_FIRST_STORE_NAMES.querySnapshots]: "id,updatedAt",
});
