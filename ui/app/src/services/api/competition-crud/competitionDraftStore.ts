import { createSignal } from "solid-js";
import type { Competition } from "@/services/api/competition-crud/competitionCrud.types";

const [competitionDrafts, setCompetitionDrafts] = createSignal<
  Record<string, Competition>
>({});
const [removedCompetitionIds, setRemovedCompetitionIds] = createSignal<
  string[]
>([]);

const removeId = (ids: string[], id: string) =>
  ids.filter((entry) => entry !== id);

export const getCompetitionDrafts = competitionDrafts;
export const getRemovedCompetitionIds = removedCompetitionIds;

export const mergeCompetitionsWithDrafts = (
  baseCompetitions?: Competition[],
): Competition[] => {
  const drafts = competitionDrafts();
  const removedIds = new Set(removedCompetitionIds());
  const competitions = baseCompetitions ?? [];
  const nextCompetitions = competitions
    .filter((competition) => !removedIds.has(competition.id))
    .map((competition) => drafts[competition.id] ?? competition);
  const baseIds = new Set(competitions.map((competition) => competition.id));
  const appendedDrafts = Object.values(drafts).filter(
    (competition) =>
      !baseIds.has(competition.id) && !removedIds.has(competition.id),
  );

  return [...appendedDrafts, ...nextCompetitions];
};

export const upsertCompetitionDraft = (competition: Competition) => {
  setCompetitionDrafts((current) => ({
    ...current,
    [competition.id]: competition,
  }));
  setRemovedCompetitionIds((current) => removeId(current, competition.id));
};

export const removeCompetitionDraft = (competitionId: string) => {
  setCompetitionDrafts((current) => {
    const nextDrafts = { ...current };

    delete nextDrafts[competitionId];

    return nextDrafts;
  });
  setRemovedCompetitionIds((current) =>
    current.includes(competitionId) ? current : [...current, competitionId],
  );
};

export const clearCompetitionDraft = (competitionId: string) => {
  setCompetitionDrafts((current) => {
    if (!(competitionId in current)) return current;

    const nextDrafts = { ...current };

    delete nextDrafts[competitionId];

    return nextDrafts;
  });
  setRemovedCompetitionIds((current) => removeId(current, competitionId));
};

export const replaceCompetitionDrafts = (
  visibleCompetitions: Competition[] | null,
  baseCompetitions?: Competition[],
) => {
  const baseById = new Map(
    (baseCompetitions ?? []).map((competition) => [
      competition.id,
      competition,
    ]),
  );
  const visibleIds = new Set(
    (visibleCompetitions ?? []).map((competition) => competition.id),
  );
  const nextDrafts: Record<string, Competition> = {};
  const nextRemovedIds: string[] = [];

  for (const competition of visibleCompetitions ?? []) {
    const baseCompetition = baseById.get(competition.id);

    if (
      !baseCompetition ||
      JSON.stringify(baseCompetition) !== JSON.stringify(competition)
    ) {
      nextDrafts[competition.id] = competition;
    }
  }

  for (const competition of baseCompetitions ?? []) {
    if (!visibleIds.has(competition.id)) {
      nextRemovedIds.push(competition.id);
    }
  }

  setCompetitionDrafts(nextDrafts);
  setRemovedCompetitionIds(nextRemovedIds);
};
