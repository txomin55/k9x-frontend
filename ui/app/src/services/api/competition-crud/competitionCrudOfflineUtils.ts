import {
  COMPETITIONS_SNAPSHOT_ID,
  getCompetitionsQueryKey,
} from "@/services/api/competition-crud/competitionCrud";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import {
  type PendingTask,
  type PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import type {
  Competition,
  CompetitionLocation,
  CompetitionRollbackPayload,
} from "@/services/api/competition-crud/competitionCrud.types";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import {
  mergeCompetitionsWithDrafts,
  removeCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/api/competition-crud/competitionDraftStore";

export const toCompetitionListItem = (
  competition: Competition,
  previousCompetition?: Competition,
): Competition => ({
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
  previousCompetitions: Competition[],
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
  previousCompetitions: Competition[],
  id: string,
) => previousCompetitions.filter((competition) => competition.id !== id);

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<Competition[]>(getCompetitionsQueryKey()) ?? [];

export const getVisibleCompetitions = () =>
  mergeCompetitionsWithDrafts(getBaseCompetitionsFromCache());

const syncCompetitionRemovalToCache = (id: string) => {
  queryClient.setQueryData<Competition[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) =>
      buildCompetitionsWithoutEntity(previousCompetitions ?? [], id),
  );
};

const syncCompetitionsToCache = (competitions: Competition[]) => {
  queryClient.setQueryData<Competition[]>(getCompetitionsQueryKey(), competitions);
};

export const commitCompetitionMutationSuccess = async ({
  entityId,
  method,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
}) => {
  const visibleCompetitions = getVisibleCompetitions();

  if (method === "DELETE") {
    syncCompetitionRemovalToCache(entityId);
  } else if (method === "POST" || method === "PUT") {
    syncCompetitionsToCache(visibleCompetitions);
  } else {
    return;
  }

  const nextBaseCompetitions = getBaseCompetitionsFromCache();

  replaceCompetitionDrafts(visibleCompetitions, nextBaseCompetitions);
  await saveCompetitionsSnapshot(nextBaseCompetitions);
};

export const readCompetitionsSnapshot = () =>
  removeQuerySnapshotsByPrefix("competition:").then(() =>
    getPersistedQuerySnapshot<Competition[]>(COMPETITIONS_SNAPSHOT_ID),
  );

export const saveCompetitionsSnapshot = (competitions: Competition[]) =>
  removeQuerySnapshotsByPrefix("competition:").then(() =>
    saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions),
  );

export const createCompetitionRollbackPayload = async (
  entityId: string,
  previousCompetition: Competition | null,
  previousCompetitionsFromCache?: Competition[],
): Promise<CompetitionRollbackPayload> => ({
  entityId,
  previousCompetition,
  previousCompetitions:
    previousCompetitionsFromCache ?? (await readCompetitionsSnapshot()) ?? null,
});

export const commitCompetitionMutation = async ({
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
  rollbackPayload: CompetitionRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "competition",
    method,
    onCommitted,
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
    syncCompetitionsToCache(rollbackPayload.previousCompetitions);
    replaceCompetitionDrafts(
      rollbackPayload.previousCompetitions,
      rollbackPayload.previousCompetitions,
    );
  } else {
    await removeQuerySnapshot(COMPETITIONS_SNAPSHOT_ID);
    syncCompetitionsToCache([]);
    replaceCompetitionDrafts([], getBaseCompetitionsFromCache());
  }
};

const commitCompetitionTask = async (task: PendingTask) => {
  await commitCompetitionMutationSuccess({
    entityId: task.entityId,
    method: task.method,
  });
};

const competitionPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackCompetitionTask,
  onSuccess: commitCompetitionTask,
};

registerPendingTaskHandler("competition", competitionPendingTaskHandler);

export const applyCompetitionUpsert = (competition: Competition) => {
  upsertCompetitionDraft(competition);
  const visibleCompetitions = getVisibleCompetitions();

  syncCompetitionsToCache(visibleCompetitions);
  void saveCompetitionsSnapshot(visibleCompetitions);
};

export const applyCompetitionRemoval = (id: string) => {
  removeCompetitionDraft(id);
  const visibleCompetitions = getVisibleCompetitions();

  syncCompetitionsToCache(visibleCompetitions);
  void saveCompetitionsSnapshot(visibleCompetitions);
};
