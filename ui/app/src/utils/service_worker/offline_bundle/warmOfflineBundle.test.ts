import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { warmOfflineBundleInBackground } from "@/utils/service_worker/offline_bundle/warmOfflineBundle";

const originalFetch = globalThis.fetch;
const originalNavigator = globalThis.navigator;
const originalLocation = globalThis.location;

describe("warmOfflineBundle", () => {
  const fetchMock = vi.fn();
  const postMessage = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    postMessage.mockReset();
    postMessage.mockImplementation((_, transfer) => {
      const replyPort = transfer?.[0];

      globalThis.setTimeout(() => {
        replyPort?.postMessage({
          type: "WARM_APP_OFFLINE_RESULT",
          ok: true,
          failedUrls: [],
        });
      }, 0);
    });
    globalThis.sessionStorage.clear();
    globalThis.fetch = fetchMock as typeof fetch;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        ...originalNavigator,
        serviceWorker: {
          ready: Promise.resolve({
            active: { postMessage },
          }),
        },
      },
    });
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: new URL("https://example.com/base/app"),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("sends the offline bundle manifest to the service worker once per version", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        version: "abc123",
        assets: ["/assets/app.js", "/assets/app.css", "/", "/my-competitions"],
      }),
    });

    warmOfflineBundleInBackground();
    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage.mock.calls[0][0]).toEqual({
      type: "WARM_APP_OFFLINE",
      version: "abc123",
      urls: [
        "https://example.com/assets/app.js",
        "https://example.com/assets/app.css",
        "https://example.com/",
        "https://example.com/my-competitions",
      ],
    });

    warmOfflineBundleInBackground();
    await vi.runAllTimersAsync();

    expect(postMessage).toHaveBeenCalledTimes(1);
  });

  it("allows forcing the preload even when the version was already warmed", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        version: "abc123",
        assets: ["/assets/app.js", "/"],
      }),
    });

    warmOfflineBundleInBackground();
    await vi.runAllTimersAsync();

    warmOfflineBundleInBackground({ force: true });
    await vi.runAllTimersAsync();

    expect(postMessage).toHaveBeenCalledTimes(2);
  });
});
