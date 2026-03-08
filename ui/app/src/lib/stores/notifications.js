import { writable } from "svelte/store";
import {
  initializePushNotifications,
  isPushNotificationSupported,
  sendNotification,
} from "$lib/utils/native_features/notifications/push-notifications.js";
import mockedNotification from "$lib/components/reload_prompt/mockedNotification.js";

const notificationPermission = writable("default");

const requestNotificationPermission = async () => {
  if (!("Notification" in globalThis)) return;
  if (Notification.permission !== "default") {
    notificationPermission.set(Notification.permission);
    return Notification.permission;
  }

  const result = await initializePushNotifications();
  notificationPermission.set(result);
  return result;
};

const initNotifications = async () => {
  await requestNotificationPermission();
};

const showNotification = async () => {
  alert(`supports push ${isPushNotificationSupported()}`);
  const result = await initializePushNotifications();
  notificationPermission.set(result);

  if (result !== "granted") return;

  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  if (!registration) return;
  sendNotification(registration, mockedNotification);
};

export { initNotifications, notificationPermission, showNotification };
