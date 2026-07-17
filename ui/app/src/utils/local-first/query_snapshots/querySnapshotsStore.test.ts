import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const deleteMock = vi.hoisted(() => vi.fn());
const belowMock = vi.hoisted(() => vi.fn(() => ({ delete: deleteMock })));
const whereMock = vi.hoisted(() => vi.fn(() => ({ below: belowMock })));
const getLocalFirstTable = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ where: whereMock })),
);
const shouldPersistLocalFirstData = vi.hoisted(() => vi.fn());

vi.mock("@/utils/local-first/storage/localFirstDatabase", () => ({
  LOCAL_FIRST_STORE_NAMES: { querySnapshots: "query_snapshots" },
  getLocalFirstTable,
}));

vi.mock("@/utils/local-first/localFirstPolicy", () => ({
  shouldPersistLocalFirstData,
  shouldReadFromIndexedDb: vi.fn(),
}));

import {
  QUERY_SNAPSHOT_MAX_AGE_MS,
  pruneStaleQuerySnapshots,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";

describe("pruneStaleQuerySnapshots", () => {
  beforeEach(() => {
    deleteMock.mockReset().mockResolvedValue(3);
    belowMock.mockClear();
    whereMock.mockClear();
    shouldPersistLocalFirstData.mockReturnValue(true);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deletes snapshots older than the max age via the updatedAt index", async () => {
    const deleted = await pruneStaleQuerySnapshots();

    expect(whereMock).toHaveBeenCalledWith("updatedAt");
    expect(belowMock).toHaveBeenCalledWith(Date.now() - QUERY_SNAPSHOT_MAX_AGE_MS);
    expect(deleteMock).toHaveBeenCalledOnce();
    expect(deleted).toBe(3);
  });

  it("honors a custom max age", async () => {
    const maxAgeMs = 60 * 60 * 1000;

    await pruneStaleQuerySnapshots(maxAgeMs);

    expect(belowMock).toHaveBeenCalledWith(Date.now() - maxAgeMs);
  });

  it("no-ops when local-first persistence is disabled", async () => {
    shouldPersistLocalFirstData.mockReturnValue(false);

    const deleted = await pruneStaleQuerySnapshots();

    expect(deleted).toBe(0);
    expect(whereMock).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
