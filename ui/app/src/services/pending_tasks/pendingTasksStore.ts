import {
  LOCAL_FIRST_STORE_NAMES,
  toRequestPromise,
  withLocalFirstStore,
} from "@/services/storage/localFirstDatabase";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const withPendingTasksStore = <TResult>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<TResult> | TResult,
) =>
  withLocalFirstStore(LOCAL_FIRST_STORE_NAMES.pendingTasks, mode, callback);

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
  withPendingTasksStore("readwrite", async (store) => {
    await toRequestPromise(store.put(toSerializable(task)));
  });

export const getPendingTask = (id: string) =>
  withPendingTasksStore("readonly", (store) => toRequestPromise(store.get(id)));

export const getRetryablePendingTasks = async (processingStaleMs: number) =>
  withPendingTasksStore("readonly", async (store) => {
    const tasks = (await toRequestPromise(store.getAll())) as PendingTask[];
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
  withPendingTasksStore("readwrite", async (store) => {
    const existingTask =
      (await toRequestPromise(store.get(id))) as PendingTask | undefined;
    if (!existingTask) return;
    await toRequestPromise(store.put(toSerializable(updater(existingTask))));
  });

export const removePendingTask = (id: string) =>
  withPendingTasksStore("readwrite", async (store) => {
    await toRequestPromise(store.delete(id));
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
  rollbackPayload?: unknown;
  status: PendingTaskStatus;
  timestamp: number;
  updatedAt: number;
  url: string;
}
