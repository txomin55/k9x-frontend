import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import {
  getVisibleCompetitions,
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot,
} from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import { getCompetitionsQueryKey } from "@/services/secured/competition-crud/competitionCrud";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import {
  type PendingTask,
  type PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import {
  clearCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/secured/competition-crud/competitionDraftStore";
import {
  ApiStageRollbackPayload,
  CompetitionStageDetail,
  StageEditorModel,
} from "@/services/secured/stage-crud/stageCrud.types";

const toCompetitionDetailStage = (
  stage: StageEditorModel,
): CompetitionStageDetail => ({
  dateFrom: stage.dateFrom,
  dateTo: stage.dateTo,
  events: stage.events,
  id: stage.id,
  name: stage.name,
});

const buildNextCompetitionDetail = (
  competition: CompetitionResponseDTO,
  stage: StageEditorModel,
): CompetitionResponseDTO => {
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
  competition: CompetitionResponseDTO,
  stageId: string,
): CompetitionResponseDTO => ({
  ...competition,
  stages: (competition.stages ?? []).filter(
    ({ id }) => String(id) !== String(stageId),
  ),
});

const buildNextCompetitionsList = (
  competitions: CompetitionResponseDTO[],
  apiStage: StageEditorModel,
): CompetitionResponseDTO[] =>
  competitions.map((competition) => {
    if (String(competition.id) !== String(apiStage.competitionId)) {
      return competition;
    }
    return buildNextCompetitionDetail(competition, apiStage);
  });

const buildCompetitionsListWithoutStage = (
  competitions: CompetitionResponseDTO[],
  competitionId: string,
  stageId: string,
): CompetitionResponseDTO[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildCompetitionDetailWithoutStage(competition, stageId)
      : competition,
  );

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<CompetitionResponseDTO[]>(getCompetitionsQueryKey()) ??
  [];

const persistApiStageCompetitionSnapshot = async (
  apiStage: StageEditorModel,
) => {
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
  previousCompetitionsFromCache?: CompetitionResponseDTO[];
  previousStage: StageEditorModel | null;
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

export const commitApiStageMutationSuccess = async ({
  competitionId,
  method,
  stageId,
}: {
  competitionId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  stageId: string;
}) => {
  const visibleCompetitions = getVisibleCompetitions();

  if (method === "DELETE") {
    queryClient.setQueryData<CompetitionResponseDTO[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildCompetitionsListWithoutStage(
          previousCompetitions ?? [],
          competitionId,
          stageId,
        ),
    );
  } else if (method === "POST" || method === "PUT") {
    queryClient.setQueryData<CompetitionResponseDTO[]>(
      getCompetitionsQueryKey(),
      visibleCompetitions,
    );
  } else {
    return;
  }

  const nextBaseCompetitions = getBaseCompetitionsFromCache();

  replaceCompetitionDrafts(visibleCompetitions, nextBaseCompetitions);
  await saveCompetitionsSnapshot(nextBaseCompetitions);
};

const commitApiStageTask = async (task: PendingTask) => {
  if (!isApiStageRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await commitApiStageMutationSuccess({
    competitionId: task.rollbackPayload.competitionId,
    method: task.method,
    stageId: task.entityId,
  });
};

const apiStagePendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackApiStageTask,
  onSuccess: commitApiStageTask,
};

registerPendingTaskHandler("stage", apiStagePendingTaskHandler);

export const applyApiStageUpsert = (apiStage: StageEditorModel) => {
  void persistApiStageCompetitionSnapshot(apiStage);
};

export const applyApiStageRemoval = (
  competitionId: string,
  stageId: string,
) => {
  void removeApiStageFromCompetitionSnapshot(competitionId, stageId);
};
