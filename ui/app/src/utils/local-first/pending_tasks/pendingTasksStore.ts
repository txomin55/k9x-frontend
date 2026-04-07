import {
  LOCAL_FIRST_STORE_NAMES,
  localFirstDatabase,
} from "@/utils/local-first/storage/localFirstDatabase";
import { shouldPersistLocalFirstData } from "@/utils/local-first/localFirstPolicy";
import type {
  PendingTask,
  PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasks.types";

export type {
  PendingTask,
  PendingTaskMethod,
  PendingTaskStatus,
} from "@/utils/local-first/pending_tasks/pendingTasks.types";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const pendingTasksTable = localFirstDatabase.table<PendingTask, string>(
  LOCAL_FIRST_STORE_NAMES.pendingTasks,
);

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

export const enqueuePendingTask = (task: PendingTask) => {
  if (!shouldPersistLocalFirstData()) {
    return Promise.resolve(task.id);
  }

  return pendingTasksTable.put(toSerializable(task));
};

export const getPendingTask = (id: string) => pendingTasksTable.get(id);

export const getRetryablePendingTasks = async (processingStaleMs: number) => {
  if (!shouldPersistLocalFirstData()) return [];

  const tasks = await pendingTasksTable.toArray();
  const staleProcessingBefore = Date.now() - processingStaleMs;

  return tasks
    .filter((task) => {
      if (task.status === "pending" || task.status === "failed") return true;
      return (
        task.status === "processing" && task.updatedAt <= staleProcessingBefore
      );
    })
    .sort((left, right) => left.timestamp - right.timestamp);
};

export const updatePendingTask = async (
  id: string,
  updater: (task: PendingTask) => PendingTask,
) => {
  if (!shouldPersistLocalFirstData()) return;

  const existingTask = await pendingTasksTable.get(id);
  if (!existingTask) return;
  await pendingTasksTable.put(toSerializable(updater(existingTask)));
};

export const removePendingTask = (id: string) => {
  if (!shouldPersistLocalFirstData()) {
    return Promise.resolve();
  }

  return pendingTasksTable.delete(id);
};
