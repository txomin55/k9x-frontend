/// <reference lib="webworker" />

import { registerAnimalIconCache } from "@/utils/service_worker/events/animal-icons";
import { registerNotificationClickHandler } from "@/utils/service_worker/events/notification-click";
import {
  APP_SHELL_CACHE,
  registerAppShellCache,
} from "@/utils/service_worker/events/runtime-cache";
import { registerServiceWorkerSetup } from "@/utils/service_worker/events/setup";

declare const self: ServiceWorkerGlobalScope;

registerServiceWorkerSetup(self, {
  cacheNames: [APP_SHELL_CACHE],
});
registerNotificationClickHandler(self);
registerAnimalIconCache(self);
registerAppShellCache(self);
