import {
  applyApiStageRemoval,
  applyApiStageUpsert,
  createApiStageRollbackPayload,
  queueApiStageMutation
} from "@/services/api/stage_api_crud/stageApiCrudOfflineUtils";
import { createMemo } from "solid-js";
import {
  type Competitions,
  getCachedCompetitions,
  useCompetition
} from "@/services/api/competition_crud/competitionCrud";
import type {
  ApiPostStage,
  ApiPostStageCompetitor,
  ApiPostStageEvent,
  ApiPostStageEventConfiguration,
  ApiPostStageEventScore,
  ApiPostStageExercise,
  ApiPostStageJudge,
  ApiStage,
  ApiStageCompetitor,
  ApiStageEvent,
  ApiStageEventConfiguration,
  ApiStageEventScore,
  ApiStageExercise,
  ApiStageJudge,
  Stage
} from "@/services/api/competition_crud/competitionCrudTypes";

export type {
  ApiPostStage,
  ApiStage,
  ApiStageCompetitor,
  ApiStageEvent,
  ApiStageEventConfiguration,
  ApiStageEventScore,
  ApiStageExercise,
  ApiStageJudge,
} from "@/services/api/competition_crud/competitionCrudTypes";

const createId = () => globalThis.crypto.randomUUID();

const toApiStageEventScore = (
  score: ApiPostStageEventScore,
  previousScore?: ApiStageEventScore,
): ApiStageEventScore => ({
  exerciseId: score.exerciseId ?? previousScore?.exerciseId ?? "",
  id: score.id ?? previousScore?.id ?? createId(),
  score: score.score ?? previousScore?.score ?? 0,
});

const toApiStageExercise = (
  exercise: ApiPostStageExercise,
  previousExercise?: ApiStageExercise,
): ApiStageExercise => ({
  id: exercise.id ?? previousExercise?.id ?? createId(),
  order: exercise.order ?? previousExercise?.order ?? 0,
  text: exercise.text ?? previousExercise?.text ?? "",
});

const toApiStageEventConfiguration = (
  configuration?: ApiPostStageEventConfiguration,
  previousConfiguration?: ApiStageEventConfiguration,
): ApiStageEventConfiguration => ({
  federation:
    configuration?.federation ?? previousConfiguration?.federation ?? "",
  id: configuration?.id ?? previousConfiguration?.id ?? createId(),
  name: configuration?.name ?? previousConfiguration?.name ?? "",
  version: configuration?.version ?? previousConfiguration?.version ?? 0,
});

const toApiStageJudge = (
  judge: ApiPostStageJudge,
  previousJudge?: ApiStageJudge,
): ApiStageJudge => ({
  collectorEmail: judge.collectorEmail ?? previousJudge?.collectorEmail ?? "",
  name: judge.name ?? previousJudge?.name ?? "",
});

const toApiStageCompetitor = (
  competitor: ApiPostStageCompetitor,
  previousCompetitor?: ApiStageCompetitor,
): ApiStageCompetitor => {
  const previousScoresById = new Map(
    (previousCompetitor?.scores ?? []).map((score) => [score.id, score]),
  );

  return {
    finalScore: competitor.finalScore ?? previousCompetitor?.finalScore ?? 0,
    id: competitor.id ?? previousCompetitor?.id ?? createId(),
    identity: competitor.identity ?? previousCompetitor?.identity ?? "",
    name: competitor.name ?? previousCompetitor?.name ?? "",
    owner: competitor.owner ?? previousCompetitor?.owner ?? "",
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
  event: ApiPostStageEvent,
  previousEvent?: ApiStageEvent,
): ApiStageEvent => {
  const previousCompetitorsById = new Map(
    (previousEvent?.competitors ?? []).map((competitor) => [
      competitor.id,
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
          competitor.id
            ? previousCompetitorsById.get(competitor.id)
            : undefined,
        ),
      ) ??
      previousEvent?.competitors ??
      [],
    configuration: toApiStageEventConfiguration(
      event.configuration,
      previousEvent?.configuration,
    ),
    discipline: event.discipline ?? previousEvent?.discipline ?? "",
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
    status: event.status ?? previousEvent?.status ?? "",
  };
};

const mergeApiStageWithPayload = (
  payload: ApiPostStage,
  previousStage?: ApiStage,
): ApiStage => {
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
          event.id ? previousEventsById.get(event.id) : undefined,
        ),
      ) ??
      previousStage?.events ??
      [],
    id: payload.id ?? previousStage?.id ?? createId(),
    name: payload.name ?? previousStage?.name ?? "",
  };
};

const createDefaultApiStage = (competitionId: string): ApiPostStage => ({
  competitionId,
  dateFrom: Date.now(),
  dateTo: Date.now(),
  discipline: "",
  events: [],
  federation: "",
  id: createId(),
  name: "--Default stage",
});

const toApiStage = (stage: Stage, competitionId: string): ApiStage => ({
  competitionId,
  dateFrom: stage.dateFrom ?? 0,
  dateTo: stage.dateTo ?? 0,
  events:
    stage.events?.map((event) => ({
      competitors:
        event.competitors?.map((competitor) => ({
          finalScore: competitor.finalScore ?? 0,
          id: competitor.id ?? "",
          identity: competitor.identity ?? "",
          name: competitor.name ?? "",
          owner: competitor.owner ?? "",
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
      status: event.status ?? "",
    })) ?? [],
  id: stage.id ?? "",
  name: stage.name ?? "",
});

const findCachedApiStage = (
  competitions: Competitions[] | undefined,
  competitionId: string,
  stageId: string,
): ApiStage | null => {
  const competition = competitions?.find((entry) => entry.id === competitionId);
  const stage = competition?.stages?.find((entry) => entry.id === stageId);

  if (!stage) return null;

  return toApiStage(stage, competitionId);
};

export const useApiStage = () => {
  const { getCompetition } = useCompetition();
  const getStage = (competitionId: string, id: string) => {
    const competition = getCompetition(competitionId);

    return createMemo(() => {
      const stage = competition()?.stages?.find((entry) => entry.id === id);

      if (!stage) return undefined;

      return toApiStage(stage, competitionId);
    });
  };
  const createApiStage = (payload: ApiPostStage) => {
    const draftApiStage = mergeApiStageWithPayload(payload);
    const previousCompetitionsFromCache = getCachedCompetitions();

    applyApiStageUpsert(draftApiStage);

    void (async () => {
      await queueApiStageMutation({
        entityId: draftApiStage.id,
        method: "POST",
        payload: draftApiStage,
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

  const updateApiStage = (payload: ApiPostStage) => {
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
      await queueApiStageMutation({
        entityId: nextApiStage.id,
        method: "PUT",
        payload: nextApiStage,
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
      await queueApiStageMutation({
        entityId: id,
        method: "DELETE",
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
