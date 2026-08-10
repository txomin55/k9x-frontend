import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type {
  PendingTask,
  PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import { createCommitEntityMutation } from "@/services/secured/crudOfflineShared";
import type {
  RankingResponseDTO,
  RankingRollbackPayload,
} from "./rankingCrud.types";
import {
  mergeRankingWithDraft,
  removeRankingDraft,
  replaceRankingDraft,
  upsertRankingDraft,
} from "./rankingDraftStore";
import {
  getRankingQueryKey,
  getRankingSnapshotId,
} from "./rankingCrudConstants";

export const RANKING_ENTITY_TYPE = "ranking";

const getBaseRankingFromCache = (id: string) =>
  queryClient.getQueryData<RankingResponseDTO | null>(getRankingQueryKey(id)) ??
  null;

export const getVisibleRanking = (id: string) =>
  mergeRankingWithDraft(id, getBaseRankingFromCache(id));

export const saveRankingSnapshot = (
  id: string,
  ranking: RankingResponseDTO | null,
) => saveQuerySnapshot(getRankingSnapshotId(id), ranking);

export const readRankingSnapshot = (id: string) =>
  getPersistedQuerySnapshot<RankingResponseDTO | null>(
    getRankingSnapshotId(id),
  );

const syncRankingToCache = (id: string, ranking: RankingResponseDTO | null) => {
  queryClient.setQueryData<RankingResponseDTO | null>(
    getRankingQueryKey(id),
    ranking,
  );
};

/**
 * Optimistic write: overlay first, then persist the snapshot so the change survives a reload while the
 * device is still offline.
 */
export const applyRankingUpsert = (ranking: RankingResponseDTO) => {
  upsertRankingDraft(ranking);
  void saveRankingSnapshot(ranking.rankingId, ranking);
};

export const applyRankingRemoval = (id: string) => {
  removeRankingDraft(id);
  void removeQuerySnapshot(getRankingSnapshotId(id));
};

export const createRankingRollbackPayload = async (
  entityId: string,
  previousRanking: RankingResponseDTO | null,
): Promise<RankingRollbackPayload> => ({
  entityId,
  previousRanking:
    previousRanking ?? (await readRankingSnapshot(entityId)) ?? null,
});

const isRankingRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is RankingRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "entityId" in rollbackPayload;

const rollbackRankingPayload = async (
  rollbackPayload: RankingRollbackPayload,
) => {
  const { entityId, previousRanking } = rollbackPayload;

  if (previousRanking) {
    await saveRankingSnapshot(entityId, previousRanking);
    upsertRankingDraft(previousRanking);
  } else {
    await removeQuerySnapshot(getRankingSnapshotId(entityId));
    removeRankingDraft(entityId);
  }

  replaceRankingDraft(
    entityId,
    previousRanking,
    getBaseRankingFromCache(entityId),
  );
};

/**
 * Promotes the optimistic state to confirmed once the request lands, whether it was sent straight away or
 * replayed from the offline queue.
 */
export const commitRankingMutationSuccess = async ({
  entityId,
  method,
}: {
  entityId: string;
  method: PendingTaskMethod;
}) => {
  if (method === "DELETE") {
    syncRankingToCache(entityId, null);
    await removeQuerySnapshot(getRankingSnapshotId(entityId));
    replaceRankingDraft(entityId, null, null);
    return;
  }

  if (method !== "POST" && method !== "PUT") {
    return;
  }

  const visibleRanking = getVisibleRanking(entityId);

  syncRankingToCache(entityId, visibleRanking);
  replaceRankingDraft(entityId, visibleRanking, visibleRanking);
  await saveRankingSnapshot(entityId, visibleRanking);
};

export const commitRankingMutation =
  createCommitEntityMutation<RankingRollbackPayload>(
    RANKING_ENTITY_TYPE,
    rollbackRankingPayload,
  );

const rollbackRankingTask = async (task: PendingTask) => {
  if (!isRankingRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackRankingPayload(task.rollbackPayload);
};

const commitRankingTask = async (task: PendingTask) => {
  await commitRankingMutationSuccess({
    entityId: task.entityId,
    method: task.method,
  });
};

const rankingPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackRankingTask,
  onSuccess: commitRankingTask,
};

// Without this registration the runner would drop a queued ranking task instead of rolling it back.
registerPendingTaskHandler(RANKING_ENTITY_TYPE, rankingPendingTaskHandler);
