import type {
  ApiStage,
  ApiStageRollbackPayload,
  Competition,
  Stage as CompetitionStage
} from "@/services/api/competition_crud/competitionCrudTypes";
import {
  getVisibleCompetitions,
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot
} from "@/services/api/competition_crud/competitionCrudOfflineUtils";
import { type Competitions, getCompetitionsQueryKey } from "@/services/api/competition_crud/competitionCrud";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler
} from "@/utils/local_first/pending_tasks/pendingTasksRunner";
import {
  type PendingTask,
  type PendingTaskMethod
} from "@/utils/local_first/pending_tasks/pendingTasksStore";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local_first/pending_tasks/commitOptimisticMutation";
import {
  clearCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/api/competition_crud/competitionDraftStore";

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

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<Competitions[]>(getCompetitionsQueryKey()) ?? [];

const persistApiStageCompetitionSnapshot = async (apiStage: ApiStage) => {
  const previousCompetitions = getVisibleCompetitions();
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

  const nextCompetition = nextCompetitions.find(
    (competition) => String(competition.id) === String(apiStage.competitionId),
  );

  if (nextCompetition) {
    upsertCompetitionDraft(nextCompetition);
  }

  await saveCompetitionsSnapshot(nextCompetitions);
};

const removeApiStageFromCompetitionSnapshot = async (
  competitionId: string,
  stageId: string,
) => {
  const previousCompetitions = getVisibleCompetitions();
  const nextCompetitions = buildCompetitionsListWithoutStage(
    previousCompetitions,
    competitionId,
    stageId,
  );

  const nextCompetition = nextCompetitions.find(
    (competition) => String(competition.id) === String(competitionId),
  );

  if (nextCompetition) {
    upsertCompetitionDraft(nextCompetition);
  } else {
    clearCompetitionDraft(competitionId);
  }

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

export const commitApiStageMutation = async ({
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
  rollbackPayload: ApiStageRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "stage",
    method,
    onCommitted,
    payload,
    rollback: rollbackApiStagePayload,
    rollbackPayload,
    url,
  });

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

  await rollbackApiStagePayload(task.rollbackPayload);
};

const rollbackApiStagePayload = async (
  rollbackPayload: ApiStageRollbackPayload,
) => {
  if (rollbackPayload.previousCompetitions) {
    await saveCompetitionsSnapshot(rollbackPayload.previousCompetitions);
    replaceCompetitionDrafts(
      rollbackPayload.previousCompetitions,
      getBaseCompetitionsFromCache(),
    );
    return;
  }

  replaceCompetitionDrafts([], getBaseCompetitionsFromCache());
};

const isApiStagePayload = (payload: unknown): payload is ApiStage =>
  typeof payload === "object" &&
  payload !== null &&
  "competitionId" in payload &&
  "id" in payload;

export const commitApiStageMutationSuccess = async ({
  competitionId,
  method,
  payload,
  stageId,
}: {
  competitionId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  stageId: string;
}) => {
  const visibleCompetitions = getVisibleCompetitions();

  if (method === "DELETE") {
    queryClient.setQueryData<Competitions[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildCompetitionsListWithoutStage(
          previousCompetitions ?? [],
          competitionId,
          stageId,
        ),
    );
  } else if (isApiStagePayload(payload)) {
    queryClient.setQueryData<Competitions[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildNextCompetitionsList(previousCompetitions ?? [], payload),
    );
  } else {
    return;
  }

  replaceCompetitionDrafts(visibleCompetitions, getBaseCompetitionsFromCache());
  await saveCompetitionsSnapshot(getVisibleCompetitions());
};

const commitApiStageTask = async (task: PendingTask) => {
  if (!isApiStageRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await commitApiStageMutationSuccess({
    competitionId: task.rollbackPayload.competitionId,
    method: task.method,
    payload: task.payload,
    stageId: task.entityId,
  });
};

const apiStagePendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackApiStageTask,
  onSuccess: commitApiStageTask,
};

registerPendingTaskHandler("stage", apiStagePendingTaskHandler);

export const applyApiStageUpsert = (apiStage: ApiStage) => {
  void persistApiStageCompetitionSnapshot(apiStage);
};

export const applyApiStageRemoval = (
  competitionId: string,
  stageId: string,
) => {
  void removeApiStageFromCompetitionSnapshot(competitionId, stageId);
};
