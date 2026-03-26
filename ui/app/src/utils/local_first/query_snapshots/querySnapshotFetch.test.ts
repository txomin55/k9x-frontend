import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithOfflineSnapshot } from "@/utils/local_first/query_snapshots/querySnapshotFetch";

const getQuerySnapshot = vi.hoisted(() => vi.fn());
const saveQuerySnapshot = vi.hoisted(() => vi.fn());

vi.mock("@/utils/local_first/query_snapshots/querySnapshotsStore", () => ({
  getQuerySnapshot,
  saveQuerySnapshot,
}));

describe("fetchWithOfflineSnapshot", () => {
  beforeEach(() => {
    getQuerySnapshot.mockReset();
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
});
