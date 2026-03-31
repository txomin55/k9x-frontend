import { createMemo } from "solid-js";
import {
  applyApiEventRemoval,
  applyApiEventUpsert,
  commitApiEventMutation,
  commitApiEventMutationSuccess,
  createApiEventRollbackPayload,
} from "@/services/api/event_api_crud/eventApiCrudOfflineUtils";
import {
  getCachedCompetitions,
  useCompetition,
} from "@/services/api/competition_crud/competitionCrud";
import type {
  ApiEvent,
  ApiPostEvent,
  ApiPostStageCompetitor,
  ApiPostStageEventConfiguration,
  ApiPostStageEventScore,
  ApiPostStageExercise,
  ApiPostStageJudge,
  ApiStageCompetitor,
  ApiStageEventConfiguration,
  ApiStageEventScore,
  ApiStageExercise,
  ApiStageJudge,
  Competitions,
} from "@/services/api/competition_crud/competitionCrudTypes";

export type {
  ApiEvent,
  ApiPostEvent,
} from "@/services/api/competition_crud/competitionCrudTypes";

const createId = () => globalThis.crypto.randomUUID();

const toApiEventScore = (
  score: ApiPostStageEventScore,
  previousScore?: ApiStageEventScore,
): ApiStageEventScore => ({
  exerciseId: score.exerciseId ?? previousScore?.exerciseId ?? "",
  id: score.id ?? previousScore?.id ?? createId(),
  score: score.score ?? previousScore?.score ?? 0,
});

const toApiExercise = (
  exercise: ApiPostStageExercise,
  previousExercise?: ApiStageExercise,
): ApiStageExercise => ({
  id: exercise.id ?? previousExercise?.id ?? createId(),
  order: exercise.order ?? previousExercise?.order ?? 0,
  text: exercise.text ?? previousExercise?.text ?? "",
});

const toApiEventConfiguration = (
  configuration?: ApiPostStageEventConfiguration,
  previousConfiguration?: ApiStageEventConfiguration,
): ApiStageEventConfiguration => ({
  federation:
    configuration?.federation ?? previousConfiguration?.federation ?? "",
  id: configuration?.id ?? previousConfiguration?.id ?? createId(),
  name: configuration?.name ?? previousConfiguration?.name ?? "",
  version: configuration?.version ?? previousConfiguration?.version ?? 0,
});

const toApiJudge = (
  judge: ApiPostStageJudge,
  previousJudge?: ApiStageJudge,
): ApiStageJudge => ({
  collectorEmail: judge.collectorEmail ?? previousJudge?.collectorEmail ?? "",
  name: judge.name ?? previousJudge?.name ?? "",
});

const toApiCompetitor = (
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
        toApiEventScore(
          score,
          score.id ? previousScoresById.get(score.id) : undefined,
        ),
      ) ??
      previousCompetitor?.scores ??
      [],
  };
};

const mergeApiEventWithPayload = (
  payload: ApiPostEvent,
  previousEvent?: ApiEvent,
): ApiEvent => {
  const nextEventId = payload.id ?? previousEvent?.id ?? createId();
  const nextStageId = payload.stageId ?? previousEvent?.stageId ?? "";
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
      payload.competitors?.map((competitor) =>
        toApiCompetitor(
          competitor,
          competitor.id
            ? previousCompetitorsById.get(competitor.id)
            : undefined,
        ),
      ) ??
      previousEvent?.competitors ??
      [],
    configuration: toApiEventConfiguration(
      payload.configuration,
      previousEvent?.configuration,
    ),
    discipline: payload.discipline ?? previousEvent?.discipline ?? "",
    exercises:
      payload.exercises?.map((exercise) =>
        toApiExercise(
          exercise,
          exercise.id ? previousExercisesById.get(exercise.id) : undefined,
        ),
      ) ??
      previousEvent?.exercises ??
      [],
    id: nextEventId,
    judges:
      payload.judges?.map((judge, index) =>
        toApiJudge(judge, previousEvent?.judges?.[index]),
      ) ??
      previousEvent?.judges ??
      [],
    name: payload.name ?? previousEvent?.name ?? "",
    stageId: nextStageId,
    status: payload.status ?? previousEvent?.status ?? "",
  };
};

const createDefaultApiEvent = (stageId: string): ApiPostEvent => ({
  id: createId(),
  name: "--Default event",
  stageId,
});

const findEventContextInCompetition = (
  competition: Competitions | undefined,
  stageId: string,
  eventId?: string,
) => {
  const stage = competition?.stages?.find(
    (entry) => String(entry.id) === String(stageId),
  );

  if (!stage || !competition) {
    return null;
  }

  return {
    competitionId: competition.id,
    event: eventId
      ? stage.events.find((entry) => String(entry.id) === String(eventId)) ?? null
      : null,
    stage,
  };
};

