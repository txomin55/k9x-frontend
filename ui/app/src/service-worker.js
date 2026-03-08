import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { handleNotification } from "./lib/utils/native_features/notifications/push-notifications.js";

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", handleNotification(self.clients));
