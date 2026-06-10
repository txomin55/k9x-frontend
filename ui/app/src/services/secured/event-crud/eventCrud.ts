import { createMemo, getOwner } from "solid-js";
import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import {
  applyApiEventRemoval,
  applyApiEventUpsert,
  commitApiEventMutation,
  commitApiEventMutationSuccess,
  createApiEventRollbackPayload
} from "@/services/secured/event-crud/eventCrudOfflineUtils";
import { CompetitionResponseDTO, getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { getVisibleCompetitions } from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import { translate } from "@/stores/i18n/i18n";
import {
  EMPTY_FEDERATION_CONFIGURATION,
  getConfigurationsFromCache
} from "@/services/secured/configurations/configurations";
import type {
  CreateEventRequestDTO,
  Discipline,
  EventCompetitorDetail,
  EventCompetitorRequestDTO,
  EventConfigurationDetailResponseDTO,
  EventDetailRawResponseDTO,
  EventDetailResponseDTO,
  EventExerciseDetailResponseDTO,
  EventExerciseRequestDTO,
  EventJudgeDetailRequestDTO,
  EventJudgeDetailResponseDTO,
  UpdateEventRequestDTO
} from "@/services/secured/event-crud/eventCrud.types";
import { normalizeEventDetailResponse } from "@/services/secured/event-crud/eventCrud.types";
import { queryClient } from "@/utils/http/query-client";

const fetchEventById = (id: string) =>
  rawRequest<EventDetailRawResponseDTO>({
    path: `/secured/events/${id}`,
  }).then(normalizeEventDetailResponse);

const eventByIdQuery = defineQuery({
  fetcher: fetchEventById,
  queryKey: (id: string) => ["event", id] as const,
});

export const getEventByIdQueryKey = (id: string) =>
  eventByIdQuery.options(id).queryKey;

export const getCachedEventById = (id: string) =>
  queryClient.getQueryData<EventDetailResponseDTO>(getEventByIdQueryKey(id));

export const useEventById = (id: string, options?: TanstackCreateQuery) =>
  eventByIdQuery.useQuery([id], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    enabled: !!id && id !== "new",
  });

const createId = () => globalThis.crypto.randomUUID();

const toApiExercise = (
  exercise: EventExerciseRequestDTO,
  previousExercise?: EventExerciseDetailResponseDTO,
): EventExerciseDetailResponseDTO => ({
  id: exercise.id ?? previousExercise?.id,
  position: exercise.position ?? previousExercise?.position ?? 0,
  name: previousExercise?.name ?? "",
  tags: exercise.tags ?? previousExercise?.tags ?? [],
});

const toApiEventConfiguration = (
  configuration?: EventConfigurationDetailResponseDTO,
  previousConfiguration?: EventConfigurationDetailResponseDTO,
): EventConfigurationDetailResponseDTO => ({
  federation:
    configuration?.federation ??
    previousConfiguration?.federation ??
    EMPTY_FEDERATION_CONFIGURATION,
  id: configuration?.id ?? previousConfiguration?.id ?? "",
  name: configuration?.name ?? previousConfiguration?.name ?? "",
});

const toApiDiscipline = (
  disciplineId?: string,
  previousDiscipline?: Discipline,
): Discipline => ({
  id: disciplineId ?? previousDiscipline?.id ?? "",
  name:
    previousDiscipline && previousDiscipline.id === disciplineId
      ? previousDiscipline.name
      : "",
});

