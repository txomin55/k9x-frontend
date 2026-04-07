/// <reference lib="webworker" />

import { registerAnimalIconCache } from "@/utils/service-worker/events/animal-icons";
import { registerNotificationClickHandler } from "@/utils/service-worker/events/notification-click";
import {
  APP_SHELL_CACHE,
  registerAppShellCache,
} from "@/utils/service-worker/events/runtime-cache";
import { registerServiceWorkerSetup } from "@/utils/service-worker/events/setup";

declare const self: ServiceWorkerGlobalScope;

registerServiceWorkerSetup(self, {
  cacheNames: [APP_SHELL_CACHE],
});
registerNotificationClickHandler(self);
registerAnimalIconCache(self);
registerAppShellCache(self);
