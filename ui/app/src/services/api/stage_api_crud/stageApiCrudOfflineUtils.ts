import type {
  ApiStage,
  ApiStageRollbackPayload,
  Competition,
  Stage as CompetitionStage
} from "@/services/api/competition_crud/competitionCrudTypes";
import {
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot
} from "@/services/api/competition_crud/competitionCrudOfflineUtils";
import { type Competitions, getCompetitionsQueryKey } from "@/services/api/competition_crud/competitionCrud";
import {
  type PendingTaskHandler,
  processPendingTasks,
  registerPendingTaskHandler
} from "@/utils/local_first/pending_tasks/pendingTasksRunner";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTask,
  type PendingTaskMethod
} from "@/utils/local_first/pending_tasks/pendingTasksStore";
import { queryClient } from "@/utils/http/query-client";

const toCompetitionDetailStage = (stage: ApiStage): CompetitionStage => ({
  dateFrom: stage.dateFrom,
  dateTo: stage.dateTo,
  events: stage.events,
  id: stage.id,
  name: stage.name,
});

const buildNextCompetitionDetail = (
  competition: Competition,
  stage: ApiStage,
): Competition => {
  const nextStage = toCompetitionDetailStage(stage);
  const previousStages = competition.stages ?? [];
  const existingIndex = previousStages.findIndex(
    ({ id }) => String(id) === String(stage.id),
  );

  return {
    ...competition,
    stages:
      existingIndex === -1
        ? [...previousStages, nextStage]
        : previousStages.map((previousStage) =>
            String(previousStage.id) === String(stage.id)
              ? nextStage
              : previousStage,
          ),
  };
};

const buildCompetitionDetailWithoutStage = (
  competition: Competition,
  stageId: string,
): Competition => ({
  ...competition,
  stages: (competition.stages ?? []).filter(
    ({ id }) => String(id) !== String(stageId),
  ),
});

const buildNextCompetitionsList = (
  competitions: Competitions[],
  apiStage: ApiStage,
): Competitions[] =>
  competitions.map((competition) => {
    if (String(competition.id) !== String(apiStage.competitionId)) {
      return competition;
    }
    return buildNextCompetitionDetail(competition, apiStage);
  });

const buildCompetitionsListWithoutStage = (
  competitions: Competitions[],
  competitionId: string,
  stageId: string,
): Competitions[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildCompetitionDetailWithoutStage(competition, stageId)
      : competition,
  );

const removeApiStageFromCompetitionCache = (
  competitionId: string,
  stageId: string,
) => {
  queryClient.setQueryData<Competitions[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) =>
      previousCompetitions
        ? buildCompetitionsListWithoutStage(
            previousCompetitions,
            competitionId,
            stageId,
          )
        : previousCompetitions,
  );
};

const persistApiStageCompetitionSnapshot = async (apiStage: ApiStage) => {
  const cachedCompetitions = queryClient.getQueryData<Competitions[]>(
    getCompetitionsQueryKey(),
  );
  const previousCompetitions =
    cachedCompetitions ?? (await readCompetitionsSnapshot()) ?? [];
  const parentCompetition = previousCompetitions.find(
    (competition) => String(competition.id) === String(apiStage.competitionId),
  );

  if (!parentCompetition) {
    return;
  }

  const nextCompetitions = buildNextCompetitionsList(
    previousCompetitions,
    apiStage,
  );

  queryClient.setQueryData(getCompetitionsQueryKey(), nextCompetitions);
  await saveCompetitionsSnapshot(nextCompetitions);
};

const removeApiStageFromCompetitionSnapshot = async (
  competitionId: string,
  stageId: string,
) => {
  const cachedCompetitions = queryClient.getQueryData<Competitions[]>(
    getCompetitionsQueryKey(),
  );
  const previousCompetitions =
    cachedCompetitions ?? (await readCompetitionsSnapshot()) ?? [];
  const nextCompetitions = buildCompetitionsListWithoutStage(
    previousCompetitions,
    competitionId,
    stageId,
  );

  queryClient.setQueryData(getCompetitionsQueryKey(), nextCompetitions);
  await saveCompetitionsSnapshot(nextCompetitions);
};

export const createApiStageRollbackPayload = async ({
  competitionId,
  entityId,
  previousCompetitionsFromCache,
  previousStage,
}: {
  competitionId: string;
  entityId: string;
  previousCompetitionsFromCache?: Competitions[];
  previousStage: ApiStage | null;
}): Promise<ApiStageRollbackPayload> => ({
  competitionId,
  entityId,
  previousCompetition: null,
  previousCompetitions:
    previousCompetitionsFromCache ?? (await readCompetitionsSnapshot()) ?? null,
  previousStage,
});

export const queueApiStageMutation = async ({
  entityId,
  method,
  payload,
  rollbackPayload,
  url,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  rollbackPayload: ApiStageRollbackPayload;
  url: string;
}) => {
  const timestamp = Date.now();

  await enqueuePendingTask({
    attemptCount: 0,
    entityId,
    entityType: "stage",
    id: createPendingTaskId({
      entityId,
      entityType: "stage",
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
  });

  void processPendingTasks();
};

const isApiStageRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is ApiStageRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "competitionId" in rollbackPayload &&
  "entityId" in rollbackPayload;

const rollbackApiStageTask = async (task: PendingTask) => {
  if (!isApiStageRollbackPayload(task.rollbackPayload)) {
    return;
  }

  const rollbackPayload = task.rollbackPayload;

  if (rollbackPayload.previousCompetitions) {
    await saveCompetitionsSnapshot(rollbackPayload.previousCompetitions);
    queryClient.setQueryData(
      getCompetitionsQueryKey(),
      rollbackPayload.previousCompetitions,
    );
  } else {
    queryClient.removeQueries({
      queryKey: getCompetitionsQueryKey(),
      exact: true,
    });
  }
};

const apiStagePendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackApiStageTask,
};

registerPendingTaskHandler("stage", apiStagePendingTaskHandler);

export const applyApiStageUpsert = (apiStage: ApiStage) => {
  void persistApiStageCompetitionSnapshot(apiStage);
};

export const applyApiStageRemoval = (
  competitionId: string,
  stageId: string,
) => {
  removeApiStageFromCompetitionCache(competitionId, stageId);
  void removeApiStageFromCompetitionSnapshot(competitionId, stageId);
};
