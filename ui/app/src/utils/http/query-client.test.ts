import { afterEach, describe, expect, it, vi } from "vitest";

const refetchQueries = vi.fn();
const addEventListener = vi.fn();
const removeEventListener = vi.fn();

vi.mock("@tanstack/solid-query", () => ({
  QueryClient: class {
    refetchQueries = refetchQueries;
  },
}));

describe("queryClient reconnect refetch", () => {
  afterEach(() => {
    refetchQueries.mockReset();
    addEventListener.mockReset();
    removeEventListener.mockReset();
    vi.resetModules();
  });

  it("refetches all cached queries when the app comes back online", async () => {
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

    handleOnline();

    expect(refetchQueries).toHaveBeenCalledWith({
      stale: true,
      type: "all",
    });

    cleanup();

    expect(removeEventListener).toHaveBeenCalledWith("online", handleOnline);
  });
});
