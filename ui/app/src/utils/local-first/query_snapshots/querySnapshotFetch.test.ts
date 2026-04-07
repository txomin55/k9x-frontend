import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpRequestError, NetworkRequestError } from "@/utils/http/client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";

const getQuerySnapshot = vi.hoisted(() => vi.fn());
const getPersistedQuerySnapshot = vi.hoisted(() => vi.fn());
const saveQuerySnapshot = vi.hoisted(() => vi.fn());

vi.mock("@/utils/local_first/query_snapshots/querySnapshotsStore", () => ({
  getQuerySnapshot,
  getPersistedQuerySnapshot,
  saveQuerySnapshot,
}));

describe("fetchWithOfflineSnapshot", () => {
  beforeEach(() => {
    getQuerySnapshot.mockReset();
    getPersistedQuerySnapshot.mockReset();
    saveQuerySnapshot.mockReset();
  });

  it("returns the indexeddb snapshot when it exists", async () => {
    const snapshot = [{ id: "cached" }];
    const fetcher = vi.fn();

    getQuerySnapshot.mockResolvedValue(snapshot);

    const result = await fetchWithOfflineSnapshot("competitions", fetcher);

    expect(result).toEqual(snapshot);
    expect(fetcher).not.toHaveBeenCalled();
    expect(saveQuerySnapshot).not.toHaveBeenCalled();
  });

  it("overwrites the snapshot with the latest GET response", async () => {
    const response = [{ id: "fresh" }];
    const fetcher = vi.fn().mockResolvedValue(response);

    getQuerySnapshot.mockResolvedValue(undefined);

    const result = await fetchWithOfflineSnapshot("competitions", fetcher);

    expect(result).toEqual(response);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(saveQuerySnapshot).toHaveBeenCalledWith("competitions", response);
  });

  it("falls back to the persisted snapshot when the request fails due to network", async () => {
    const snapshot = [{ id: "cached-after-network-error" }];
    const fetcher = vi
      .fn()
      .mockRejectedValue(new NetworkRequestError("/api/competitions"));

    getQuerySnapshot.mockResolvedValue(undefined);
    getPersistedQuerySnapshot.mockResolvedValue(snapshot);

    const result = await fetchWithOfflineSnapshot("competitions", fetcher);

    expect(result).toEqual(snapshot);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(saveQuerySnapshot).not.toHaveBeenCalled();
  });

  it("does not fall back to the persisted snapshot on business or http errors", async () => {
    const error = new HttpRequestError("/api/competitions", 409);
    const fetcher = vi.fn().mockRejectedValue(error);

    getQuerySnapshot.mockResolvedValue(undefined);
    getPersistedQuerySnapshot.mockResolvedValue([{ id: "stale" }]);

    await expect(
      fetchWithOfflineSnapshot("competitions", fetcher),
    ).rejects.toBe(error);
    expect(getPersistedQuerySnapshot).not.toHaveBeenCalled();
  });
});
