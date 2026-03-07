import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { handleNotification } from "$lib/utils/native_features/notifications/push-notifications.js";

cleanupOutdatedCaches();

precacheAndRoute(globalThis.__WB_MANIFEST);

globalThis.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    globalThis.skipWaiting();
  }
});

globalThis.addEventListener(
  "notificationclick",
  handleNotification(globalThis.clients),
);
