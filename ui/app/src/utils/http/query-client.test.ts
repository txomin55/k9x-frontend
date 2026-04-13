import { afterEach, describe, expect, it, vi } from "vitest";

const refetchQueries = vi.fn();
const addEventListener = vi.fn();
const removeEventListener = vi.fn();
const processPendingTasks = vi.fn();
const getPendingTasksCount = vi.fn();

vi.mock("@tanstack/solid-query", () => ({
  QueryClient: class {
    refetchQueries = refetchQueries;
  },
}));

vi.mock("@/utils/local-first/pending_tasks/pendingTasksRunner", () => ({
  processPendingTasks,
}));

vi.mock("@/utils/local-first/pending_tasks/pendingTasksStore", () => ({
  getPendingTasksCount,
}));

describe("queryClient reconnect refetch", () => {
  afterEach(() => {
    refetchQueries.mockReset();
    addEventListener.mockReset();
    removeEventListener.mockReset();
    processPendingTasks.mockReset();
    getPendingTasksCount.mockReset();
    vi.resetModules();
  });

  it("waits for pending tasks to finish before refetching queries", async () => {
    Object.defineProperty(globalThis, "addEventListener", {
      configurable: true,
      value: addEventListener,
    });
    Object.defineProperty(globalThis, "removeEventListener", {
      configurable: true,
      value: removeEventListener,
    });

    const { setupQueryRefetchOnReconnect } = await import(
      "@/utils/http/query-client"
    );

    const cleanup = setupQueryRefetchOnReconnect();
    const handleOnline = addEventListener.mock.calls[0][1];

    processPendingTasks.mockResolvedValue(undefined);
    getPendingTasksCount.mockResolvedValue(0);

    await handleOnline();

    expect(processPendingTasks).toHaveBeenCalled();
    expect(getPendingTasksCount).toHaveBeenCalled();
    expect(refetchQueries).toHaveBeenCalledWith({
      stale: true,
      type: "all",
    });

    cleanup();

    expect(removeEventListener).toHaveBeenCalledWith("online", handleOnline);
  });

  it("does not refetch queries while pending tasks remain", async () => {
    Object.defineProperty(globalThis, "addEventListener", {
      configurable: true,
      value: addEventListener,
    });
    Object.defineProperty(globalThis, "removeEventListener", {
      configurable: true,
      value: removeEventListener,
    });

    const { setupQueryRefetchOnReconnect } = await import(
      "@/utils/http/query-client"
    );

    const cleanup = setupQueryRefetchOnReconnect();
    const handleOnline = addEventListener.mock.calls[0][1];

    processPendingTasks.mockResolvedValue(undefined);
    getPendingTasksCount.mockResolvedValue(2);

    await handleOnline();

    expect(processPendingTasks).toHaveBeenCalled();
    expect(getPendingTasksCount).toHaveBeenCalled();
    expect(refetchQueries).not.toHaveBeenCalled();

    cleanup();
  });
});
