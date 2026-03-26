import {
  type Competitions,
  COMPETITIONS_SNAPSHOT_ID,
  getCompetitionsQueryKey,
} from "@/services/api/competition_crud/competitionCrud";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local_first/pending_tasks/pendingTasksRunner";
import {
  type PendingTask,
  type PendingTaskMethod,
} from "@/utils/local_first/pending_tasks/pendingTasksStore";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local_first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import type {
  Competition,
  CompetitionLocation,
  CompetitionRollbackPayload,
} from "@/services/api/competition_crud/competitionCrudTypes";
import { commitOptimisticMutation } from "@/utils/local_first/pending_tasks/commitOptimisticMutation";

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
  notifications:
    competition.notifications ?? previousCompetition?.notifications,
  stages: competition.stages ?? previousCompetition?.stages ?? [],
  status: competition.status ?? previousCompetition?.status ?? "draft",
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
) => previousCompetitions.filter((competition) => competition.id !== id);

export const upsertCompetitionInListCache = (competition: Competition) => {
  queryClient.setQueryData<Competitions[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) =>
      previousCompetitions
        ? buildNextCompetitions(previousCompetitions, competition)
        : previousCompetitions,
  );
};

export const removeCompetitionFromListCache = (id: string) => {
  queryClient.setQueryData<Competitions[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) =>
      previousCompetitions
        ? buildCompetitionsWithoutEntity(previousCompetitions, id)
        : previousCompetitions,
  );
};

export const readCompetitionsSnapshot = () =>
  removeQuerySnapshotsByPrefix("competition:").then(() =>
    getPersistedQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID),
  );

export const saveCompetitionsSnapshot = (competitions: Competitions[]) =>
  removeQuerySnapshotsByPrefix("competition:").then(() =>
    saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions),
  );

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
    previousCompetitionsFromCache ?? (await readCompetitionsSnapshot()) ?? null,
});

export const commitCompetitionMutation = async ({
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
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "competition",
    method,
    payload,
    rollback: rollbackCompetitionPayload,
    rollbackPayload,
    url,
  });

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

  await rollbackCompetitionPayload(task.rollbackPayload);
};

const rollbackCompetitionPayload = async (
  rollbackPayload: CompetitionRollbackPayload,
) => {
  if (rollbackPayload.previousCompetitions) {
    await saveCompetitionsSnapshot(rollbackPayload.previousCompetitions);
    queryClient.setQueryData(
      getCompetitionsQueryKey(),
      rollbackPayload.previousCompetitions,
    );
  } else {
    await removeQuerySnapshot(COMPETITIONS_SNAPSHOT_ID);
    queryClient.removeQueries({
      queryKey: getCompetitionsQueryKey(),
      exact: true,
    });
  }
};

const competitionPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackCompetitionTask,
};

registerPendingTaskHandler("competition", competitionPendingTaskHandler);

export const applyCompetitionUpsert = (competition: Competition) => {
  upsertCompetitionInListCache(competition);
  void persistCompetitionSnapshot(competition);
};

export const applyCompetitionRemoval = (id: string) => {
  removeCompetitionFromListCache(id);
  void removeCompetitionSnapshot(id);
};
