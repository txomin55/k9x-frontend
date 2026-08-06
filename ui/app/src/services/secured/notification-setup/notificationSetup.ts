import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import { registerPendingTaskHandler } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type {
  PushSubscriptionRequestDTO,
  PushUnsubscribeRequestDTO,
} from "@/services/secured/notification-setup/notificationSetup.types";

export type {
  PushSubscriptionRequestDTO,
  PushUnsubscribeRequestDTO,
} from "@/services/secured/notification-setup/notificationSetup.types";

const NOTIFICATION_SETUP_ENDPOINT_PATH = "/secured/set-notification-setup";
const NOTIFICATION_SETUP_REMOVE_ENDPOINT_PATH = "/secured/notification-setup";
const NOTIFICATION_SETUP_ENTITY_TYPE = "notification-setup";

registerPendingTaskHandler(NOTIFICATION_SETUP_ENTITY_TYPE, {});

/**
 * Flattens the browser `PushSubscription` (which nests the keys under
 * `keys: { p256dh, auth }`) into the flat shape the backend expects.
 */
const toPushSubscriptionRequest = (
  subscription: PushSubscription,
): PushSubscriptionRequestDTO | null => {
  const { endpoint, keys } = subscription.toJSON();

  if (!endpoint || !keys?.p256dh || !keys?.auth) return null;

  return { endpoint, p256dh: keys.p256dh, auth: keys.auth };
};

/**
 * Both calls are queued when offline: by then the browser-side subscription is already created or
 * destroyed, so the server registration is the only part left to catch up. The endpoint is the entity
 * id, and queued tasks replay in timestamp order, so a toggle sequence on one device reaches the server
 * in the order the user performed it.
 */
const setNotificationSetup = (payload: PushSubscriptionRequestDTO) =>
  commitOptimisticMutation({
    entityId: payload.endpoint,
    entityType: NOTIFICATION_SETUP_ENTITY_TYPE,
    method: "POST",
    payload,
    rollback: () => Promise.resolve(),
    rollbackPayload: null,
    url: NOTIFICATION_SETUP_ENDPOINT_PATH,
  });

const removeNotificationSetup = (payload: PushUnsubscribeRequestDTO) =>
  commitOptimisticMutation({
    entityId: payload.endpoint,
    entityType: NOTIFICATION_SETUP_ENTITY_TYPE,
    method: "DELETE",
    payload,
    rollback: () => Promise.resolve(),
    rollbackPayload: null,
    // The endpoint URL is the only identifier of the subscription and does not fit in a path segment.
    sendsBody: true,
    url: NOTIFICATION_SETUP_REMOVE_ENDPOINT_PATH,
  });

export {
  removeNotificationSetup,
  setNotificationSetup,
  toPushSubscriptionRequest,
};
