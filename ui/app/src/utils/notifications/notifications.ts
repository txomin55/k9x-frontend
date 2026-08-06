import {
  isPushNotificationSupported,
  nativeGetNotificationPermission,
  nativeGetPushSubscription,
  nativeRequestNotificationPermission,
  nativeSubscribeToPushManager,
  nativeUnsubscribeFromPushManager,
} from "@/utils/service-worker/native_features/notifications/push-notifications";

const requestNotificationPermission = async () => {
  if (!isPushNotificationSupported()) return "denied";

  if (nativeGetNotificationPermission() !== "default") {
    return nativeGetNotificationPermission();
  }

  return await nativeRequestNotificationPermission();
};

const subscribeToPushNotifications = async (
  applicationServerKey: Uint8Array,
) => {
  if (!isPushNotificationSupported()) return null;

  if (nativeGetNotificationPermission() !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) return null;

  const existingSubscription = await nativeGetPushSubscription(registration);
  if (existingSubscription) {
    return existingSubscription;
  }

  return await nativeSubscribeToPushManager(registration, applicationServerKey);
};

const enablePushNotifications = async (applicationServerKey: Uint8Array) => {
  const permission = await requestNotificationPermission();

  if (permission !== "granted") {
    return {
      permission,
      subscription: null,
    };
  }

  const subscription = await subscribeToPushNotifications(applicationServerKey);

  return {
    permission,
    subscription,
  };
};

const getPushNotificationsState = async () => {
  if (!isPushNotificationSupported()) {
    return { permission: "denied" as NotificationPermission, subscription: null };
  }

  const permission = nativeGetNotificationPermission();

  if (permission !== "granted") {
    return { permission, subscription: null };
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = registration
    ? await nativeGetPushSubscription(registration)
    : null;

  return { permission, subscription };
};

/**
 * Returns the endpoint that was unsubscribed, or `null` when there was nothing to unsubscribe. The
 * endpoint is read before the subscription is dropped because it is the only way the server can tell
 * which device to forget.
 */
const unsubscribeFromPushNotifications = async () => {
  if (!isPushNotificationSupported()) return null;

  const registration = await navigator.serviceWorker.ready;
  if (!registration) return null;

  const subscription = await nativeGetPushSubscription(registration);
  if (!subscription) return null;

  const { endpoint } = subscription;

  await nativeUnsubscribeFromPushManager(subscription);

  return endpoint;
};

export {
  requestNotificationPermission,
  enablePushNotifications,
  getPushNotificationsState,
  isPushNotificationSupported,
  unsubscribeFromPushNotifications,
};
