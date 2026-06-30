import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";

const shouldQueueOfflineMutation = vi.hoisted(() => vi.fn());
const rawRequest = vi.hoisted(() => vi.fn());
const createSerializableRequest = vi.hoisted(() => vi.fn());
const createPendingTaskId = vi.hoisted(() => vi.fn());
const enqueuePendingTask = vi.hoisted(() => vi.fn());
const processPendingTasks = vi.hoisted(() => vi.fn());
const requestPendingTasksBackgroundSync = vi.hoisted(() => vi.fn());
const HttpRequestError = vi.hoisted(
  () =>
    class HttpRequestError extends Error {
      path: string;
      status: number;

      constructor(path: string, status: number, message?: string) {
        super(message ?? `Request failed for ${path} with status ${status}`);
        this.name = "HttpRequestError";
        this.path = path;
        this.status = status;
      }
    },
);

vi.mock("@/utils/local-first/localFirstPolicy", () => ({
  shouldQueueOfflineMutation,
}));

vi.mock("@/utils/http/client", () => ({
  createSerializableRequest,
  rawRequest,
  HttpRequestError,
}));

vi.mock("@/utils/local-first/pending_tasks/pendingTasksStore", () => ({
  createPendingTaskId,
  enqueuePendingTask,
}));

vi.mock("@/utils/local-first/pending_tasks/pendingTasksRunner", () => ({
  processPendingTasks,
}));

vi.mock("@/utils/service-worker/pending_tasks/backgroundSync", () => ({
  requestPendingTasksBackgroundSync,
}));

const showToast = vi.hoisted(() => vi.fn());

vi.mock("@/stores/toast/toast", () => ({
  showToast,
}));

describe("commitOptimisticMutation", () => {
  beforeEach(() => {
    shouldQueueOfflineMutation.mockReset();
    rawRequest.mockReset();
    createSerializableRequest.mockReset();
    createPendingTaskId.mockReset();
    enqueuePendingTask.mockReset();
    processPendingTasks.mockReset();
    requestPendingTasksBackgroundSync.mockReset();
    showToast.mockReset();
  });

  it("sends the mutation directly when the app is online", async () => {
    const rollback = vi.fn();

    shouldQueueOfflineMutation.mockReturnValue(false);

    await commitOptimisticMutation({
      entityId: "1",
      entityType: "competition",
      method: "PUT",
      payload: { name: "updated" },
      rollback,
      rollbackPayload: { entityId: "1" },
      url: "/api/competitions/1",
    });

    expect(rawRequest).toHaveBeenCalledWith({
      body: { name: "updated" },
      method: "PUT",
      path: "/api/competitions/1",
    });
    expect(enqueuePendingTask).not.toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
  });

  it("queues the mutation when the app is offline", async () => {
    const rollback = vi.fn();

    shouldQueueOfflineMutation.mockReturnValue(true);
    createPendingTaskId.mockReturnValue("task-id");
    createSerializableRequest.mockReturnValue({
      headers: { Authorization: "Bearer token" },
      method: "DELETE",
      url: "https://api.example.test/api/competitions/1",
    });
    requestPendingTasksBackgroundSync.mockResolvedValue(true);

    await commitOptimisticMutation({
      entityId: "1",
      entityType: "competition",
      method: "DELETE",
      rollback,
      rollbackPayload: { entityId: "1" },
      url: "/api/competitions/1",
    });

    expect(createPendingTaskId).toHaveBeenCalled();
    expect(enqueuePendingTask).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: "1",
        entityType: "competition",
        id: "task-id",
        method: "DELETE",
        request: {
          headers: { Authorization: "Bearer token" },
          method: "DELETE",
          url: "https://api.example.test/api/competitions/1",
        },
        url: "/api/competitions/1",
      }),
    );
    expect(createSerializableRequest).toHaveBeenCalledWith({
      body: undefined,
      method: "DELETE",
      path: "/api/competitions/1",
    });
    expect(requestPendingTasksBackgroundSync).toHaveBeenCalled();
    expect(processPendingTasks).toHaveBeenCalled();
    expect(rawRequest).not.toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
  });

  it("runs rollback when the direct request fails", async () => {
    const rollback = vi.fn();
    const error = new Error("boom");

    shouldQueueOfflineMutation.mockReturnValue(false);
    rawRequest.mockRejectedValue(error);

    await expect(
      commitOptimisticMutation({
        entityId: "1",
        entityType: "competition",
        method: "POST",
        payload: { name: "created" },
        rollback,
        rollbackPayload: { entityId: "1" },
        url: "/api/competitions",
      }),
    ).rejects.toThrow("boom");

    expect(rollback).toHaveBeenCalledWith({ entityId: "1" });
  });

  it("rolls back and shows a toast without rethrowing when the server rejects the request", async () => {
    const rollback = vi.fn();
    const error = new HttpRequestError(
      "/api/stages/1",
      412,
      "Stage cannot be deleted in its current state",
    );

    shouldQueueOfflineMutation.mockReturnValue(false);
    rawRequest.mockRejectedValue(error);

    await expect(
      commitOptimisticMutation({
        entityId: "1",
        entityType: "stage",
        method: "DELETE",
        rollback,
        rollbackPayload: { entityId: "1" },
        url: "/api/stages/1",
      }),
    ).resolves.toBeUndefined();

    expect(rollback).toHaveBeenCalledWith({ entityId: "1" });
    expect(showToast).toHaveBeenCalledWith(
      "Stage cannot be deleted in its current state",
    );
  });
});
