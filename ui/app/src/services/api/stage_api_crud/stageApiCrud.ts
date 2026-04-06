import {
  applyApiStageRemoval,
  applyApiStageUpsert,
  commitApiStageMutation,
  commitApiStageMutationSuccess,
  createApiStageRollbackPayload,
} from "@/services/api/stage_api_crud/stageApiCrudOfflineUtils";
import { createMemo, getOwner } from "solid-js";
import {
  type Competition,
  getCachedCompetitions,
  useCompetition,
} from "@/services/api/competition_crud/competitionCrud";
import type {
  EventCompetitor,
  EventConfiguration,
  EventExercise,
  EventMutationPayload,
  EventResponse,
  EventScore,
  PublicEventCompetitor,
  PublicEventConfiguration,
  PublicEventExercise,
  PublicEventScore,
  PublicStageJudge,
  Stage,
  StageEditorModel,
  StageJudge,
  StageMutationPayload,
} from "@/services/api/competition_crud/competitionCrudTypes";

export type {
  StageEditorModel,
  PublicStageJudge,
  EventResponse,
} from "@/services/api/competition_crud/competitionCrudTypes";

const createId = () => globalThis.crypto.randomUUID();

const toApiStageEventScore = (
  score: EventScore,
  previousScore?: PublicEventScore,
): PublicEventScore => ({
  exerciseId: score.exerciseId ?? previousScore?.exerciseId ?? "",
  id: score.id ?? previousScore?.id ?? createId(),
  score: score.score ?? previousScore?.score ?? 0,
});

const toApiStageExercise = (
  exercise: EventExercise,
  previousExercise?: PublicEventExercise,
): PublicEventExercise => ({
  id: exercise.id ?? previousExercise?.id ?? createId(),
  order: exercise.order ?? previousExercise?.order ?? 0,
  text: exercise.text ?? previousExercise?.text ?? "",
});

const toApiStageEventConfiguration = (
  configuration?: EventConfiguration,
  previousConfiguration?: PublicEventConfiguration,
): PublicEventConfiguration => ({
  federation:
    configuration?.federation ?? previousConfiguration?.federation ?? "",
  id: configuration?.id ?? previousConfiguration?.id ?? createId(),
  name: configuration?.name ?? previousConfiguration?.name ?? "",
  version: configuration?.version ?? previousConfiguration?.version ?? 0,
});

const toApiStageJudge = (
  judge: StageJudge,
  previousJudge?: PublicStageJudge,
): PublicStageJudge => ({
  collectorEmail: judge.collectorEmail ?? previousJudge?.collectorEmail ?? "",
  name: judge.name ?? previousJudge?.name ?? "",
});

const toApiStageCompetitor = (
  competitor: EventCompetitor,
  previousCompetitor?: PublicEventCompetitor,
): PublicEventCompetitor => {
  const previousScoresById = new Map(
    (previousCompetitor?.scores ?? []).map((score) => [score.id, score]),
  );

  return {
    finalScore: competitor.finalScore ?? previousCompetitor?.finalScore ?? 0,
    dogId: competitor.dogId ?? previousCompetitor?.dogId ?? createId(),
    identity: competitor.identity ?? previousCompetitor?.identity ?? "",
    name: competitor.name ?? previousCompetitor?.name ?? "",
    owner: competitor.owner ?? previousCompetitor?.owner ?? "",
    team: competitor.team ?? previousCompetitor?.team ?? "",
    country: competitor.country ?? previousCompetitor?.country ?? "",
    scores:
      competitor.scores?.map((score) =>
        toApiStageEventScore(
          score,
          score.id ? previousScoresById.get(score.id) : undefined,
        ),
      ) ??
      previousCompetitor?.scores ??
      [],
  };
};

