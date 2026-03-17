import {
  initializePushNotifications,
  isPushNotificationSupported,
  notificationsPermission,
  sendNotification,
} from "@/utils/service_worker/native_features/notifications/push-notifications";
import mockedNotification from "@/utils/service_worker/native_features/notifications/mockedNotification";

const requestNotificationPermission = async () => {
  if (notificationsPermission() !== "default") {
    return notificationsPermission();
  }

  return await initializePushNotifications();
};

const initNotifications = async () => {
  await requestNotificationPermission();
};

const showNotification = async () => {
  if (!isPushNotificationSupported() || notificationsPermission() !== "granted")
    return;

  const registration = await navigator.serviceWorker.ready;
  if (!registration) return;

  await sendNotification(registration, mockedNotification);
};

export { initNotifications, showNotification };
