import {
  LOCAL_FIRST_STORE_NAMES,
  localFirstDatabase,
} from "@/services/storage/localFirstDatabase";

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

export const enqueuePendingTask = (task: PendingTask) =>
  pendingTasksTable.put(toSerializable(task));

export const getPendingTask = (id: string) =>
  pendingTasksTable.get(id);

export const getRetryablePendingTasks = async (processingStaleMs: number) =>
  {
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
  const existingTask = await pendingTasksTable.get(id);
  if (!existingTask) return;
  await pendingTasksTable.put(toSerializable(updater(existingTask)));
};

export const removePendingTask = (id: string) =>
  pendingTasksTable.delete(id);

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