const toApiStageEvent = (
  event: EventMutationPayload,
  stageId: string,
  previousEvent?: EventResponse,
): EventResponse => {
  const previousCompetitorsById = new Map(
    (previousEvent?.competitors ?? []).map((competitor) => [
      competitor.dogId,
      competitor,
    ]),
  );
  const previousExercisesById = new Map(
    (previousEvent?.exercises ?? []).map((exercise) => [exercise.id, exercise]),
  );

  return {
    competitors:
      event.competitors?.map((competitor) =>
        toApiStageCompetitor(
          competitor,
          competitor.dogId
            ? previousCompetitorsById.get(competitor.dogId)
            : undefined,
        ),
      ) ??
      previousEvent?.competitors ??
      [],
    configuration: toApiStageEventConfiguration(
      event.configuration,
      previousEvent?.configuration,
    ),
    discipline: previousEvent?.discipline ?? "",
    exercises:
      event.exercises?.map((exercise) =>
        toApiStageExercise(
          exercise,
          exercise.id ? previousExercisesById.get(exercise.id) : undefined,
        ),
      ) ??
      previousEvent?.exercises ??
      [],
    id: event.id ?? previousEvent?.id ?? createId(),
    judges:
      event.judges?.map((judge, index) =>
        toApiStageJudge(judge, previousEvent?.judges?.[index]),
      ) ??
      previousEvent?.judges ??
      [],
    name: event.name ?? previousEvent?.name ?? "",
    stageId: event.stageId ?? previousEvent?.stageId ?? stageId,
    status: previousEvent?.status ?? "",
  };
};

const mergeApiStageWithPayload = (
  payload: StageMutationPayload,
  previousStage?: StageEditorModel,
): StageEditorModel => {
  const nextStageId = payload.id ?? previousStage?.id ?? createId();
  const previousEventsById = new Map(
    (previousStage?.events ?? []).map((event) => [event.id, event]),
  );

  return {
    competitionId: payload.competitionId ?? previousStage?.competitionId ?? "",
    dateFrom: payload.dateFrom ?? previousStage?.dateFrom ?? 0,
    dateTo: payload.dateTo ?? previousStage?.dateTo ?? 0,
    events:
      payload.events?.map((event) =>
        toApiStageEvent(
          event,
          nextStageId,
          event.id ? previousEventsById.get(event.id) : undefined,
        ),
      ) ??
      previousStage?.events ??
      [],
    id: nextStageId,
    name: payload.name ?? previousStage?.name ?? "",
  };
};

const createDefaultApiStage = (
  competitionId: string,
): StageMutationPayload => ({
  competitionId,
  id: createId(),
  name: "--Default stage",
});

export const toApiStage = (
  stage: Stage,
  competitionId: string,
): StageEditorModel => ({
  competitionId,
  dateFrom: stage.dateFrom ?? 0,
  dateTo: stage.dateTo ?? 0,
  events:
    stage.events?.map((event) => ({
      competitors:
        event.competitors?.map((competitor) => ({
          finalScore: competitor.finalScore ?? 0,
          dogId: competitor.dogId ?? "",
          identity: competitor.identity ?? "",
          name: competitor.name ?? "",
          owner: competitor.owner ?? "",
          team: competitor.team ?? "",
          country: competitor.country ?? "",
          scores:
            competitor.scores?.map((score) => ({
              exerciseId: score.exerciseId ?? "",
              id: score.id ?? "",
              score: score.score ?? 0,
            })) ?? [],
        })) ?? [],
      configuration: {
        federation: event.configuration?.federation ?? "",
        id: event.configuration?.id ?? "",
        name: event.configuration?.name ?? "",
        version: event.configuration?.version ?? 0,
      },
      discipline: event.discipline ?? "",
      exercises:
        event.exercises?.map((exercise) => ({
          id: exercise.id ?? "",
          order: exercise.order ?? 0,
          text: exercise.text ?? "",
        })) ?? [],
      id: event.id ?? "",
      judges:
        event.judges?.map((judge) => ({
          collectorEmail: judge.collectorEmail ?? "",
          name: judge.name ?? "",
        })) ?? [],
      name: event.name ?? "",
      stageId: event.stageId ?? stage.id,
      status: event.status ?? "",
    })) ?? [],
  id: stage.id ?? "",
  name: stage.name ?? "",
});

const findCachedApiStage = (
  competitions: Competition[] | undefined,
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
  const createApiStage = (payload: StageMutationPayload) => {
    const draftApiStage = mergeApiStageWithPayload(payload);
    const previousCompetitionsFromCache = getCachedCompetitions();

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
            payload: draftApiStage,
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

  const updateApiStage = (payload: StageMutationPayload) => {
    if (!payload.id) {
      throw new Error("updateApiStage requires an id");
    }

    const previousCompetitionsFromCache = getCachedCompetitions();
    const previousStage = findCachedApiStage(
      previousCompetitionsFromCache,
      payload.competitionId ?? "",
      payload.id,
    );
    const nextApiStage = mergeApiStageWithPayload(
      payload,
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
            payload: nextApiStage,
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
    const previousCompetitionsFromCache = getCachedCompetitions();
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
