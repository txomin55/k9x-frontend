import { createMemo, getOwner } from "solid-js";
import {
  applyApiEventRemoval,
  applyApiEventUpsert,
  commitApiEventMutation,
  commitApiEventMutationSuccess,
  createApiEventRollbackPayload,
} from "@/services/api/event-crud/eventCrudOfflineUtils";
import {
  CompetitionDetail,
  getCachedCompetitions,
  useCompetition,
} from "@/services/api/competition-crud/competitionCrud";
import { getVisibleCompetitions } from "@/services/api/competition-crud/competitionCrudOfflineUtils";
import {
  type DisciplineFederationConfigurations,
  getConfigurationsQueryKey,
} from "@/services/api/configurations/configurations";
import type {
  CreateEventRequest,
  EventCompetitor,
  EventCompetitorDetail,
  EventConfiguration,
  EventConfigurationDetail,
  EventDetail,
  EventExerciseDetail,
  EventJudge,
  EventJudgeDetail,
  UpdateEventRequest,
} from "@/services/api/event-crud/eventCrud.types";
import { queryClient } from "@/utils/http/query-client";

const createId = () => globalThis.crypto.randomUUID();

const toApiExercise = (
  exercise: EventExerciseDetail,
  previousExercise?: EventExerciseDetail,
): EventExerciseDetail => ({
  id: exercise.id ?? previousExercise?.id ?? createId(),
  order: exercise.order ?? previousExercise?.order ?? 0,
  name: exercise.name ?? previousExercise?.name ?? "",
  tags: exercise.tags ?? previousExercise?.tags ?? [],
});

const toApiEventConfiguration = (
  configuration?: EventConfiguration,
  previousConfiguration?: EventConfigurationDetail,
): EventConfigurationDetail => ({
  federation: configuration?.federation ?? previousConfiguration?.federation,
  id: configuration?.id ?? previousConfiguration?.id ?? createId(),
  name: configuration?.name ?? previousConfiguration?.name ?? "",
});

const findConfigurationDetail = (
  discipline: string | undefined,
  configurationId: string | undefined,
): EventConfiguration | undefined => {
  if (!discipline || !configurationId) {
    return undefined;
  }

  const configurations = queryClient.getQueryData<
    DisciplineFederationConfigurations[]
  >(getConfigurationsQueryKey());
  const disciplineConfigurations = configurations?.find(
    (entry) => entry.disciplineId === discipline,
  );

  for (const federation of disciplineConfigurations?.federations ?? []) {
    const configuration = federation.configurations.find(
      (entry) => entry.id === configurationId,
    );

    if (configuration) {
      return {
        federation: federation.info,
        id: configuration.id,
        name: configuration.name,
      };
    }
  }

  return undefined;
};

const toApiJudge = (
  judge: EventJudge,
  previousJudge?: EventJudgeDetail,
): EventJudgeDetail => ({
  collectorEmail: judge.collectorEmail ?? previousJudge?.collectorEmail ?? "",
  id: judge.id ?? previousJudge?.id ?? "",
});

const toApiCompetitor = (
  competitor: EventCompetitor,
  previousCompetitor?: EventCompetitorDetail,
): EventCompetitorDetail => {
  return {
    dogId: competitor.dogId ?? previousCompetitor?.dogId ?? createId(),
    identity: competitor.identity ?? previousCompetitor?.identity ?? "",
    name: previousCompetitor?.name ?? "",
    owner: competitor.owner ?? previousCompetitor?.owner ?? "",
    team: competitor.team ?? previousCompetitor?.team ?? "",
    country: competitor.country ?? previousCompetitor?.country ?? "",
    breed: previousCompetitor?.breed ?? "",
    order: competitor.order ?? previousCompetitor?.order ?? 0,
  };
};

