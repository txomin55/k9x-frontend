import {
  HttpRequestError,
  NetworkRequestError,
  rawRequest,
} from "@/utils/http/client";
import {
  getRetryablePendingTasks,
  removePendingTask,
  updatePendingTask,
} from "./pendingTasksStore";
import type {
  PendingTask,
  PendingTaskHandler,
} from "@/utils/local_first/pending_tasks/pendingTasks.types";

export type { PendingTaskHandler } from "@/utils/local_first/pending_tasks/pendingTasks.types";

const STALE_PROCESSING_MS = 60 * 1000;

let currentRunPromise: Promise<void> | undefined;

const pendingTaskHandlers = new Map<string, PendingTaskHandler>();

const executePendingTask = (task: PendingTask) =>
  rawRequest<unknown>({
    body: task.method === "DELETE" ? undefined : task.payload,
    method: task.method,
    path: task.url,
  });

export const registerPendingTaskHandler = (
  entityType: string,
  handler: PendingTaskHandler,
) => {
  pendingTaskHandlers.set(entityType, handler);

  return () => {
    if (pendingTaskHandlers.get(entityType) === handler) {
      pendingTaskHandlers.delete(entityType);
    }
  };
};

export const processPendingTasks = () => {
  if (currentRunPromise) return currentRunPromise;

  currentRunPromise = (async () => {
    if (!globalThis.navigator.onLine) return;

    const tasks = await getRetryablePendingTasks(STALE_PROCESSING_MS);

    for (const task of tasks) {
      await updatePendingTask(task.id, (currentTask) => ({
        ...currentTask,
        attemptCount: currentTask.attemptCount + 1,
        status: "processing",
        updatedAt: Date.now(),
      }));

      try {
        await executePendingTask(task);
        await removePendingTask(task.id);
      } catch (error) {
        if (error instanceof NetworkRequestError) {
          const networkErrorHandler = pendingTaskHandlers.get(task.entityType);
          await networkErrorHandler?.onNetworkError?.(task, error);
          await updatePendingTask(task.id, (currentTask) => ({
            ...currentTask,
            status: "failed",
            updatedAt: Date.now(),
          }));
          break;
        }

        if (error instanceof HttpRequestError) {
          const httpErrorHandler = pendingTaskHandlers.get(task.entityType);
          await httpErrorHandler?.onHttpError?.(task, error);
          await removePendingTask(task.id);
          continue;
        }

        throw error;
      }
    }
  })().finally(() => {
    currentRunPromise = undefined;
  });

  return currentRunPromise;
};

export const setupPendingTasksProcessing = () => {
  const handleOnline = () => {
    void processPendingTasks();
  };

  void processPendingTasks();
  globalThis.addEventListener("online", handleOnline);

  return () => {
    globalThis.removeEventListener("online", handleOnline);
  };
};
