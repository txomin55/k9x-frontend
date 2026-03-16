function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in globalThis;
}

function notificationsPermission() {
  return Notification.permission;
}

async function initializePushNotifications() {
  return await Notification.requestPermission();
}

async function sendNotification(worker, notification) {
  await worker.showNotification(notification.title, notification.options);
}

export {
  notificationsPermission,
  sendNotification,
  isPushNotificationSupported,
  initializePushNotifications,
};
