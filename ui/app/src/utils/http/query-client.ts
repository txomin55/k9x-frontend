import { QueryClient } from "@tanstack/solid-query";
import { processPendingTasks } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import { getPendingTasksCount } from "@/utils/local-first/pending_tasks/pendingTasksStore";
import { PROCESS_PENDING_TASKS_MESSAGE } from "@/utils/service-worker/pending_tasks/backgroundSync";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

let currentReconnectPromise: Promise<void> | undefined;

export const runReconnectPipeline = () => {
  if (currentReconnectPromise) {
    return currentReconnectPromise;
  }

  currentReconnectPromise = (async () => {
    await processPendingTasks();

    if ((await getPendingTasksCount()) > 0) {
      return;
    }

    await queryClient.refetchQueries({
      stale: true,
      type: "all",
    });
  })().finally(() => {
    currentReconnectPromise = undefined;
  });

  return currentReconnectPromise;
};

export const setupQueryRefetchOnReconnect = () => {
  const handleOnline = () => {
    return runReconnectPipeline();
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    if (event.data?.type !== PROCESS_PENDING_TASKS_MESSAGE) {
      return;
    }

    return runReconnectPipeline();
  };

  globalThis.addEventListener("online", handleOnline);
  globalThis.navigator.serviceWorker?.addEventListener(
    "message",
    handleServiceWorkerMessage,
  );

  return () => {
    globalThis.removeEventListener("online", handleOnline);
    globalThis.navigator.serviceWorker?.removeEventListener(
      "message",
      handleServiceWorkerMessage,
    );
  };
};
