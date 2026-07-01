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
  removeQuerySnapshotsByPrefix,
  saveQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import { queryClient } from "@/utils/http/query-client";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import type { JudgeResponseDTO, JudgeRollbackPayload } from "./judgeCrud.types";
import {
  mergeJudgesWithDrafts,
  removeJudgeDraft,
  replaceJudgeDrafts,
  upsertJudgeDraft,
} from "./judgeDraftStore";
import { getJudgesQueryKey, JUDGES_SNAPSHOT_ID } from "./judgeCrudConstants";

const JUDGE_SNAPSHOT_PREFIX = "judge:";

export const toJudgeListItem = (
  judge: JudgeResponseDTO,
  previousJudge?: JudgeResponseDTO,
): JudgeResponseDTO => ({
  id: judge.id,
  name: judge.name ?? previousJudge?.name ?? "",
  country: judge.country ?? previousJudge?.country ?? "",
});

export const buildNextJudges = (
  previousJudges: JudgeResponseDTO[],
  judge: JudgeResponseDTO,
) => {
  const nextJudge = toJudgeListItem(
    judge,
    previousJudges.find(({ id }) => id === judge.id),
  );
  const existingIndex = previousJudges.findIndex(({ id }) => id === judge.id);

  return existingIndex === -1
    ? [nextJudge, ...previousJudges]
    : previousJudges.map((previousJudge) =>
        previousJudge.id === judge.id ? nextJudge : previousJudge,
      );
};

export const buildJudgesWithoutEntity = (previousJudges: JudgeResponseDTO[], id: string) =>
  previousJudges.filter((judge) => judge.id !== id);

const getBaseJudgesFromCache = () =>
  queryClient.getQueryData<JudgeResponseDTO[]>(getJudgesQueryKey()) ?? [];

export const getVisibleJudges = () =>
  mergeJudgesWithDrafts(getBaseJudgesFromCache());

const syncJudgeRemovalToCache = (id: string) => {
  queryClient.setQueryData<JudgeResponseDTO[] | undefined>(
    getJudgesQueryKey(),
    (previousJudges) => buildJudgesWithoutEntity(previousJudges ?? [], id),
  );
};

const syncJudgesToCache = (judges: JudgeResponseDTO[]) => {
  queryClient.setQueryData<JudgeResponseDTO[]>(getJudgesQueryKey(), judges);
};

export const commitJudgeMutationSuccess = async ({
  entityId,
  method,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
}) => {
  const visibleJudges = getVisibleJudges();

  if (method === "DELETE") {
    syncJudgeRemovalToCache(entityId);
  } else if (method === "POST" || method === "PUT") {
    syncJudgesToCache(visibleJudges);
  } else {
    return;
  }

  const nextBaseJudges = getBaseJudgesFromCache();

  replaceJudgeDrafts(visibleJudges, nextBaseJudges);
  await saveJudgesSnapshot(nextBaseJudges);
};

export const readJudgesSnapshot = () =>
  removeQuerySnapshotsByPrefix(JUDGE_SNAPSHOT_PREFIX).then(() =>
    getPersistedQuerySnapshot<JudgeResponseDTO[]>(JUDGES_SNAPSHOT_ID),
  );

export const saveJudgesSnapshot = (judges: JudgeResponseDTO[]) =>
  removeQuerySnapshotsByPrefix(JUDGE_SNAPSHOT_PREFIX).then(() =>
    saveQuerySnapshot(JUDGES_SNAPSHOT_ID, judges),
  );

export const createJudgeRollbackPayload = async (
  entityId: string,
  previousJudge: JudgeResponseDTO | null,
  previousJudgesFromCache?: JudgeResponseDTO[],
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

const rollbackJudgePayload = async (rollbackPayload: JudgeRollbackPayload) => {
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

const commitJudgeTask = async (task: PendingTask) => {
  await commitJudgeMutationSuccess({
    entityId: task.entityId,
    method: task.method,
  });
};

const judgePendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackJudgeTask,
  onSuccess: commitJudgeTask,
};

registerPendingTaskHandler("judge", judgePendingTaskHandler);

export const applyJudgeUpsert = (judge: JudgeResponseDTO) => {
  upsertJudgeDraft(judge);
  void saveJudgesSnapshot(buildNextJudges(getVisibleJudges(), judge));
};

export const applyJudgeRemoval = (id: string) => {
  removeJudgeDraft(id);
  void saveJudgesSnapshot(buildJudgesWithoutEntity(getVisibleJudges(), id));
};
