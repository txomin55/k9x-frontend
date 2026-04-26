import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PENDING_TASKS_SYNC_TAG,
  PROCESS_PENDING_TASKS_MESSAGE,
  registerPendingTasksBackgroundSync,
  requestPendingTasksBackgroundSync,
} from "@/utils/service-worker/pending_tasks/backgroundSync";

describe("backgroundSync", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("registers a background sync request when the browser supports it", async () => {
    const register = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        serviceWorker: {
          ready: Promise.resolve({
            sync: { register },
          }),
        },
      },
    });

    await expect(requestPendingTasksBackgroundSync()).resolves.toBe(true);
    expect(register).toHaveBeenCalledWith(PENDING_TASKS_SYNC_TAG);
  });

  it("posts a message to open clients instead of running the background handler", async () => {
    let syncHandler: ((event: {
      tag: string;
      waitUntil: (promise: Promise<void>) => void;
    }) => void) | undefined;
    const postMessage = vi.fn();
    const handler = vi.fn();

    const scope = {
      addEventListener: vi.fn((type, listener) => {
        if (type === "sync") {
          syncHandler = listener;
        }
      }),
      clients: {
        matchAll: vi.fn().mockResolvedValue([{ postMessage }]),
      },
    } as unknown as ServiceWorkerGlobalScope;

    registerPendingTasksBackgroundSync(scope, handler);

    let pendingWork: Promise<void> | undefined;
    syncHandler?.({
      tag: PENDING_TASKS_SYNC_TAG,
      waitUntil: (promise) => {
        pendingWork = promise;
      },
    });

    await pendingWork;

    expect(postMessage).toHaveBeenCalledWith({
      type: PROCESS_PENDING_TASKS_MESSAGE,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs the background handler when there are no open clients", async () => {
    let syncHandler: ((event: {
      tag: string;
      waitUntil: (promise: Promise<void>) => void;
    }) => void) | undefined;
    const handler = vi.fn().mockResolvedValue(undefined);

    const scope = {
      addEventListener: vi.fn((type, listener) => {
        if (type === "sync") {
          syncHandler = listener;
        }
      }),
      clients: {
        matchAll: vi.fn().mockResolvedValue([]),
      },
    } as unknown as ServiceWorkerGlobalScope;

    registerPendingTasksBackgroundSync(scope, handler);

    let pendingWork: Promise<void> | undefined;
    syncHandler?.({
      tag: PENDING_TASKS_SYNC_TAG,
      waitUntil: (promise) => {
        pendingWork = promise;
      },
    });

    await pendingWork;

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
