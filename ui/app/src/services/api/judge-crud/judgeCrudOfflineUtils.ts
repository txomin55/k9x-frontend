import { registerPendingTaskHandler, type PendingTaskHandler } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type {
  PendingTask,
  PendingTaskMethod,
} from "@/utils/local-first/pending_tasks/pendingTasksStore";
import {
  getPersistedQuerySnapshot,
  removeQuerySnapshot,
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import type { Judge, JudgeRollbackPayload } from "./judgeCrudTypes";
import { mergeJudgesWithDrafts, removeJudgeDraft, replaceJudgeDrafts, upsertJudgeDraft } from "./judgeDraftStore";
import { getJudgesQueryKey, JUDGES_SNAPSHOT_ID } from "./judgeCrudConstants";

const JUDGE_SNAPSHOT_PREFIX = "judge:";

export const toJudgeListItem = (
  judge: Judge,
  previousJudge?: Judge,
): Judge => ({
  id: judge.id,
  name: judge.name ?? previousJudge?.name ?? "",
});

export const buildNextJudges = (
  previousJudges: Judge[],
  judge: Judge,
) => {
  const nextJudge = toJudgeListItem(
    judge,
    previousJudges.find(({ id }) => id === judge.id),
  );
  const existingIndex = previousJudges.findIndex(
    ({ id }) => id === judge.id,
  );

  return existingIndex === -1
    ? [nextJudge, ...previousJudges]
    : previousJudges.map((previousJudge) =>
        previousJudge.id === judge.id ? nextJudge : previousJudge,
      );
};

export const buildJudgesWithoutEntity = (
  previousJudges: Judge[],
  id: string,
) => previousJudges.filter((judge) => judge.id !== id);

const getBaseJudgesFromCache = () =>
  queryClient.getQueryData<Judge[]>(getJudgesQueryKey()) ?? [];

export const getVisibleJudges = () =>
  mergeJudgesWithDrafts(getBaseJudgesFromCache());

const syncJudgeUpsertToCache = (judge: Judge) => {
  queryClient.setQueryData<Judge[] | undefined>(
    getJudgesQueryKey(),
    (previousJudges) =>
      buildNextJudges(previousJudges ?? [], judge),
  );
};

const syncJudgeRemovalToCache = (id: string) => {
  queryClient.setQueryData<Judge[] | undefined>(
    getJudgesQueryKey(),
    (previousJudges) =>
      buildJudgesWithoutEntity(previousJudges ?? [], id),
  );
};

export const commitJudgeMutationSuccess = async ({
  entityId,
  method,
  payload,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
}) => {
  const visibleJudges = getVisibleJudges();

  if (method === "DELETE") {
    syncJudgeRemovalToCache(entityId);
  } else if (isJudgePayload(payload)) {
    syncJudgeUpsertToCache(payload);
  } else {
    return;
  }

  replaceJudgeDrafts(visibleJudges, getBaseJudgesFromCache());
  await saveJudgesSnapshot(getVisibleJudges());
};

export const readJudgesSnapshot = () =>
  removeQuerySnapshotsByPrefix(JUDGE_SNAPSHOT_PREFIX).then(() =>
    getPersistedQuerySnapshot<Judge[]>(JUDGES_SNAPSHOT_ID),
  );

export const saveJudgesSnapshot = (judges: Judge[]) =>
  removeQuerySnapshotsByPrefix(JUDGE_SNAPSHOT_PREFIX).then(() =>
    saveQuerySnapshot(JUDGES_SNAPSHOT_ID, judges),
  );

export const createJudgeRollbackPayload = async (
  entityId: string,
  previousJudge: Judge | null,
  previousJudgesFromCache?: Judge[],
): Promise<JudgeRollbackPayload> => ({
  entityId,
  previousJudge,
  previousJudges:
    previousJudgesFromCache ?? (await readJudgesSnapshot()) ?? null,
});

export const commitJudgeMutation = async ({
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
  rollbackPayload: JudgeRollbackPayload;
  url: string;
}) =>
  commitOptimisticMutation({
    entityId,
    entityType: "judge",
    method,
    onCommitted,
    payload,
    rollback: rollbackJudgePayload,
    rollbackPayload,
    url,
  });

const isJudgeRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is JudgeRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "entityId" in rollbackPayload;

const rollbackJudgeTask = async (task: PendingTask) => {
  if (!isJudgeRollbackPayload(task.rollbackPayload)) {
    return;
  }

  await rollbackJudgePayload(task.rollbackPayload);
};

const rollbackJudgePayload = async (
  rollbackPayload: JudgeRollbackPayload,
) => {
  if (rollbackPayload.previousJudges) {
    await saveJudgesSnapshot(rollbackPayload.previousJudges);
    replaceJudgeDrafts(
      rollbackPayload.previousJudges,
      getBaseJudgesFromCache(),
    );
  } else {
    await removeQuerySnapshot(JUDGES_SNAPSHOT_ID);
    replaceJudgeDrafts([], getBaseJudgesFromCache());
  }
};

const isJudgePayload = (payload: unknown): payload is Judge =>
  typeof payload === "object" && payload !== null && "id" in payload;

const commitJudgeTask = async (task: PendingTask) => {
  await commitJudgeMutationSuccess({
    entityId: task.entityId,
    method: task.method,
    payload: task.payload,
  });
};

const judgePendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackJudgeTask,
  onSuccess: commitJudgeTask,
};

registerPendingTaskHandler("judge", judgePendingTaskHandler);

export const applyJudgeUpsert = (judge: Judge) => {
  upsertJudgeDraft(judge);
  void saveJudgesSnapshot(buildNextJudges(getVisibleJudges(), judge));
};

export const applyJudgeRemoval = (id: string) => {
  removeJudgeDraft(id);
  void saveJudgesSnapshot(
    buildJudgesWithoutEntity(getVisibleJudges(), id),
  );
};
