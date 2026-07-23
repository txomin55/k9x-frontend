import { rawRequest } from "@/utils/http/client";
import type { PushSubscriptionRequestDTO } from "@/services/secured/notification-setup/notificationSetup.types";

export type { PushSubscriptionRequestDTO } from "@/services/secured/notification-setup/notificationSetup.types";

const NOTIFICATION_SETUP_ENDPOINT_PATH = "/secured/set-notification-setup";

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

const setNotificationSetup = (payload: PushSubscriptionRequestDTO) =>
  rawRequest<string>({
    auth: true,
    body: payload,
    method: "POST",
    path: NOTIFICATION_SETUP_ENDPOINT_PATH,
  });

export { setNotificationSetup, toPushSubscriptionRequest };
