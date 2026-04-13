import { QueryClient } from "@tanstack/solid-query";
import { processPendingTasks } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import { getPendingTasksCount } from "@/utils/local-first/pending_tasks/pendingTasksStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const setupQueryRefetchOnReconnect = () => {
  const handleOnline = async () => {
    await processPendingTasks();

    if ((await getPendingTasksCount()) > 0) {
      return;
    }

    await queryClient.refetchQueries({
      stale: true,
      type: "all",
    });
  };

  globalThis.addEventListener("online", handleOnline);

  return () => {
    globalThis.removeEventListener("online", handleOnline);
  };
};
