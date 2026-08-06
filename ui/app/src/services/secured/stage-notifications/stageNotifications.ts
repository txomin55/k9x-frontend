import { createCommitEntityMutation } from "@/services/secured/crudOfflineShared";
import { refreshCompetitionsSnapshot } from "@/services/secured/competition-crud/competitionCrud";
import { clearCompetitionDraft } from "@/services/secured/competition-crud/competitionDraftStore";
import type { StageEditorModel } from "@/services/secured/stage-crud/stageCrud.types";
import { applyApiStageUpsert } from "@/services/secured/stage-crud/stageCrudOfflineUtils";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type { PendingTask } from "@/utils/local-first/pending_tasks/pendingTasksStore";

const STAGE_NOTIFICATION_ENTITY_TYPE = "stage-notification";

export interface CreateStageNotificationRequestDTO {
  eventIds: string[];
  content: string;
}

interface StageNotificationRollbackPayload {
  competitionId: string;
  previousStage: StageEditorModel;
}

/**
 * An announcement the server rejects never happened, so the stage is written back with the notification list
 * it had before the optimistic insert.
 */
const rollbackStageNotification = async ({
  previousStage,
}: StageNotificationRollbackPayload) => {
  applyApiStageUpsert(previousStage);
};

/** The server stamps the real timestamp, so the local draft is dropped in favour of a fresh snapshot. */
const settleStageNotification = async (competitionId: string) => {
  await refreshCompetitionsSnapshot();
  clearCompetitionDraft(competitionId);
};

const commitStageNotificationMutation =
  createCommitEntityMutation<StageNotificationRollbackPayload>(
    STAGE_NOTIFICATION_ENTITY_TYPE,
    rollbackStageNotification,
  );

const isStageNotificationRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is StageNotificationRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "previousStage" in rollbackPayload &&
  "competitionId" in rollbackPayload;

const stageNotificationPendingTaskHandler: PendingTaskHandler = {
  onHttpError: async (task: PendingTask) => {
    if (!isStageNotificationRollbackPayload(task.rollbackPayload)) return;

    await rollbackStageNotification(task.rollbackPayload);
  },
  onSuccess: async (task: PendingTask) => {
    if (!isStageNotificationRollbackPayload(task.rollbackPayload)) return;

    await settleStageNotification(task.rollbackPayload.competitionId);
  },
};

registerPendingTaskHandler(
  STAGE_NOTIFICATION_ENTITY_TYPE,
  stageNotificationPendingTaskHandler,
);

/**
 * Sends one announcement to the competitors (and subscribers) of the picked events of a stage. The endpoint
 * takes a list, but the organizer writes one message at a time.
 *
 * <p>Optimistic and offline-first like the rest of the mutations: the notification is written into the cached
 * stage up front so it shows in the notifications tab immediately, the request is queued when offline, and a
 * rejected request — online or once the queue drains — removes it again.
 */
export const createStageNotification = async (
  stage: StageEditorModel,
  notification: CreateStageNotificationRequestDTO,
) => {
  applyApiStageUpsert({
    ...stage,
    notifications: [
      ...stage.notifications,
      { ...notification, timestamp: Date.now() },
    ],
  });

  await commitStageNotificationMutation({
    entityId: stage.id,
    method: "POST",
    onCommitted: () => settleStageNotification(stage.competitionId),
    payload: [notification],
    rollbackPayload: {
      competitionId: stage.competitionId,
      previousStage: stage,
    },
    url: `/secured/stages/${stage.id}/notifications`,
  });
};