const findConfigurationDetail = (
  discipline: string | undefined,
  configurationId: string | undefined,
): EventConfigurationDetailResponseDTO | undefined => {
  if (!discipline || !configurationId) {
    return undefined;
  }

  const configurations = getConfigurationsFromCache(discipline);

  for (const federation of configurations?.obdx?.federations ?? []) {
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
  judge: EventJudgeDetailRequestDTO,
  previousJudge?: EventJudgeDetailResponseDTO,
): EventJudgeDetailResponseDTO => ({
  collectorEmail: judge.collectorEmail ?? previousJudge?.collectorEmail ?? "",
  id: judge.id ?? previousJudge?.id ?? "",
  name: previousJudge?.name ?? "",
});

const toApiCompetitor = (
  competitor: EventCompetitorRequestDTO,
  previousCompetitor?: EventCompetitorDetail,
): EventCompetitorDetail => {
  return {
    dogId: competitor.dogId ?? previousCompetitor?.dogId ?? "",
    identity: previousCompetitor?.identity ?? "",
    name: previousCompetitor?.name ?? "",
    owner: previousCompetitor?.owner ?? "",
    team: previousCompetitor?.team ?? "",
    country: previousCompetitor?.country ?? "",
    breed: previousCompetitor?.breed ?? "",
    position: competitor.position ?? previousCompetitor?.position ?? 0,
    accepted: competitor.accepted ?? previousCompetitor?.accepted ?? false,
    status: previousCompetitor?.status ?? "",
  };
};

const mergeApiEventWithPayload = (
  payload: CreateEventRequestDTO | UpdateEventRequestDTO,
  previousEvent?: EventDetailResponseDTO,
  context?: {
    eventId?: string;
    stageId?: string;
  },
): EventDetailResponseDTO => {
  const isCreatePayload = "id" in payload && "stageId" in payload;
  const updatePayload = "configurationId" in payload ? payload : null;
  const createPayload = isCreatePayload ? payload : null;
  const nextEventId =
    (isCreatePayload ? payload.id : context?.eventId) ??
    previousEvent?.id ??
    createId();
  const nextStageId =
    (isCreatePayload ? payload.stageId : context?.stageId) ??
    previousEvent?.stage?.id ??
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
    ? findConfigurationDetail(
        previousEvent?.discipline?.id,
        updatePayload.configurationId,
      )
    : undefined;
  const nextStageName = previousEvent?.stage?.name ?? "";
  const nextStatus = previousEvent?.status ?? "";
  const nextCore = {
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
    discipline: toApiDiscipline(
      createPayload?.disciplineId,
      previousEvent?.discipline,
    ),
    enrollmentDeadline:
      updatePayload?.enrollmentDeadline ??
      previousEvent?.enrollmentDeadline ??
      0,
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
    stage: {
      id: nextStageId,
      name: nextStageName,
    },
    status: nextStatus,
  };

  return {
    ...nextCore,
    obdx: nextCore,
  };
};

const createDefaultApiEvent = (stageId: string): CreateEventRequestDTO => ({
  disciplineId: "",
  id: createId(),
  name: translate("MY.COMPETITIONS.EVENT_DETAIL.DEFAULT_EVENT"),
  stageId,
});

const findEventContextInCompetition = (
  competition: CompetitionResponseDTO | undefined,
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
  competitions: CompetitionResponseDTO[] | undefined,
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
  const getEvent = (_competitionId: string, _stageId: string, id: string) => {
    if (!getOwner()) {
      return () => getCachedEventById(id);
    }

    const eventQuery = useEventById(id, {
      staleTime: Number.POSITIVE_INFINITY,
    });

    return createMemo(() => eventQuery.data);
  };

  const createApiEvent = (
    payload: CreateEventRequestDTO,
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
          disciplineId: payload.disciplineId,
          id: draftApiEvent.id,
          name: draftApiEvent.name,
          stageId: draftApiEvent.stage.id,
        },
        onCommitted: () =>
          commitApiEventMutationSuccess({
            competitionId: context.competitionId,
            eventId: draftApiEvent.id,
            method: "POST",
            stageId: draftApiEvent.stage.id,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: draftApiEvent.id,
          previousCompetitionsFromCache,
          previousEvent: null,
          stageId: draftApiEvent.stage.id,
        }),
        url: "/secured/events",
      });
    })();
  };

  const updateApiEvent = (
    stageId: string,
    id: string,
    payload: UpdateEventRequestDTO,
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
      getCachedEventById(id) ??
        (context.event as unknown as EventDetailResponseDTO) ??
        undefined,
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
            stageId: nextApiEvent.stage.id,
          }),
        rollbackPayload: await createApiEventRollbackPayload({
          competitionId: context.competitionId,
          entityId: nextApiEvent.id,
          previousCompetitionsFromCache,
          previousEvent: getCachedEventById(nextApiEvent.id) ?? null,
          stageId,
        }),
        url: `/secured/obdx/events/${nextApiEvent.id}`,
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
          previousEvent: getCachedEventById(id) ?? null,
          stageId,
        }),
        url: `/secured/events/${id}`,
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