const mergeApiEventWithPayload = (
  payload: CreateEventRequest | UpdateEventRequest,
  previousEvent?: EventDetail,
  context?: {
    eventId?: string;
    stageId?: string;
  },
): EventDetail => {
  const isCreatePayload = "id" in payload && "stageId" in payload;
  const updatePayload = "configurationId" in payload ? payload : null;
  const nextEventId =
    (isCreatePayload ? payload.id : context?.eventId) ??
    previousEvent?.id ??
    createId();
  const nextStageId =
    (isCreatePayload ? payload.stageId : context?.stageId) ??
    previousEvent?.stageId ??
    "";
  const previousCompetitorsById = new Map(
    (previousEvent?.competitors ?? []).map((competitor) => [
      competitor.dogId,
      competitor,
    ]),
  );
  const previousExercisesById = new Map(
    (previousEvent?.exercises ?? []).map((exercise) => [exercise.id, exercise]),
  );
  const resolvedConfiguration = updatePayload?.configurationId
    ? (findConfigurationDetail(
        previousEvent?.discipline,
        updatePayload.configurationId,
      ) ?? { id: updatePayload.configurationId })
    : undefined;

  return {
    competitors:
      updatePayload?.competitors?.map((competitor) =>
        toApiCompetitor(
          competitor,
          competitor.dogId
            ? previousCompetitorsById.get(competitor.dogId)
            : undefined,
        ),
      ) ??
      previousEvent?.competitors ??
      [],
    configuration: toApiEventConfiguration(
      resolvedConfiguration,
      previousEvent?.configuration,
    ),
    discipline: previousEvent?.discipline ?? "",
    exercises:
      updatePayload?.exercises?.map((exercise) =>
        toApiExercise(
          exercise,
          exercise.id ? previousExercisesById.get(exercise.id) : undefined,
        ),
      ) ??
      previousEvent?.exercises ??
      [],
    id: nextEventId,
    judges:
      updatePayload?.judges?.map((judge, index) =>
        toApiJudge(judge, previousEvent?.judges?.[index]),
      ) ??
      previousEvent?.judges ??
      [],
    name: payload.name ?? previousEvent?.name ?? "",
    stageId: nextStageId,
    status: previousEvent?.status ?? "",
  };
};

const createDefaultApiEvent = (stageId: string): CreateEventRequest => ({
  id: createId(),
  name: "--Default event",
  stageId,
});

const findEventContextInCompetition = (
  competition: CompetitionDetail | undefined,
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
      ? (stage.events.find((entry) => String(entry.id) === String(eventId)) ??
        null)
      : null,
    stage,
  };
};

const findEventContext = (
  competitions: CompetitionDetail[] | undefined,
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
    const context = findEventContextInCompetition(
      competition,
      stageId,
      eventId,
    );

    if (context) {
      return context;
    }
  }

  return null;
};

export const useApiEvent = () => {
  const { getCompetition } = useCompetition();

  const getEvent = (competitionId: string, stageId: string, id: string) => {
    if (!getOwner()) {
      return () =>
        findEventContext(getCachedCompetitions(), stageId, competitionId, id)
          ?.event ?? undefined;
    }

    const competition = getCompetition(competitionId);

    return createMemo(() => {
      const stage = competition()?.stages?.find(
        (entry) => entry.id === stageId,
      );

      if (!stage) return undefined;

      return stage.events.find((entry) => entry.id === id) ?? undefined;
    });
  };

  const createApiEvent = (
    payload: CreateEventRequest,
    options?: { competitionId?: string },
  ) => {
    if (!payload.stageId) {
      throw new Error("createApiEvent requires a stageId");
    }

    const previousCompetitionsFromCache = getVisibleCompetitions();
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
          discipline: draftApiEvent.discipline,
          id: draftApiEvent.id,
          name: draftApiEvent.name,
          stageId: draftApiEvent.stageId,
        },
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: draftApiEvent.id,
            method: "POST",
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
    stageId: string,
    id: string,
    payload: UpdateEventRequest,
    options?: { competitionId?: string },
  ) => {
    const previousCompetitionsFromCache = getVisibleCompetitions();
    const context = findEventContext(
      previousCompetitionsFromCache,
      stageId,
      options?.competitionId,
      id,
    );

    if (!context) {
      throw new Error(`Stage ${stageId} not found`);
    }

    const nextApiEvent = mergeApiEventWithPayload(
      payload,
      context.event ?? undefined,
      { eventId: id, stageId },
    );

    applyApiEventUpsert(context.competitionId, stageId, nextApiEvent);

    void (async () => {
      await commitApiEventMutation({
        entityId: nextApiEvent.id,
        method: "PUT",
        payload,
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: nextApiEvent.id,
            method: "PUT",
            stageId: nextApiEvent.stageId,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: nextApiEvent.id,
          previousCompetitionsFromCache,
          previousEvent: context.event ?? null,
          stageId,
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
