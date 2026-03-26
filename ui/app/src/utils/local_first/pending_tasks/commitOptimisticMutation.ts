import { shouldQueueOfflineMutation } from "@/utils/local_first/localFirstPolicy";
import { rawRequest } from "@/utils/http/client";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTask,
  type PendingTaskMethod,
} from "@/utils/local_first/pending_tasks/pendingTasksStore";
import { processPendingTasks } from "@/utils/local_first/pending_tasks/pendingTasksRunner";

export const commitOptimisticMutation = async <TRollbackPayload>({
  entityId,
  entityType,
  method,
  payload,
  rollbackPayload,
  rollback,
  url,
}: {
  entityId: string;
  entityType: string;
  method: PendingTaskMethod;
  payload?: unknown;
  rollbackPayload: TRollbackPayload;
  rollback: (payload: TRollbackPayload) => Promise<void>;
  url: string;
}) => {
  if (!shouldQueueOfflineMutation()) {
    try {
      await rawRequest({
        body: method === "DELETE" ? undefined : payload,
        method,
        path: url,
      });
      return;
    } catch (error) {
      await rollback(rollbackPayload);
      throw error;
    }
  }

  const timestamp = Date.now();

  await enqueuePendingTask({
    attemptCount: 0,
    entityId,
    entityType,
    id: createPendingTaskId({
      entityId,
      entityType,
      method,
      timestamp,
    }),
    method,
    payload,
    rollbackPayload,
    status: "pending",
    timestamp,
    updatedAt: timestamp,
    url,
  } satisfies PendingTask);

  void processPendingTasks();
};
