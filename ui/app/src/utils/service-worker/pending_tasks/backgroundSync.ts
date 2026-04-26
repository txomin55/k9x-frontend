export const PENDING_TASKS_SYNC_TAG = "k9x-pending-tasks-sync";
export const PROCESS_PENDING_TASKS_MESSAGE = "PROCESS_PENDING_TASKS";

export const requestPendingTasksBackgroundSync = async () => {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  if (!("sync" in registration)) {
    return false;
  }

  try {
    const syncManager = registration.sync as {
      register: (tag: string) => Promise<void>;
    };
    await syncManager.register(PENDING_TASKS_SYNC_TAG);
    return true;
  } catch {
    return false;
  }
};

export const registerPendingTasksBackgroundSync = (
  scope: ServiceWorkerGlobalScope,
  handler: () => Promise<void>,
) => {
  scope.addEventListener("sync", (event) => {
    if (event.tag !== PENDING_TASKS_SYNC_TAG) {
      return;
    }

    event.waitUntil(
      (async () => {
        const clients = await scope.clients.matchAll({
          includeUncontrolled: true,
          type: "window",
        });

        if (clients.length > 0) {
          clients.forEach((client) => {
            client.postMessage({ type: PROCESS_PENDING_TASKS_MESSAGE });
          });
          return;
        }

        await handler();
      })(),
    );
  });
};
