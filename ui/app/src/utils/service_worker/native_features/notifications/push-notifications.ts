function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in globalThis;
}

async function initializePushNotifications() {
  return await Notification.requestPermission();
}

async function sendNotification(worker, notification) {
  await worker.showNotification(notification.title, notification.options);
}

export {
  initializePushNotifications,
  sendNotification,
  isPushNotificationSupported,
};
