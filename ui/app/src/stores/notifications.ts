import { createSignal } from "solid-js";
import {
  initializePushNotifications,
  isPushNotificationSupported,
  sendNotification,
} from "@/utils/service_worker/native_features/notifications/push-notifications";
import mockedNotification from "@/utils/service_worker/native_features/notifications/mockedNotification";

const [notificationPermission, setNotificationPermission] =
  createSignal("default");

const requestNotificationPermission = async () => {
  if (!("Notification" in globalThis)) return;
  if (Notification.permission !== "default") {
    setNotificationPermission(Notification.permission);
    return Notification.permission;
  }

  const result = await initializePushNotifications();
  setNotificationPermission(result);
  return result;
};

const initNotifications = async () => {
  await requestNotificationPermission();
};

const showNotification = async () => {
  alert(`supports push ${isPushNotificationSupported()}`);
  const result = await initializePushNotifications();
  setNotificationPermission(result);

  if (result !== "granted") return;

  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  if (!registration) return;

  await sendNotification(registration, mockedNotification);
};

export { initNotifications, notificationPermission, showNotification };
