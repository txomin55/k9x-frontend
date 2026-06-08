import {
  applyApiStageRemoval,
  applyApiStageUpsert,
  commitApiStageMutation,
  commitApiStageMutationSuccess,
  createApiStageRollbackPayload,
} from "@/services/secured/stage-crud/stageCrudOfflineUtils";
import { createMemo, getOwner } from "solid-js";
import {
  type CompetitionResponseDTO,
  getCachedCompetitions,
  useCompetition,
} from "@/services/secured/competition-crud/competitionCrud";
import { getVisibleCompetitions } from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import {
  CompetitionStageDetailResponseDTO,
  CreateStageRequestDTO,
  StageEditorModel,
  UpdateStageRequestDTO,
} from "@/services/secured/stage-crud/stageCrud.types";
import { EMPTY_FEDERATION_CONFIGURATION } from "@/services/secured/configurations/configurations.types";

const createId = () => globalThis.crypto.randomUUID();

const mergeApiStageWithPayload = (
  payload: CreateStageRequestDTO | UpdateStageRequestDTO,
  previousStage?: StageEditorModel,
): StageEditorModel => {
  const payloadId = "id" in payload ? payload.id : undefined;
  const payloadCompetitionId =
    "competitionId" in payload ? payload.competitionId : undefined;
  const nextStageId = payloadId ?? previousStage?.id ?? createId();

  return {
    competitionId: payloadCompetitionId ?? previousStage?.competitionId ?? "",
    dateFrom: payload.dateFrom ?? previousStage?.dateFrom ?? 0,
    dateTo: payload.dateTo ?? previousStage?.dateTo ?? 0,
    events: previousStage?.events ?? [],
    id: nextStageId,
    name: payload.name ?? previousStage?.name ?? "",
  };
};

const createDefaultApiStage = (competitionId: string): CreateStageRequestDTO => ({
  competitionId,
  id: createId(),
  name: "--Default stage",
});

export const toApiStage = (
  stage: CompetitionStageDetailResponseDTO,
  competitionId: string,
): StageEditorModel => ({
  competitionId,
  dateFrom: stage.dateFrom,
  dateTo: stage.dateTo,
  events:
    stage.events.map((rawEvent) => {
      const core = {
        competitors: [],
        configuration: {
          federation: EMPTY_FEDERATION_CONFIGURATION,
          id: "",
          name: "",
        },
        discipline: rawEvent.discipline,
        enrollmentDeadline: 0,
        exercises: [],
        id: rawEvent.id,
        judges: [],
        name: rawEvent.name,
        stage: { id: stage.id, name: stage.name },
        status: "",
      };
      return { ...core, obdx: core };
    }),
  id: stage.id ?? "",
  name: stage.name ?? "",
});

const findCachedApiStage = (
  competitions: CompetitionResponseDTO[] | undefined,
  competitionId: string,
  stageId: string,
): StageEditorModel | null => {
  const competition = competitions?.find((entry) => entry.id === competitionId);
  const stage = competition?.stages?.find((entry) => entry.id === stageId);

  if (!stage) return null;

  return toApiStage(stage, competitionId);
};

export const useApiStage = () => {
  const { getCompetition } = useCompetition();
  const getStage = (competitionId: string, id: string) => {
    if (!getOwner()) {
      return () => {
        const cachedStage = findCachedApiStage(
          getCachedCompetitions(),
          competitionId,
          id,
        );

        return cachedStage ?? undefined;
      };
    }

    const competition = getCompetition(competitionId);

    return createMemo(() => {
      const stage = competition()?.stages?.find((entry) => entry.id === id);

      if (!stage) return undefined;

      return toApiStage(stage, competitionId);
    });
  };
  const createApiStage = (payload: CreateStageRequestDTO) => {
    const draftApiStage = mergeApiStageWithPayload(payload);
    const previousCompetitionsFromCache = getVisibleCompetitions();

    applyApiStageUpsert(draftApiStage);

    void (async () => {
      await commitApiStageMutation({
        entityId: draftApiStage.id,
        method: "POST",
        payload: draftApiStage,
        onCommitted: () =>
          commitApiStageMutationSuccess({
            competitionId: draftApiStage.competitionId,
            method: "POST",
            stageId: draftApiStage.id,
          }),
        rollbackPayload: await createApiStageRollbackPayload({
          competitionId: draftApiStage.competitionId,
          entityId: draftApiStage.id,
          previousCompetitionsFromCache,
          previousStage: null,
        }),
        url: "/secured/stages",
      });
    })();
  };

  const updateApiStage = (
    competitionId: string,
    id: string,
    payload: UpdateStageRequestDTO,
  ) => {
    const previousCompetitionsFromCache = getVisibleCompetitions();
    const previousStage = findCachedApiStage(
      previousCompetitionsFromCache,
      competitionId,
      id,
    );

    if (!previousStage) {
      throw new Error(`updateApiStage requires an existing stage ${id}`);
    }

    const nextApiStage = mergeApiStageWithPayload(
      { ...payload, competitionId, id },
      previousStage ?? undefined,
    );

    applyApiStageUpsert(nextApiStage);

    void (async () => {
      await commitApiStageMutation({
        entityId: nextApiStage.id,
        method: "PUT",
        payload: nextApiStage,
        onCommitted: () =>
          commitApiStageMutationSuccess({
            competitionId: nextApiStage.competitionId,
            method: "PUT",
            stageId: nextApiStage.id,
          }),
        rollbackPayload: await createApiStageRollbackPayload({
          competitionId: nextApiStage.competitionId,
          entityId: nextApiStage.id,
          previousCompetitionsFromCache,
          previousStage: previousStage ?? null,
        }),
        url: `/secured/stages/${nextApiStage.id}`,
      });
    })();
  };

  const deleteApiStage = (id: string, competitionId: string) => {
    const previousCompetitionsFromCache = getVisibleCompetitions();
    const previousStage = findCachedApiStage(
      previousCompetitionsFromCache,
      competitionId,
      id,
    );

    applyApiStageRemoval(competitionId, id);

    void (async () => {
      await commitApiStageMutation({
        entityId: id,
        method: "DELETE",
        onCommitted: () =>
          commitApiStageMutationSuccess({
            competitionId,
            method: "DELETE",
            stageId: id,
          }),
        rollbackPayload: await createApiStageRollbackPayload({
          competitionId,
          entityId: id,
          previousCompetitionsFromCache,
          previousStage: previousStage ?? null,
        }),
        url: `/secured/stages/${id}`,
      });
    })();
  };

  return {
    getStage,
    createApiStage,
    createDefaultApiStage,
    deleteApiStage,
    updateApiStage,
  };
};
