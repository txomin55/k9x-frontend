import {
  applyApiStageRemoval,
  applyApiStageUpsert,
  commitApiStageMutation,
  commitApiStageMutationSuccess,
  createApiStageRollbackPayload,
} from "@/services/secured/stage-crud/stageCrudOfflineUtils";
import { createMemo, getOwner } from "solid-js";
import {
  type CompetitionDetail,
  getCachedCompetitions,
  useCompetition,
} from "@/services/secured/competition-crud/competitionCrud";
import { getVisibleCompetitions } from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import {
  CompetitionStageDetail,
  CreateStageRequest,
  StageEditorModel,
  UpdateStageRequest,
} from "@/services/secured/stage-crud/stageCrud.types";

const createId = () => globalThis.crypto.randomUUID();

const mergeApiStageWithPayload = (
  payload: CreateStageRequest | UpdateStageRequest,
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

const createDefaultApiStage = (competitionId: string): CreateStageRequest => ({
  competitionId,
  id: createId(),
  name: "--Default stage",
});

export const toApiStage = (
  stage: CompetitionStageDetail,
  competitionId: string,
): StageEditorModel => ({
  competitionId,
  dateFrom: stage.dateFrom ?? 0,
  dateTo: stage.dateTo ?? 0,
  events:
    stage.events?.map((event) => ({
      competitors:
        event.competitors?.map((competitor) => ({
          dogId: competitor.dogId ?? "",
          identity: competitor.identity ?? "",
          name: competitor.name ?? "",
          owner: competitor.owner ?? "",
          team: competitor.team ?? "",
          country: competitor.country ?? "",
          breed: competitor.breed ?? "",
          order: competitor.order ?? 0,
        })) ?? [],
      configuration: {
        federation: event.configuration?.federation,
        id: event.configuration?.id ?? "",
        name: event.configuration?.name ?? "",
      },
      discipline: event.discipline ?? {
        id: "",
        name: "",
      },
      exercises:
        event.exercises?.map((exercise) => ({
          id: exercise.id ?? "",
          order: exercise.order ?? 0,
          name: exercise.name ?? "",
          tags: exercise.tags ?? [],
        })) ?? [],
      id: event.id ?? "",
      judges:
        event.judges?.map((judge) => ({
          collectorEmail: judge.collectorEmail ?? "",
          id: judge.id ?? "",
        })) ?? [],
      name: event.name ?? "",
      stageId: event.stageId ?? stage.id,
      status: event.status ?? "",
    })) ?? [],
  id: stage.id ?? "",
  name: stage.name ?? "",
});

const findCachedApiStage = (
  competitions: CompetitionDetail[] | undefined,
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
  const createApiStage = (payload: CreateStageRequest) => {
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
        url: "/api/stages",
      });
    })();
  };

  const updateApiStage = (
    competitionId: string,
    id: string,
    payload: UpdateStageRequest,
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
        url: `/api/stages/${nextApiStage.id}`,
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
        url: `/api/stages/${id}`,
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
