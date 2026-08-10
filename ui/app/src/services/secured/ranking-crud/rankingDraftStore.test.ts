import { beforeEach, describe, expect, it } from "vitest";
import {
  clearRankingDrafts,
  mergeRankingWithDraft,
  removeRankingDraft,
  replaceRankingDraft,
  upsertRankingDraft,
} from "@/services/secured/ranking-crud/rankingDraftStore";
import type { RankingResponseDTO } from "@/services/secured/ranking-crud/rankingCrud.types";
import { RANKING_INCLUDE_BY, RANKING_GROUP_BY } from "@/utils/ranking";

const RANKING_ID = "ranking_competition_1";

const buildRanking = (
  overrides: Partial<RankingResponseDTO> = {},
): RankingResponseDTO => ({
  rankingId: RANKING_ID,
  name: "Ranking",
  events: [{ id: "event_1", name: "Event 1" }],
  groupBy: RANKING_GROUP_BY.INDIVIDUAL,
  includeBy: RANKING_INCLUDE_BY.ALL,
  includedCount: null,
  includeReserves: true,
  ...overrides,
});

describe("rankingDraftStore", () => {
  beforeEach(() => {
    clearRankingDrafts();
  });

  it("returns the base ranking when there is no draft", () => {
    const base = buildRanking();

    expect(mergeRankingWithDraft(RANKING_ID, base)).toEqual(base);
  });

  it("returns null when there is neither draft nor base", () => {
    expect(mergeRankingWithDraft(RANKING_ID, null)).toBeNull();
  });

  it("lets the draft win over the base ranking", () => {
    const draft = buildRanking({ groupBy: RANKING_GROUP_BY.TEAM });

    upsertRankingDraft(draft);

    expect(mergeRankingWithDraft(RANKING_ID, buildRanking())?.groupBy).toBe(
      RANKING_GROUP_BY.TEAM,
    );
  });

  it("hides a removed ranking even if the base still has it", () => {
    removeRankingDraft(RANKING_ID);

    // a stale refetch reintroduces the ranking into the cache
    expect(mergeRankingWithDraft(RANKING_ID, buildRanking())).toBeNull();
  });

  it("stops hiding once the ranking is drafted again", () => {
    removeRankingDraft(RANKING_ID);
    upsertRankingDraft(buildRanking());

    expect(mergeRankingWithDraft(RANKING_ID, null)).not.toBeNull();
  });

  it("drops the draft once the base holds the same thing", () => {
    const ranking = buildRanking();

    upsertRankingDraft(ranking);
    replaceRankingDraft(RANKING_ID, ranking, ranking);

    // the overlay is empty, so the base is what shows through
    expect(mergeRankingWithDraft(RANKING_ID, null)).toBeNull();
    expect(mergeRankingWithDraft(RANKING_ID, ranking)).toEqual(ranking);
  });

  it("keeps the draft while it still differs from the base", () => {
    const visible = buildRanking({ groupBy: RANKING_GROUP_BY.COUNTRY });

    replaceRankingDraft(RANKING_ID, visible, buildRanking());

    expect(mergeRankingWithDraft(RANKING_ID, buildRanking())?.groupBy).toBe(
      RANKING_GROUP_BY.COUNTRY,
    );
  });

  it("marks the ranking as removed when the confirmed state has none", () => {
    replaceRankingDraft(RANKING_ID, null, buildRanking());

    expect(mergeRankingWithDraft(RANKING_ID, buildRanking())).toBeNull();
  });

  it("keeps drafts of different rankings independent", () => {
    const other = "ranking_competition_2";

    upsertRankingDraft(buildRanking({ groupBy: RANKING_GROUP_BY.TEAM }));
    removeRankingDraft(other);

    expect(mergeRankingWithDraft(RANKING_ID, null)?.groupBy).toBe(
      RANKING_GROUP_BY.TEAM,
    );
    expect(mergeRankingWithDraft(other, buildRanking())).toBeNull();
  });
});
