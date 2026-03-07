import { handleNotification } from "../src/lib/utils/native_features/notifications/push-notifications.js";

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", handleNotification(self.clients));
