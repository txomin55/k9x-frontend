import { beforeEach, describe, expect, it, vi } from "vitest";

const getRetryablePendingTasks = vi.hoisted(() => vi.fn());
const removePendingTask = vi.hoisted(() => vi.fn());
const updatePendingTask = vi.hoisted(() => vi.fn());

vi.mock("@/utils/local-first/pending_tasks/pendingTasksStore", () => ({
  getRetryablePendingTasks,
  removePendingTask,
  updatePendingTask,
}));

describe("processPendingTasksInBackground", () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = vi.fn();

  beforeEach(() => {
    getRetryablePendingTasks.mockReset();
    removePendingTask.mockReset();
    updatePendingTask.mockReset();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  it("removes tasks that succeed in the background worker", async () => {
    getRetryablePendingTasks.mockResolvedValue([
      {
        id: "task-1",
        request: {
          body: '{"name":"dog"}',
          headers: { "Content-Type": "application/json" },
          method: "POST",
          url: "https://api.example.test/api/dogs",
        },
      },
    ]);
    updatePendingTask.mockResolvedValue(undefined);
    removePendingTask.mockResolvedValue(undefined);
    fetchMock.mockResolvedValue({ ok: true });

    const { processPendingTasksInBackground } = await import(
      "@/utils/service-worker/pending_tasks/processPendingTasksInBackground"
    );

    await processPendingTasksInBackground();

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/api/dogs", {
      body: '{"name":"dog"}',
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    expect(updatePendingTask).toHaveBeenCalledTimes(1);
    expect(removePendingTask).toHaveBeenCalledWith("task-1", {
      skipPersistenceCheck: true,
    });
  });

  it("marks tasks as failed on network errors", async () => {
    const networkError = new Error("offline");

    getRetryablePendingTasks.mockResolvedValue([
      {
        id: "task-2",
        request: {
          headers: {},
          method: "DELETE",
          url: "https://api.example.test/api/dogs/2",
        },
      },
    ]);
    updatePendingTask.mockResolvedValue(undefined);
    fetchMock.mockRejectedValue(networkError);

    const { processPendingTasksInBackground } = await import(
      "@/utils/service-worker/pending_tasks/processPendingTasksInBackground"
    );

    await expect(processPendingTasksInBackground()).rejects.toThrow("offline");

    expect(updatePendingTask).toHaveBeenCalledTimes(2);
    expect(removePendingTask).not.toHaveBeenCalled();
  });

  it("ignores legacy tasks that do not have a serialized request", async () => {
    getRetryablePendingTasks.mockResolvedValue([
      {
        id: "legacy-task",
      },
    ]);

    const { processPendingTasksInBackground } = await import(
      "@/utils/service-worker/pending_tasks/processPendingTasksInBackground"
    );

    await processPendingTasksInBackground();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(updatePendingTask).not.toHaveBeenCalled();
    expect(removePendingTask).not.toHaveBeenCalled();
  });
});

