import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  commitRankingMutation: vi.fn(),
  invalidateRankingClassification: vi.fn(),
  applyRankingUpsert: vi.fn(),
  applyRankingRemoval: vi.fn(),
}));

vi.mock("@/services/secured/ranking-crud/rankingCrudOfflineUtils", () => ({
  applyRankingRemoval: mocks.applyRankingRemoval,
  applyRankingUpsert: mocks.applyRankingUpsert,
  commitRankingMutation: mocks.commitRankingMutation,
  createRankingRollbackPayload: vi.fn(async () => ({
    entityId: "ranking_competition_1",
    previousRanking: null,
  })),
  getVisibleRanking: vi.fn(() => null),
  saveRankingSnapshot: vi.fn(),
}));

vi.mock("@/services/fetch-rankings/fetchRankings", () => ({
  invalidateRankingClassification: mocks.invalidateRankingClassification,
}));

const { deleteRanking, saveRanking } =
  await import("@/services/secured/ranking-crud/rankingCrud");

const RANKING_ID = "ranking_competition_1";

const payload = {
  rankingId: RANKING_ID,
  name: "Ranking",
  eventIds: ["event_1"],
  groupBy: "INDIVIDUAL",
  includeBy: "ALL",
  includedCount: null,
  includeReserves: true,
};

/** The commit runs in a floating promise, so let the microtask queue drain before asserting. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("rankingCrud results refresh", () => {
  beforeEach(() => {
    mocks.commitRankingMutation.mockReset();
    mocks.invalidateRankingClassification.mockReset();
    // Stand in for the online path, which is the one that calls onCommitted.
    mocks.commitRankingMutation.mockImplementation(async ({ onCommitted }) => {
      await onCommitted?.();
    });
  });

  it("reads the public results again once a save commits online", async () => {
    saveRanking(payload);
    await flush();

    expect(mocks.commitRankingMutation).toHaveBeenCalledTimes(1);
    expect(mocks.invalidateRankingClassification).toHaveBeenCalledWith(
      RANKING_ID,
    );
  });

  it("reads the public results again once a delete commits online", async () => {
    deleteRanking(RANKING_ID);
    await flush();

    expect(mocks.invalidateRankingClassification).toHaveBeenCalledWith(
      RANKING_ID,
    );
  });

  it("does not refresh before the request has committed", async () => {
    // A commit that never resolves stands in for a request still in flight.
    mocks.commitRankingMutation.mockImplementation(() => new Promise(() => {}));

    saveRanking(payload);
    await flush();

    expect(mocks.invalidateRankingClassification).not.toHaveBeenCalled();
  });
});