const findEventContext = (
  competitions: Competitions[] | undefined,
  stageId: string,
  competitionId?: string,
  eventId?: string,
) => {
  if (competitionId) {
    const directContext = findEventContextInCompetition(
      competitions?.find((entry) => String(entry.id) === String(competitionId)),
      stageId,
      eventId,
    );

    if (directContext) {
      return directContext;
    }
  }

  for (const competition of competitions ?? []) {
    const context = findEventContextInCompetition(competition, stageId, eventId);

    if (context) {
      return context;
    }
  }

  return null;
};

export const useApiEvent = () => {
  const { getCompetition } = useCompetition();

  const getEvent = (competitionId: string, stageId: string, id: string) => {
    const competition = getCompetition(competitionId);

    return createMemo(() => {
      const stage = competition()?.stages?.find((entry) => entry.id === stageId);

      if (!stage) return undefined;

      return (
        stage.events.find((entry) => entry.id === id) ??
        undefined
      );
    });
  };

  const createApiEvent = (
    payload: ApiPostEvent,
    options?: { competitionId?: string },
  ) => {
    if (!payload.stageId) {
      throw new Error("createApiEvent requires a stageId");
    }

    const previousCompetitionsFromCache = getCachedCompetitions();
    const context = findEventContext(
      previousCompetitionsFromCache,
      payload.stageId,
      options?.competitionId,
    );

    if (!context) {
      throw new Error(`Stage ${payload.stageId} not found`);
    }

    const draftApiEvent = mergeApiEventWithPayload(payload);

    applyApiEventUpsert(context.competitionId, payload.stageId, draftApiEvent);

    void (async () => {
      await commitApiEventMutation({
        entityId: draftApiEvent.id,
        method: "POST",
        payload: {
          id: draftApiEvent.id,
          name: draftApiEvent.name,
          stageId: draftApiEvent.stageId,
        },
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: draftApiEvent.id,
            method: "POST",
            payload: draftApiEvent,
            stageId: draftApiEvent.stageId,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: draftApiEvent.id,
          previousCompetitionsFromCache,
          previousEvent: null,
          stageId: draftApiEvent.stageId,
        }),
        url: "/api/events",
      });
    })();
  };

  const updateApiEvent = (
    payload: ApiPostEvent,
    options?: { competitionId?: string },
  ) => {
    if (!payload.id) {
      throw new Error("updateApiEvent requires an id");
    }
    if (!payload.stageId) {
      throw new Error("updateApiEvent requires a stageId");
    }

    const previousCompetitionsFromCache = getCachedCompetitions();
    const context = findEventContext(
      previousCompetitionsFromCache,
      payload.stageId,
      options?.competitionId,
      payload.id,
    );

    if (!context) {
      throw new Error(`Stage ${payload.stageId} not found`);
    }

    const nextApiEvent = mergeApiEventWithPayload(
      payload,
      context.event ?? undefined,
    );

    applyApiEventUpsert(context.competitionId, payload.stageId, nextApiEvent);

    void (async () => {
      await commitApiEventMutation({
        entityId: nextApiEvent.id,
        method: "PUT",
        payload: nextApiEvent,
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: nextApiEvent.id,
            method: "PUT",
            payload: nextApiEvent,
            stageId: nextApiEvent.stageId,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: nextApiEvent.id,
          previousCompetitionsFromCache,
          previousEvent: context.event ?? null,
          stageId: nextApiEvent.stageId,
        }),
        url: `/api/events/${nextApiEvent.id}`,
      });
    })();
  };

  const deleteApiEvent = (
    id: string,
    stageId: string,
    options?: { competitionId?: string },
  ) => {
    const previousCompetitionsFromCache = getCachedCompetitions();
    const context = findEventContext(
      previousCompetitionsFromCache,
      stageId,
      options?.competitionId,
      id,
    );

    if (!context) {
      throw new Error(`Stage ${stageId} not found`);
    }

    applyApiEventRemoval(context.competitionId, stageId, id);

    void (async () => {
      await commitApiEventMutation({
        entityId: id,
        method: "DELETE",
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: id,
            method: "DELETE",
            stageId,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: id,
          previousCompetitionsFromCache,
          previousEvent: context.event ?? null,
          stageId,
        }),
        url: `/api/events/${id}`,
      });
    })();
  };

  return {
    createApiEvent,
    createDefaultApiEvent,
    deleteApiEvent,
    getEvent,
    updateApiEvent,
  };
};
