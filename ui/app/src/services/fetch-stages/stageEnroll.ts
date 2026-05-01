import type {
  EnrollStageEventRequest,
  StageDetail,
  StageEnrollRollbackPayload,
  StageSummary,
} from "@/services/fetch-stages/fetchStages.types";
import {
  getStageByIdQueryKey,
  getStagesQueryKey,
} from "@/services/fetch-stages/fetchStages";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { shouldQueueOfflineMutation } from "@/utils/local-first/localFirstPolicy";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTask,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  type PendingTaskHandler,
  processPendingTasks,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";

const STAGES_SNAPSHOT_ID = "stages";
const getStageSnapshotId = (stageId: string) => `stage:${stageId}`;

const buildNextStage = (
  stage: StageDetail,
  payload: EnrollStageEventRequest,
): StageDetail => ({
  ...stage,
  events: stage.events.map((event) => {
    if (String(event.id) !== String(payload.eventId)) {
      return event;
    }

    const nextCompetitor = {
      country: payload.country,
      dogId: payload.dogId,
      identity: payload.identifier,
      owner: payload.owner,
      team: payload.team,
    };
    const existingIndex = event.competitors.findIndex(
      (competitor) => String(competitor?.dogId) === String(payload.dogId),
    );

    return {
      ...event,
      competitors:
        existingIndex === -1
          ? [...event.competitors, nextCompetitor]
          : event.competitors.map((competitor, index) =>
              index === existingIndex ? nextCompetitor : competitor,
            ),
    };
  }),
});

const buildNextStagesSummary = (
  stages: StageSummary[],
  payload: EnrollStageEventRequest,
  nextStage: StageDetail,
): StageSummary[] =>
  stages.map((stage) => {
    if (String(stage.id) !== String(payload.stageId)) {
      return stage;
    }

    return {
      ...stage,
      events: stage.events.map((event) => {
        if (String(event.id) !== String(payload.eventId)) {
          return event;
        }

        const nextEvent = nextStage.events.find(
          (stageEvent) => String(stageEvent.id) === String(payload.eventId),
        );

        return {
          ...event,
          competitors: nextEvent?.competitors.length ?? event.competitors,
        };
      }),
    };
  });

const applyOptimisticEnroll = async (payload: EnrollStageEventRequest) => {
  const previousStage = queryClient.getQueryData<StageDetail>(
    getStageByIdQueryKey(payload.stageId),
  );

  if (!previousStage) {
    throw new Error(`Stage ${payload.stageId} not found in cache`);
  }

  const nextStage = buildNextStage(previousStage, payload);

  queryClient.setQueryData(getStageByIdQueryKey(payload.stageId), nextStage);
  await saveQuerySnapshot(getStageSnapshotId(payload.stageId), nextStage);

  const previousStages =
    queryClient.getQueryData<StageSummary[]>(getStagesQueryKey());

  if (previousStages) {
    const nextStages = buildNextStagesSummary(
      previousStages,
      payload,
      nextStage,
    );
    queryClient.setQueryData(getStagesQueryKey(), nextStages);
    await saveQuerySnapshot(STAGES_SNAPSHOT_ID, nextStages);
  }
};

const rollbackStageEnroll = async (
  rollbackPayload: StageEnrollRollbackPayload,
) => {
  if (rollbackPayload.previousStage) {
    queryClient.setQueryData(
      getStageByIdQueryKey(rollbackPayload.stageId),
      rollbackPayload.previousStage,
    );
    await saveQuerySnapshot(
      getStageSnapshotId(rollbackPayload.stageId),
      rollbackPayload.previousStage,
    );
  } else {
    queryClient.setQueryData(
      getStageByIdQueryKey(rollbackPayload.stageId),
      undefined,
    );
    await removeQuerySnapshot(getStageSnapshotId(rollbackPayload.stageId));
  }

  if (rollbackPayload.previousStages) {
    queryClient.setQueryData(
      getStagesQueryKey(),
      rollbackPayload.previousStages,
    );
    await saveQuerySnapshot(STAGES_SNAPSHOT_ID, rollbackPayload.previousStages);
  } else {
    queryClient.setQueryData(getStagesQueryKey(), undefined);
    await removeQuerySnapshot(STAGES_SNAPSHOT_ID);
  }
};

const isStageEnrollRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is StageEnrollRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "stageId" in rollbackPayload;

const rollbackStageEnrollTask = async (task: PendingTask) => {
  if (!isStageEnrollRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackStageEnroll(task.rollbackPayload);
};

const stageEnrollPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackStageEnrollTask,
};

registerPendingTaskHandler("stage-enroll", stageEnrollPendingTaskHandler);

const createRollbackPayload = async (
  stageId: string,
): Promise<StageEnrollRollbackPayload> => ({
  previousStage:
    queryClient.getQueryData<StageDetail>(getStageByIdQueryKey(stageId)) ??
    (await getPersistedQuerySnapshot<StageDetail>(
      getStageSnapshotId(stageId),
    )) ??
    null,
  previousStages:
    queryClient.getQueryData<StageSummary[]>(getStagesQueryKey()) ??
    (await getPersistedQuerySnapshot<StageSummary[]>(STAGES_SNAPSHOT_ID)) ??
    null,
  stageId,
});

export const enrollStageEvent = async (payload: EnrollStageEventRequest) => {
  const rollbackPayload = await createRollbackPayload(payload.stageId);

  await applyOptimisticEnroll(payload);

  if (!shouldQueueOfflineMutation()) {
    try {
      await rawRequest({
        body: payload,
        method: "PUT",
        path: `/stages/${payload.stageId}/events/${payload.eventId}/enroll`,
      });
      return;
    } catch (error) {
      await rollbackStageEnroll(rollbackPayload);
      throw error;
    }
  }

  const timestamp = Date.now();

  await enqueuePendingTask({
    attemptCount: 0,
    entityId: payload.eventId,
    entityType: "stage-enroll",
    id: createPendingTaskId({
      entityId: payload.eventId,
      entityType: "stage-enroll",
      method: "PUT",
      timestamp,
    }),
    method: "PUT",
    payload,
    rollbackPayload,
    status: "pending",
    timestamp,
    updatedAt: timestamp,
    url: `/stages/${payload.stageId}/events/${payload.eventId}/enroll`,
  } satisfies PendingTask);

  void processPendingTasks();
};
