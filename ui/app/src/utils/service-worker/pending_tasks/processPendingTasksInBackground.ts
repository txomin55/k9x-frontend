import {
  getRetryablePendingTasks,
  removePendingTask,
  updatePendingTask,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";

const STALE_PROCESSING_MS = 60 * 1000;

const storeOptions = {
  skipPersistenceCheck: true,
} as const;

export const processPendingTasksInBackground = async () => {
  const tasks = await getRetryablePendingTasks(
    STALE_PROCESSING_MS,
    storeOptions,
  );

  for (const task of tasks) {
    if (!task.request) {
      continue;
    }

    await updatePendingTask(
      task.id,
      (currentTask) => ({
        ...currentTask,
        attemptCount: currentTask.attemptCount + 1,
        status: "processing",
        updatedAt: Date.now(),
      }),
      storeOptions,
    );

    let response: Response;

    try {
      response = await fetch(task.request.url, {
        body: task.request.body,
        headers: task.request.headers,
        method: task.request.method,
      });
    } catch (error) {
      await updatePendingTask(
        task.id,
        (currentTask) => ({
          ...currentTask,
          status: "failed",
          updatedAt: Date.now(),
        }),
        storeOptions,
      );

      throw error;
    }

    if (!response.ok) {
      await removePendingTask(task.id, storeOptions);
      continue;
    }

    await removePendingTask(task.id, storeOptions);
  }
};
