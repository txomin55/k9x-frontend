import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import { registerPendingTaskHandler } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import type {
  NotificationsEnabledRequestDTO,
  PushSubscriptionRequestDTO,
} from "@/services/secured/notification-setup/notificationSetup.types";

export type {
  NotificationsEnabledRequestDTO,
  PushSubscriptionRequestDTO,
} from "@/services/secured/notification-setup/notificationSetup.types";

const NOTIFICATION_SETUP_ENDPOINT_PATH = "/secured/set-notification-setup";
const NOTIFICATIONS_ENABLED_ENDPOINT_PATH = "/secured/notification-enabled";
const NOTIFICATION_SETUP_ENTITY_TYPE = "notification-setup";
const NOTIFICATIONS_ENABLED_ENTITY_ID = "account";

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
 * Registers this device as a delivery target. It says nothing about whether the user wants
 * notifications — that is `setNotificationsEnabled` — so it is safe to call on every start.
 * Idempotent: the server keeps a known endpoint as it is.
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

/**
 * Turns notifications on or off for the whole account. Queued when offline under a single entity id,
 * so a burst of toggles collapses into the last intent the user expressed rather than replaying each
 * flip: the account has one state, not one per device.
 */
const setNotificationsEnabled = (payload: NotificationsEnabledRequestDTO) =>
  commitOptimisticMutation({
    entityId: NOTIFICATIONS_ENABLED_ENTITY_ID,
    entityType: NOTIFICATION_SETUP_ENTITY_TYPE,
    method: "PUT",
    payload,
    rollback: () => Promise.resolve(),
    rollbackPayload: null,
    url: NOTIFICATIONS_ENABLED_ENDPOINT_PATH,
  });

export {
  setNotificationSetup,
  setNotificationsEnabled,
  toPushSubscriptionRequest,
};
