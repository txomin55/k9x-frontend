import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { handleNotification } from "@/utils/native_features/notifications/push-notifications";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("notificationclick", handleNotification(self.clients));
