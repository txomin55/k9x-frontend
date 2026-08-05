import {
  applySubscribedEventIds,
  commitSubscriptionsMutation,
  getSubscribedEventIds,
} from "@/services/secured/subscriptions/subscriptionsOfflineUtils";
import {
  SUBSCRIPTION_KINDS,
  type SubscriptionKind,
  type UpdateSubscriptionRequestDTO,
} from "@/services/secured/subscriptions/subscriptions.types";

export {
  SUBSCRIPTION_KINDS,
  type SubscriptionKind,
  type UpdateSubscriptionRequestDTO,
} from "@/services/secured/subscriptions/subscriptions.types";

const SUBSCRIPTIONS_ENDPOINT_PATH = "/secured/subscriptions";

const nextEventIds = (current: string[], ids: string[], subscribe: boolean) => {
  const remaining = current.filter((id) => !ids.includes(id));
  return subscribe ? [...remaining, ...ids] : remaining;
};

/**
 * Toggles the subscription to a whole set of resources of one kind in a single request, mirroring the UI: one
 * tap on a stage's bell covers every event of that stage.
 *
 * <p>Optimistic and offline-first like the rest of the mutations: the cached profile is updated up front so
 * the bell reacts instantly, the request is queued when offline (and replayed by the pending-tasks runner),
 * and a rejected request — online or once the queue drains — rolls the profile back.
 */
const updateSubscriptions = async (
  kind: SubscriptionKind,
  ids: string[],
  subscribe: boolean,
) => {
  if (!ids.length) return;

  const previousEventIds = getSubscribedEventIds();

  await applySubscribedEventIds(nextEventIds(previousEventIds, ids, subscribe));

  await commitSubscriptionsMutation({
    entityId: kind,
    method: "PATCH",
    payload: { ids, kind, subscribe } satisfies UpdateSubscriptionRequestDTO,
    rollbackPayload: { previousEventIds },
    url: SUBSCRIPTIONS_ENDPOINT_PATH,
  });
};

const updateEventSubscriptions = (eventIds: string[], subscribe: boolean) =>
  updateSubscriptions(SUBSCRIPTION_KINDS.EVENT, eventIds, subscribe);

export { updateEventSubscriptions, updateSubscriptions };
