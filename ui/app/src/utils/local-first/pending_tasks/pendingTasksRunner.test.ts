import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const rawRequest = vi.fn();
const getRetryablePendingTasks = vi.fn();
const removePendingTask = vi.fn();
const updatePendingTask = vi.fn();

class HttpRequestError extends Error {}
class NetworkRequestError extends Error {}

vi.mock("@/utils/http/client", () => ({
  HttpRequestError,
  NetworkRequestError,
  rawRequest,
}));

vi.mock("@/utils/local-first/pending_tasks/pendingTasksStore", () => ({
  getRetryablePendingTasks,
  removePendingTask,
  updatePendingTask,
}));

describe("pendingTasksRunner", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { onLine: true },
    });
  });

  afterEach(() => {
    rawRequest.mockReset();
    getRetryablePendingTasks.mockReset();
    removePendingTask.mockReset();
    updatePendingTask.mockReset();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("discards a task when local success handling fails and continues the queue", async () => {
    getRetryablePendingTasks.mockResolvedValue([
      {
        entityId: "bad-1",
        entityType: "bad-success",
        id: "bad-success-1",
        method: "POST",
        payload: { id: "bad-1" },
        status: "pending",
        timestamp: 1,
        updatedAt: 1,
        url: "/dogs",
      },
      {
        entityId: "good-1",
        entityType: "good-success",
        id: "good-success-1",
        method: "POST",
        payload: { id: "good-1" },
        status: "pending",
        timestamp: 2,
        updatedAt: 2,
        url: "/dogs",
      },
    ]);
    updatePendingTask.mockResolvedValue(undefined);
    removePendingTask.mockResolvedValue(undefined);
    rawRequest.mockResolvedValue(undefined);

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { processPendingTasks, registerPendingTaskHandler } = await import(
      "@/utils/local-first/pending_tasks/pendingTasksRunner"
    );

    const unregisterBad = registerPendingTaskHandler("bad-success", {
      onSuccess: () => {
        throw new Error("Corrupt IndexedDB payload");
      },
    });
    const goodSuccess = vi.fn();
    const unregisterGood = registerPendingTaskHandler("good-success", {
      onSuccess: goodSuccess,
    });

    await expect(processPendingTasks()).resolves.toBeUndefined();

    expect(removePendingTask).toHaveBeenCalledWith("bad-success-1");
    expect(removePendingTask).toHaveBeenCalledWith("good-success-1");
    expect(goodSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: "good-success-1" }),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Discarding pending task after unexpected local-first error",
      expect.objectContaining({
        taskId: "bad-success-1",
        taskType: "bad-success",
      }),
    );

    unregisterBad();
    unregisterGood();
  });

  it("discards a task when local http-error handling fails and continues the queue", async () => {
    getRetryablePendingTasks.mockResolvedValue([
      {
        entityId: "bad-2",
        entityType: "bad-http",
        id: "bad-http-1",
        method: "PUT",
        payload: { id: "bad-2" },
        status: "pending",
        timestamp: 1,
        updatedAt: 1,
        url: "/dogs/bad-2",
      },
      {
        entityId: "good-2",
        entityType: "good-http",
        id: "good-http-1",
        method: "PUT",
        payload: { id: "good-2" },
        status: "pending",
        timestamp: 2,
        updatedAt: 2,
        url: "/dogs/good-2",
      },
    ]);
    updatePendingTask.mockResolvedValue(undefined);
    removePendingTask.mockResolvedValue(undefined);
    rawRequest
      .mockRejectedValueOnce(new HttpRequestError("Validation failed"))
      .mockResolvedValueOnce(undefined);

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { processPendingTasks, registerPendingTaskHandler } = await import(
      "@/utils/local-first/pending_tasks/pendingTasksRunner"
    );

    const unregisterBad = registerPendingTaskHandler("bad-http", {
      onHttpError: () => {
        throw new Error("Broken rollback payload");
      },
    });
    const goodSuccess = vi.fn();
    const unregisterGood = registerPendingTaskHandler("good-http", {
      onSuccess: goodSuccess,
    });

    await expect(processPendingTasks()).resolves.toBeUndefined();

    expect(removePendingTask).toHaveBeenCalledWith("bad-http-1");
    expect(removePendingTask).toHaveBeenCalledWith("good-http-1");
    expect(goodSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: "good-http-1" }),
    );
    expect(consoleError).toHaveBeenCalledWith(
      "Discarding pending task after unexpected local-first error",
      expect.objectContaining({
        taskId: "bad-http-1",
        taskType: "bad-http",
      }),
    );

    unregisterBad();
    unregisterGood();
  });
});
