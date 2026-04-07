import {
  isPushNotificationSupported,
  nativeDisplayNotification,
  nativeGetNotificationPermission,
  nativeGetPushSubscription,
  nativeRequestNotificationPermission,
  nativeSubscribeToPushManager,
} from "@/utils/service-worker/native_features/notifications/push-notifications";

const requestNotificationPermission = async () => {
  if (!isPushNotificationSupported()) return "denied";

  if (nativeGetNotificationPermission() !== "default") {
    return nativeGetNotificationPermission();
  }

  return await nativeRequestNotificationPermission();
};

const displayNotification = async (payload) => {
  if (
    !isPushNotificationSupported() ||
    nativeGetNotificationPermission() !== "granted"
  ) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) return;

  await nativeDisplayNotification(registration, payload);
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

export {
  requestNotificationPermission,
  displayNotification,
  enablePushNotifications,
};
