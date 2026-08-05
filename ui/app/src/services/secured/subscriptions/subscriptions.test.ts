import { beforeEach, describe, expect, it, vi } from "vitest";

const commitSubscriptionsMutation = vi.hoisted(() => vi.fn());
const applySubscribedEventIds = vi.hoisted(() => vi.fn());
const getSubscribedEventIds = vi.hoisted(() => vi.fn());

vi.mock("@/services/secured/subscriptions/subscriptionsOfflineUtils", () => ({
  applySubscribedEventIds,
  commitSubscriptionsMutation,
  getSubscribedEventIds,
}));

const { updateEventSubscriptions } =
  await import("@/services/secured/subscriptions/subscriptions");

describe("updateEventSubscriptions", () => {
  beforeEach(() => {
    commitSubscriptionsMutation.mockReset();
    applySubscribedEventIds.mockReset();
    getSubscribedEventIds.mockReset();
    getSubscribedEventIds.mockReturnValue(["event-9"]);
  });

  it("adds every id to the cached profile before sending one PATCH", async () => {
    await updateEventSubscriptions(["event-1", "event-2"], true);

    expect(applySubscribedEventIds).toHaveBeenCalledWith([
      "event-9",
      "event-1",
      "event-2",
    ]);
    expect(commitSubscriptionsMutation).toHaveBeenCalledWith({
      entityId: "EVENT",
      method: "PATCH",
      payload: { ids: ["event-1", "event-2"], kind: "EVENT", subscribe: true },
      rollbackPayload: { previousEventIds: ["event-9"] },
      url: "/secured/subscriptions",
    });
  });

  it("removes every id from the cached profile when unsubscribing", async () => {
    getSubscribedEventIds.mockReturnValue(["event-9", "event-1"]);

    await updateEventSubscriptions(["event-1"], false);

    expect(applySubscribedEventIds).toHaveBeenCalledWith(["event-9"]);
    expect(commitSubscriptionsMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { ids: ["event-1"], kind: "EVENT", subscribe: false },
        rollbackPayload: { previousEventIds: ["event-9", "event-1"] },
      }),
    );
  });

  it("never stores an id twice when subscribing to an already subscribed event", async () => {
    getSubscribedEventIds.mockReturnValue(["event-1"]);

    await updateEventSubscriptions(["event-1", "event-2"], true);

    expect(applySubscribedEventIds).toHaveBeenCalledWith([
      "event-1",
      "event-2",
    ]);
  });

  it("does nothing when there are no ids to toggle", async () => {
    await updateEventSubscriptions([], true);

    expect(applySubscribedEventIds).not.toHaveBeenCalled();
    expect(commitSubscriptionsMutation).not.toHaveBeenCalled();
  });
});
