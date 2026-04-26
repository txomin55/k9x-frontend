import { LOCAL_FIRST_STORE_NAMES, localFirstDatabase } from "@/utils/local-first/storage/localFirstDatabase";
import { shouldPersistLocalFirstData } from "@/utils/local-first/localFirstPolicy";
import type { PendingTask, PendingTaskMethod } from "@/utils/local-first/pending_tasks/pendingTasks.types";

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

const shouldAccessPendingTasksStore = (options?: {
  skipPersistenceCheck?: boolean;
}) => options?.skipPersistenceCheck || shouldPersistLocalFirstData();

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

export const enqueuePendingTask = (
  task: PendingTask,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) {
    return Promise.resolve(task.id);
  }

  return pendingTasksTable.put(toSerializable(task));
};

export const getPendingTasksCount = async (options?: {
  skipPersistenceCheck?: boolean;
}) => {
  if (!shouldAccessPendingTasksStore(options)) return 0;

  return pendingTasksTable.count();
};

export const getRetryablePendingTasks = async (
  processingStaleMs: number,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) return [];

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
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) return;

  const existingTask = await pendingTasksTable.get(id);
  if (!existingTask) return;
  await pendingTasksTable.put(toSerializable(updater(existingTask)));
};

export const removePendingTask = (
  id: string,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) {
    return Promise.resolve();
  }

  return pendingTasksTable.delete(id);
};
