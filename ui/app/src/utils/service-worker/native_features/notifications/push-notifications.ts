function isPushNotificationSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in globalThis &&
    "Notification" in globalThis
  );
}

function nativeGetNotificationPermission() {
  return Notification.permission;
}

async function nativeRequestNotificationPermission() {
  return await Notification.requestPermission();
}

async function nativeDisplayNotification(
  worker: ServiceWorkerRegistration,
  notification: {
    title: string;
    options?: NotificationOptions;
  },
) {
  await worker.showNotification(notification.title, notification.options);
}

async function nativeGetPushSubscription(worker: ServiceWorkerRegistration) {
  return await worker.pushManager.getSubscription();
}

async function nativeSubscribeToPushManager(
  worker: ServiceWorkerRegistration,
  applicationServerKey: Uint8Array,
) {
  const normalizedApplicationServerKey = new Uint8Array(applicationServerKey);

  return await worker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: normalizedApplicationServerKey,
  });
}

export {
  nativeGetNotificationPermission,
  nativeDisplayNotification,
  nativeGetPushSubscription,
  nativeRequestNotificationPermission,
  nativeSubscribeToPushManager,
  isPushNotificationSupported,
};
