import { beforeEach, describe, expect, it } from "vitest";
import {
  markCompetitionRemoved,
  mergeCompetitionsWithDrafts,
  reconcileRemovedCompetitionIds,
  removeCompetitionDraft,
  replaceCompetitionDrafts,
} from "@/services/secured/competition-crud/competitionDraftStore";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";

const buildCompetition = (
  id: string,
  overrides: Partial<CompetitionResponseDTO> = {},
): CompetitionResponseDTO => ({
  id,
  name: id,
  country: "",
  description: "",
  address: "",
  notifications: [],
  stages: [],
  status: "CREATED",
  ...overrides,
});

describe("competitionDraftStore removal reconciliation", () => {
  beforeEach(() => {
    // reset store between tests
    replaceCompetitionDrafts([], []);
    reconcileRemovedCompetitionIds([]);
  });

  it("hides a removed competition even if the base list still contains it", () => {
    const competition = buildCompetition("competition_1");

    removeCompetitionDraft(competition.id);

    // a stale refetch reintroduces the competition into the base list
    expect(mergeCompetitionsWithDrafts([competition])).toEqual([]);
  });

  it("keeps hiding after a delete-success re-marks the removal", () => {
    const competition = buildCompetition("competition_1");

    removeCompetitionDraft(competition.id);
    // delete-success path resets drafts, then re-asserts the removal
    replaceCompetitionDrafts([], []);
    markCompetitionRemoved(competition.id);

    expect(mergeCompetitionsWithDrafts([competition])).toEqual([]);
  });

  it("drops the removed id once the server list no longer contains it", () => {
    const competition = buildCompetition("competition_1");

    removeCompetitionDraft(competition.id);
    // server confirms deletion: it is no longer returned
    reconcileRemovedCompetitionIds([]);

    // if it ever reappeared in the base list, it would now be visible again
    expect(mergeCompetitionsWithDrafts([competition])).toEqual([competition]);
  });

  it("keeps the removal pending while the server still returns the competition", () => {
    const competition = buildCompetition("competition_1");

    removeCompetitionDraft(competition.id);
    // stale server response still includes it -> stay hidden
    reconcileRemovedCompetitionIds([competition]);

    expect(mergeCompetitionsWithDrafts([competition])).toEqual([]);
  });
});
