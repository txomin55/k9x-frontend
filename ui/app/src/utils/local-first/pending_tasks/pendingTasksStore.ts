import { LOCAL_FIRST_STORE_NAMES, getLocalFirstTable } from "@/utils/local-first/storage/localFirstDatabase";
import { shouldPersistLocalFirstData } from "@/utils/local-first/localFirstPolicy";
import type { PendingTask, PendingTaskMethod } from "@/utils/local-first/pending_tasks/pendingTasks.types";

export type {
  PendingTask,
  PendingTaskMethod,
  PendingTaskStatus,
} from "@/utils/local-first/pending_tasks/pendingTasks.types";

const toSerializable = <TData>(value: TData): TData =>
  JSON.parse(JSON.stringify(value)) as TData;

const getPendingTasksTable = () =>
  getLocalFirstTable<PendingTask, string>(
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

export const enqueuePendingTask = async (
  task: PendingTask,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) {
    return task.id;
  }

  const pendingTasksTable = await getPendingTasksTable();
  return pendingTasksTable.put(toSerializable(task));
};

export const getPendingTasksCount = async (options?: {
  skipPersistenceCheck?: boolean;
}) => {
  if (!shouldAccessPendingTasksStore(options)) return 0;

  const pendingTasksTable = await getPendingTasksTable();
  return pendingTasksTable.count();
};

export const getRetryablePendingTasks = async (
  processingStaleMs: number,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) return [];

  const pendingTasksTable = await getPendingTasksTable();
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

  const pendingTasksTable = await getPendingTasksTable();
  const existingTask = await pendingTasksTable.get(id);
  if (!existingTask) return;
  await pendingTasksTable.put(toSerializable(updater(existingTask)));
};

export const removePendingTask = async (
  id: string,
  options?: {
    skipPersistenceCheck?: boolean;
  },
) => {
  if (!shouldAccessPendingTasksStore(options)) {
    return;
  }

  const pendingTasksTable = await getPendingTasksTable();
  return pendingTasksTable.delete(id);
};
