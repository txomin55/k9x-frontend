import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";

const shouldQueueOfflineMutation = vi.hoisted(() => vi.fn());
const rawRequest = vi.hoisted(() => vi.fn());
const createPendingTaskId = vi.hoisted(() => vi.fn());
const enqueuePendingTask = vi.hoisted(() => vi.fn());
const processPendingTasks = vi.hoisted(() => vi.fn());

vi.mock("@/utils/local_first/localFirstPolicy", () => ({
  shouldQueueOfflineMutation,
}));

vi.mock("@/utils/http/client", () => ({
  rawRequest,
}));

vi.mock("@/utils/local_first/pending_tasks/pendingTasksStore", () => ({
  createPendingTaskId,
  enqueuePendingTask,
}));

vi.mock("@/utils/local_first/pending_tasks/pendingTasksRunner", () => ({
  processPendingTasks,
}));

describe("commitOptimisticMutation", () => {
  beforeEach(() => {
    shouldQueueOfflineMutation.mockReset();
    rawRequest.mockReset();
    createPendingTaskId.mockReset();
    enqueuePendingTask.mockReset();
    processPendingTasks.mockReset();
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
        url: "/api/competitions/1",
      }),
    );
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
});
