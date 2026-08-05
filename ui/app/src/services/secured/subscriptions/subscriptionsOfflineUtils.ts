import { createCommitEntityMutation } from "@/services/secured/crudOfflineShared";
import {
  getUserQueryKey,
  USER_SNAPSHOT_ID,
  type UserProfileResponseDTO,
} from "@/services/secured/fetch-user-data/fetchUserData";
import { getAuthUser, setUser } from "@/stores/auth/auth";
import { queryClient } from "@/utils/http/query-client";
import {
  type PendingTaskHandler,
  registerPendingTaskHandler,
} from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type { PendingTask } from "@/utils/local-first/pending_tasks/pendingTasksStore";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";

export const SUBSCRIPTIONS_ENTITY_TYPE = "subscriptions";

export interface SubscriptionsRollbackPayload {
  previousEventIds: string[];
}

/** The profile from the query cache, falling back to the auth store when the query has been garbage-collected. */
const readCachedUser = () =>
  queryClient.getQueryData<UserProfileResponseDTO>(getUserQueryKey()) ??
  getAuthUser();

export const getSubscribedEventIds = () =>
  readCachedUser()?.subscriptions?.eventIds ?? [];

/**
 * Writes the new subscription list everywhere the profile lives: the query cache (what the bell reads), the
 * auth store (the same object, held separately) and the offline snapshot, so a reload with no connection
 * still shows the toggled state instead of the pre-toggle one.
 */
export const applySubscribedEventIds = async (eventIds: string[]) => {
  const user = readCachedUser();

  if (!user) return;

  const updated: UserProfileResponseDTO = {
    ...user,
    subscriptions: { ...user.subscriptions, eventIds },
  };

  queryClient.setQueryData<UserProfileResponseDTO>(getUserQueryKey(), updated);
  setUser(updated);
  await saveQuerySnapshot(USER_SNAPSHOT_ID, updated);
};

const rollbackSubscriptionsPayload = async ({
  previousEventIds,
}: SubscriptionsRollbackPayload) => {
  await applySubscribedEventIds(previousEventIds);
};

export const commitSubscriptionsMutation =
  createCommitEntityMutation<SubscriptionsRollbackPayload>(
    SUBSCRIPTIONS_ENTITY_TYPE,
    rollbackSubscriptionsPayload,
  );

const isSubscriptionsRollbackPayload = (
  rollbackPayload: unknown,
): rollbackPayload is SubscriptionsRollbackPayload =>
  typeof rollbackPayload === "object" &&
  rollbackPayload !== null &&
  "previousEventIds" in rollbackPayload;

/**
 * A queued toggle that the server ends up rejecting (e.g. the event finished meanwhile) is undone from the
 * snapshot it was optimistically written to, so the bell stops lying as soon as the queue drains.
 */
const rollbackSubscriptionsTask = async (task: PendingTask) => {
  if (!isSubscriptionsRollbackPayload(task.rollbackPayload)) return;

  await rollbackSubscriptionsPayload(task.rollbackPayload);
};

const subscriptionsPendingTaskHandler: PendingTaskHandler = {
  onHttpError: rollbackSubscriptionsTask,
};

registerPendingTaskHandler(
  SUBSCRIPTIONS_ENTITY_TYPE,
  subscriptionsPendingTaskHandler,
);
