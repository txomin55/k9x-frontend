import { shouldQueueOfflineMutation } from "@/utils/local-first/localFirstPolicy";
import {
  createSerializableRequest,
  HttpRequestError,
  rawRequest,
} from "@/utils/http/client";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTask,
  type PendingTaskMethod
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import { processPendingTasks } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import { requestPendingTasksBackgroundSync } from "@/utils/service-worker/pending_tasks/backgroundSync";
import { showToast } from "@/stores/toast/toast";

export const commitOptimisticMutation = async <TRollbackPayload>({
  entityId,
  entityType,
  method,
  onCommitted,
  onConflict,
  payload,
  rollbackPayload,
  rollback,
  url,
}: {
  entityId: string;
  entityType: string;
  method: PendingTaskMethod;
  onCommitted?: () => Promise<void> | void;
  onConflict?: () => void;
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
      await onCommitted?.();
      return;
    } catch (error) {
      await rollback(rollbackPayload);

      if (error instanceof HttpRequestError) {
        if (error.status === 409 && onConflict) {
          onConflict();
          return;
        }

        showToast(error.message);
        return;
      }

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
    request: createSerializableRequest({
      body: method === "DELETE" ? undefined : payload,
      method,
      path: url,
    }),
    rollbackPayload,
    status: "pending",
    timestamp,
    updatedAt: timestamp,
    url,
  } satisfies PendingTask);

  void requestPendingTasksBackgroundSync().catch(() => {});
  void processPendingTasks();
};
