/// <reference lib="webworker" />

import { registerNotificationClickHandler } from "@/utils/service-worker/events/notification-click";
import { registerPushHandler } from "@/utils/service-worker/events/push";
import {
  APP_SHELL_CACHE,
  registerAppShellCache,
} from "@/utils/service-worker/events/runtime-cache";
import { registerServiceWorkerSetup } from "@/utils/service-worker/events/setup";
import { processPendingTasksInBackground } from "@/utils/service-worker/pending_tasks/processPendingTasksInBackground";
import { registerPendingTasksBackgroundSync } from "@/utils/service-worker/pending_tasks/backgroundSync";

declare const self: ServiceWorkerGlobalScope;

registerServiceWorkerSetup(self, {
  cacheNames: [APP_SHELL_CACHE],
});
registerNotificationClickHandler(self);
registerPushHandler(self);
registerAppShellCache(self);
registerPendingTasksBackgroundSync(self, processPendingTasksInBackground);
