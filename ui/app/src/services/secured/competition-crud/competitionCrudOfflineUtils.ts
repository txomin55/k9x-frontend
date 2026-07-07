import {
  COMPETITIONS_SNAPSHOT_ID,
  getCompetitionsQueryKey,
} from "@/services/secured/competition-crud/competitionCrud";
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
  CompetitionResponseDTO,
  CompetitionRollbackPayload,
} from "@/services/secured/competition-crud/competitionCrud.types";
import {
  mergeCompetitionsWithDrafts,
  removeCompetitionDraft,
  replaceCompetitionDrafts,
  upsertCompetitionDraft,
} from "@/services/secured/competition-crud/competitionDraftStore";
import { createCommitEntityMutation } from "@/services/secured/crudOfflineShared";

export const buildCompetitionsWithoutEntity = (
  previousCompetitions: CompetitionResponseDTO[],
  id: string,
) => previousCompetitions.filter((competition) => competition.id !== id);

const getBaseCompetitionsFromCache = () =>
  queryClient.getQueryData<CompetitionResponseDTO[]>(getCompetitionsQueryKey()) ??
  [];

export const getVisibleCompetitions = () =>
  mergeCompetitionsWithDrafts(getBaseCompetitionsFromCache());

const syncCompetitionRemovalToCache = (id: string) => {
  queryClient.setQueryData<CompetitionResponseDTO[] | undefined>(
    getCompetitionsQueryKey(),
    (previousCompetitions) =>
      buildCompetitionsWithoutEntity(previousCompetitions ?? [], id),
  );
};

const syncCompetitionsToCache = (competitions: CompetitionResponseDTO[]) => {
  queryClient.setQueryData<CompetitionResponseDTO[]>(
    getCompetitionsQueryKey(),
    competitions,
  );
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
    getPersistedQuerySnapshot<CompetitionResponseDTO[]>(COMPETITIONS_SNAPSHOT_ID),
  );

export const saveCompetitionsSnapshot = (competitions: CompetitionResponseDTO[]) =>
  removeQuerySnapshotsByPrefix("competition:").then(() =>
    saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, competitions),
  );

export const createCompetitionRollbackPayload = async (
  entityId: string,
  previousCompetition: CompetitionResponseDTO | null,
  previousCompetitionsFromCache?: CompetitionResponseDTO[],
): Promise<CompetitionRollbackPayload> => ({
  entityId,
  previousCompetition,
  previousCompetitions:
    previousCompetitionsFromCache ?? (await readCompetitionsSnapshot()) ?? null,
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

export const commitCompetitionMutation =
  createCommitEntityMutation<CompetitionRollbackPayload>(
    "competition",
    rollbackCompetitionPayload,
  );

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

export const applyCompetitionUpsert = (competition: CompetitionResponseDTO) => {
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
