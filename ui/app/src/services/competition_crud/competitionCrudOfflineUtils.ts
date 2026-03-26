import { COMPETITIONS_SNAPSHOT_ID, type Competitions } from "@/services/fetch_competitions/fetchCompetitions";
import {
  processPendingTasks,
  registerPendingTaskHandler,
  type PendingTaskHandler,
} from "@/services/pending_tasks/pendingTasksRunner";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTask,
  type PendingTaskMethod,
} from "@/services/pending_tasks/pendingTasksStore";
import {
  getQuerySnapshot,
  removeQuerySnapshot,
  saveQuerySnapshot,
} from "@/services/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
import { queryClient } from "@/utils/http/query-client";
import type {
  Competition,
  CompetitionLocation,
  CompetitionRollbackPayload,
} from "@/services/competition_crud/competitionCrudTypes";

export const getCompetitionDetailKey = (id: string) =>
  ["competition", id, getCurrentLocale()] as const;

export const getCompetitionsListKey = () =>
  ["competitions", getCurrentLocale()] as const;

export const toCompetitionListItem = (
  competition: Competition,
  previousCompetition?: Competitions,
): Competitions => ({
  country: competition.country,
  description:
    competition.description ?? previousCompetition?.description ?? "",
  id: competition.id,
  location: competition.location
    ? ({
        address: competition.location.address,
        latitude: competition.location.latitude,
        longitude: competition.location.longitude,
      } satisfies CompetitionLocation)
    : previousCompetition?.location,
  name: competition.name,
  stages:
    competition.stages?.map((stage) => ({
      dateFrom: stage.dateFrom,
      dateTo: stage.dateTo,
      id: stage.id,
      name: stage.name,
    })) ??
    previousCompetition?.stages ??
    [],
  status:
    competition.status ??
    previousCompetition?.status ??
    "draft",
});

export const buildNextCompetitions = (
  previousCompetitions: Competitions[],
  competition: Competition,
) => {
  const nextCompetition = toCompetitionListItem(
    competition,
    previousCompetitions.find(({ id }) => id === competition.id),
  );
  const existingIndex = previousCompetitions.findIndex(
    ({ id }) => id === competition.id,
  );

  return existingIndex === -1
    ? [nextCompetition, ...previousCompetitions]
    : previousCompetitions.map((previousCompetition) =>
        previousCompetition.id === competition.id
          ? nextCompetition
          : previousCompetition,
      );
};

export const buildCompetitionsWithoutEntity = (
  previousCompetitions: Competitions[],
  id: string,
) =>
  previousCompetitions.filter(
    (competition) => competition.id !== id,
  );

export const upsertCompetitionInListCache = (competition: Competition) => {
  queryClient.setQueryData<Competitions[] | undefined>(
    getCompetitionsListKey(),
    (previousCompetitions) =>
      previousCompetitions
        ? buildNextCompetitions(previousCompetitions, competition)
        : previousCompetitions,
  );
};

export const removeCompetitionFromListCache = (id: string) => {
  queryClient.setQueryData<Competitions[] | undefined>(
    getCompetitionsListKey(),
    (previousCompetitions) =>
      previousCompetitions
        ? buildCompetitionsWithoutEntity(previousCompetitions, id)
        : previousCompetitions,
  );
};

export const readCompetitionsSnapshot = () =>
  getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID);

export const saveCompetitionsSnapshot = (competitions: Competitions[]) =>
  saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions);

export const persistCompetitionSnapshot = async (competition: Competition) => {
  const previousCompetitions = (await readCompetitionsSnapshot()) ?? [];
  await saveCompetitionsSnapshot(
    buildNextCompetitions(previousCompetitions, competition),
  );
};

export const removeCompetitionSnapshot = async (id: string) => {
  const previousCompetitions = (await readCompetitionsSnapshot()) ?? [];
  await saveCompetitionsSnapshot(
    buildCompetitionsWithoutEntity(previousCompetitions, id),
  );
};

export const createCompetitionRollbackPayload = async (
  entityId: string,
  previousCompetition: Competition | null,
  previousCompetitionsFromCache?: Competitions[],
): Promise<CompetitionRollbackPayload> => ({
  entityId,
  previousCompetition,
  previousCompetitions:
    previousCompetitionsFromCache ??
    (await readCompetitionsSnapshot()) ??
    null,
});

export const queueCompetitionMutation = async ({
  entityId,
  method,
  payload,
  rollbackPayload,
  url,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  rollbackPayload: CompetitionRollbackPayload;
  url: string;
}) => {
  const timestamp = Date.now();

  await enqueuePendingTask({
    attemptCount: 0,
    entityId,
    entityType: "competition",
    id: createPendingTaskId({
      entityId,
      entityType: "competition",
      method,
      timestamp,
    }),
    method,
    payload,
    rollbackPayload,
    status: "pending",
    timestamp,
    updatedAt: timestamp,
    url,
  });

  void processPendingTasks();
};

const isCompetitionRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is CompetitionRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "entityId" in rollbackPayload;

const rollbackCompetitionTask = async (task: PendingTask) => {
  if (!isCompetitionRollbackPayload(task.rollbackPayload)) {
    return;
  }

  const rollbackPayload = task.rollbackPayload;
  const detailKey = getCompetitionDetailKey(rollbackPayload.entityId);
  const listKey = getCompetitionsListKey();

  if (rollbackPayload.previousCompetitions) {
    await saveCompetitionsSnapshot(rollbackPayload.previousCompetitions);
    queryClient.setQueryData(listKey, rollbackPayload.previousCompetitions);
  } else {
    await removeQuerySnapshot(COMPETITIONS_SNAPSHOT_ID);
    queryClient.removeQueries({ queryKey: listKey, exact: true });
  }

  if (rollbackPayload.previousCompetition) {
    queryClient.setQueryData(detailKey, rollbackPayload.previousCompetition);
  } else {
    queryClient.removeQueries({ queryKey: detailKey, exact: true });
  }
};

const competitionPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackCompetitionTask,
};

registerPendingTaskHandler("competition", competitionPendingTaskHandler);

export const applyCompetitionUpsert = (competition: Competition) => {
  queryClient.setQueryData(getCompetitionDetailKey(competition.id), competition);
  upsertCompetitionInListCache(competition);
  void persistCompetitionSnapshot(competition);
};

export const applyCompetitionRemoval = (id: string) => {
  queryClient.removeQueries({ queryKey: getCompetitionDetailKey(id), exact: true });
  removeCompetitionFromListCache(id);
  void removeCompetitionSnapshot(id);
};
