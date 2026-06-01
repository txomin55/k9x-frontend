import {
  getVisibleCompetitions,
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot,
} from "@/services/secured/competition-crud/competitionCrudOfflineUtils";
import { getCompetitionsQueryKey } from "@/services/secured/competition-crud/competitionCrud";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import {
  clearCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/secured/competition-crud/competitionDraftStore";
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
  CompetitionStageDetailResponseDTO,
  CompetitionStageEventDetailResponseDTO,
} from "@/services/secured/stage-crud/stageCrud.types";
import {
  ApiEventRollbackPayload,
  EventDetailResponseDTO,
} from "@/services/secured/event-crud/eventCrud.types";
import { getCurrentLocale } from "@/stores/i18n/i18n";

const buildNextStageDetail = (
  stage: CompetitionStageDetailResponseDTO,
  event: EventDetailResponseDTO,
): CompetitionStageDetailResponseDTO => {
  const lightweightEvent: CompetitionStageEventDetailResponseDTO = {
    id: event.id,
    name: event.name,
    discipline: event.discipline,
  };
  const previousEvents = stage.events;
  const existingIndex = previousEvents.findIndex(
    ({ id }) => String(id) === String(event.id),
  );

  return {
    ...stage,
    events:
      existingIndex === -1
        ? [...previousEvents, lightweightEvent]
        : previousEvents.map((previousEvent) =>
            String(previousEvent.id) === String(event.id)
              ? lightweightEvent
              : previousEvent,
          ),
  };
};

const buildStageDetailWithoutEvent = (
  stage: CompetitionStageDetailResponseDTO,
  eventId: string,
): CompetitionStageDetailResponseDTO => ({
  ...stage,
  events: (stage.events ?? []).filter(
    ({ id }) => String(id) !== String(eventId),
  ),
});

const buildNextCompetitionDetail = (
  competition: CompetitionResponseDTO,
  stageId: string,
  event: EventDetailResponseDTO,
): CompetitionResponseDTO => ({
  ...competition,
  stages: competition.stages?.map((stage) =>
    String(stage.id) === String(stageId)
      ? buildNextStageDetail(stage, event)
      : stage,
  ),
});

const buildCompetitionDetailWithoutEvent = (
  competition: CompetitionResponseDTO,
  stageId: string,
  eventId: string,
): CompetitionResponseDTO => ({
  ...competition,
  stages: (competition.stages ?? []).map((stage) =>
    String(stage.id) === String(stageId)
      ? buildStageDetailWithoutEvent(stage, eventId)
      : stage,
  ),
});

const buildNextCompetitionsList = (
  competitions: CompetitionResponseDTO[],
  competitionId: string,
  stageId: string,
  event: EventDetailResponseDTO,
): CompetitionResponseDTO[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildNextCompetitionDetail(competition, stageId, event)
      : competition,
  );

const buildCompetitionsListWithoutEvent = (
  competitions: CompetitionResponseDTO[],
  competitionId: string,
  stageId: string,
  eventId: string,
): CompetitionResponseDTO[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildCompetitionDetailWithoutEvent(competition, stageId, eventId)
      : competition,
  );

const getEventByIdQueryKey = (id: string) =>
  ["event", id, getCurrentLocale()] as const;

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<CompetitionResponseDTO[]>(getCompetitionsQueryKey()) ??
  [];

const persistApiEventCompetitionSnapshot = async (
  competitionId: string,
  stageId: string,
  event: EventDetailResponseDTO,
) => {
  const previousCompetitions = getVisibleCompetitions();
  const parentCompetition = previousCompetitions.find(
    (competition) => String(competition.id) === String(competitionId),
  );

  if (!parentCompetition) {
    return;
  }

  const nextCompetitions = buildNextCompetitionsList(
    previousCompetitions,
    competitionId,
    stageId,
    event,
  );
  const nextCompetition = nextCompetitions.find(
    (competition) => String(competition.id) === String(competitionId),
  );

  if (nextCompetition) {
    upsertCompetitionDraft(nextCompetition);
  }

  await saveCompetitionsSnapshot(nextCompetitions);
};

const removeApiEventFromCompetitionSnapshot = async (
  competitionId: string,
  stageId: string,
  eventId: string,
) => {
  const previousCompetitions = getVisibleCompetitions();
  const nextCompetitions = buildCompetitionsListWithoutEvent(
    previousCompetitions,
    competitionId,
    stageId,
    eventId,
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

export const createApiEventRollbackPayload = async ({
  competitionId,
  entityId,
  previousCompetitionsFromCache,
  previousEvent,
  stageId,
}: {
  competitionId: string;
  entityId: string;
  previousCompetitionsFromCache?: CompetitionResponseDTO[];
  previousEvent: EventDetailResponseDTO | null;
  stageId: string;
}): Promise<ApiEventRollbackPayload> => ({
  competitionId,
  entityId,
  previousCompetition: null,
  previousCompetitions:
    previousCompetitionsFromCache ?? (await readCompetitionsSnapshot()) ?? null,
  previousEvent,
  stageId,
});

export const commitApiEventMutation = async ({
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
  rollbackPayload: ApiEventRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "event",
    method,
    onCommitted,
    payload,
    rollback: rollbackApiEventPayload,
    rollbackPayload,
    url,
  });

const isApiEventRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is ApiEventRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "competitionId" in rollbackPayload &&
  "entityId" in rollbackPayload &&
  "stageId" in rollbackPayload;

const rollbackApiEventTask = async (task: PendingTask) => {
  if (!isApiEventRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackApiEventPayload(task.rollbackPayload);
};

const rollbackApiEventPayload = async (
  rollbackPayload: ApiEventRollbackPayload,
) => {
  if (rollbackPayload.previousEvent) {
    queryClient.setQueryData(
      getEventByIdQueryKey(rollbackPayload.entityId),
      rollbackPayload.previousEvent,
    );
  } else {
    queryClient.removeQueries({
      queryKey: getEventByIdQueryKey(rollbackPayload.entityId),
    });
  }

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

export const commitApiEventMutationSuccess = async ({
  competitionId,
  eventId,
  method,
  stageId,
}: {
  competitionId: string;
  eventId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  stageId: string;
}) => {
  const visibleCompetitions = getVisibleCompetitions();

  if (method === "DELETE") {
    queryClient.setQueryData<CompetitionResponseDTO[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildCompetitionsListWithoutEvent(
          previousCompetitions ?? [],
          competitionId,
          stageId,
          eventId,
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

const commitApiEventTask = async (task: PendingTask) => {
  if (!isApiEventRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await commitApiEventMutationSuccess({
    competitionId: task.rollbackPayload.competitionId,
    eventId: task.entityId,
    method: task.method,
    stageId: task.rollbackPayload.stageId,
  });
};

const apiEventPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackApiEventTask,
  onSuccess: commitApiEventTask,
};

registerPendingTaskHandler("event", apiEventPendingTaskHandler);

export const applyApiEventUpsert = (
  competitionId: string,
  stageId: string,
  event: EventDetailResponseDTO,
) => {
  queryClient.setQueryData(getEventByIdQueryKey(event.id), event);
  void persistApiEventCompetitionSnapshot(competitionId, stageId, event);
};

export const applyApiEventRemoval = (
  competitionId: string,
  stageId: string,
  eventId: string,
) => {
  queryClient.removeQueries({ queryKey: getEventByIdQueryKey(eventId) });
  void removeApiEventFromCompetitionSnapshot(competitionId, stageId, eventId);
};
