import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { messageListeners, notificationListeners } from "../static/sw-dev.js";

cleanupOutdatedCaches();

precacheAndRoute(globalThis.__WB_MANIFEST);

notificationListeners();
messageListeners();
