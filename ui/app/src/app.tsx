import { QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider } from "@tanstack/solid-router";
import { onCleanup, onMount } from "solid-js";
import { router } from "@/router";
import { setupPendingTasksProcessing } from "@/utils/local_first/pending_tasks/pendingTasksRunner";
import {
  queryClient,
  setupQueryRefetchOnReconnect,
} from "@/utils/http/query-client";
import "@/app.css";

export default function App() {
  onMount(() => {
    const cleanupPendingTasksProcessing = setupPendingTasksProcessing();
    const cleanupQueryRefetchOnReconnect = setupQueryRefetchOnReconnect();
    onCleanup(cleanupPendingTasksProcessing);
    onCleanup(cleanupQueryRefetchOnReconnect);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
