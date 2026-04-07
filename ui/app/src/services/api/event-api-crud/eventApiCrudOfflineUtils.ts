import {
  getVisibleCompetitions,
  readCompetitionsSnapshot,
  saveCompetitionsSnapshot,
} from "@/services/api/competition-crud/competitionCrudOfflineUtils";
import { getCompetitionsQueryKey } from "@/services/api/competition-crud/competitionCrud";
import type {
  ApiEventRollbackPayload,
  Competition,
  EventResponse,
  Stage,
} from "@/services/api/competition-crud/competitionCrudTypes";
import {
  clearCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/api/competition-crud/competitionDraftStore";
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

const buildNextStageDetail = (stage: Stage, event: EventResponse): Stage => {
  const previousEvents = stage.events ?? [];
  const existingIndex = previousEvents.findIndex(
    ({ id }) => String(id) === String(event.id),
  );

  return {
    ...stage,
    events:
      existingIndex === -1
        ? [...previousEvents, event]
        : previousEvents.map((previousEvent) =>
            String(previousEvent.id) === String(event.id)
              ? event
              : previousEvent,
          ),
  };
};

const buildStageDetailWithoutEvent = (
  stage: Stage,
  eventId: string,
): Stage => ({
  ...stage,
  events: (stage.events ?? []).filter(
    ({ id }) => String(id) !== String(eventId),
  ),
});

const buildNextCompetitionDetail = (
  competition: Competition,
  stageId: string,
  event: EventResponse,
): Competition => ({
  ...competition,
  stages: (competition.stages ?? []).map((stage) =>
    String(stage.id) === String(stageId)
      ? buildNextStageDetail(stage, event)
      : stage,
  ),
});

const buildCompetitionDetailWithoutEvent = (
  competition: Competition,
  stageId: string,
  eventId: string,
): Competition => ({
  ...competition,
  stages: (competition.stages ?? []).map((stage) =>
    String(stage.id) === String(stageId)
      ? buildStageDetailWithoutEvent(stage, eventId)
      : stage,
  ),
});

const buildNextCompetitionsList = (
  competitions: Competition[],
  competitionId: string,
  stageId: string,
  event: EventResponse,
): Competition[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildNextCompetitionDetail(competition, stageId, event)
      : competition,
  );

const buildCompetitionsListWithoutEvent = (
  competitions: Competition[],
  competitionId: string,
  stageId: string,
  eventId: string,
): Competition[] =>
  competitions.map((competition) =>
    String(competition.id) === String(competitionId)
      ? buildCompetitionDetailWithoutEvent(competition, stageId, eventId)
      : competition,
  );

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<Competition[]>(getCompetitionsQueryKey()) ?? [];

const persistApiEventCompetitionSnapshot = async (
  competitionId: string,
  stageId: string,
  event: EventResponse,
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
  previousCompetitionsFromCache?: Competition[];
  previousEvent: EventResponse | null;
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

const isApiEventPayload = (payload: unknown): payload is EventResponse =>
  typeof payload === "object" &&
  payload !== null &&
  "id" in payload &&
  "stageId" in payload;

export const commitApiEventMutationSuccess = async ({
  competitionId,
  eventId,
  method,
  payload,
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
    queryClient.setQueryData<Competition[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildCompetitionsListWithoutEvent(
          previousCompetitions ?? [],
          competitionId,
          stageId,
          eventId,
        ),
    );
  } else if (isApiEventPayload(payload)) {
    queryClient.setQueryData<Competition[] | undefined>(
      getCompetitionsQueryKey(),
      (previousCompetitions) =>
        buildNextCompetitionsList(
          previousCompetitions ?? [],
          competitionId,
          stageId,
          payload,
        ),
    );
  } else {
    return;
  }

  replaceCompetitionDrafts(visibleCompetitions, getBaseCompetitionsFromCache());
  await saveCompetitionsSnapshot(getVisibleCompetitions());
};

const commitApiEventTask = async (task: PendingTask) => {
  if (!isApiEventRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await commitApiEventMutationSuccess({
    competitionId: task.rollbackPayload.competitionId,
    eventId: task.entityId,
    method: task.method,
    payload: task.payload,
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
  event: EventResponse,
) => {
  void persistApiEventCompetitionSnapshot(competitionId, stageId, event);
};

export const applyApiEventRemoval = (
  competitionId: string,
  stageId: string,
  eventId: string,
) => {
  void removeApiEventFromCompetitionSnapshot(competitionId, stageId, eventId);
};
