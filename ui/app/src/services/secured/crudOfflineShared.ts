import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import { type PendingTaskMethod } from "@/utils/local-first/pending_tasks/pendingTasksStore";

export const createCommitEntityMutation =
  <TRollbackPayload>(
    entityType: string,
    rollback: (rollbackPayload: TRollbackPayload) => Promise<void>,
  ) =>
  ({
    entityId,
    method,
    onCommitted,
    payload,
    rollbackPayload,
    url,
  }: {
    entityId: string;
    method: PendingTaskMethod;
    onCommitted?: () => Promise<void> | void;
    payload?: unknown;
    rollbackPayload: TRollbackPayload;
    url: string;
  }) =>
    commitOptimisticMutation({
      entityId,
      entityType,
      method,
      onCommitted,
      payload,
      rollback,
      rollbackPayload,
      url,
    });
