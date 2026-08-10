import { createSignal } from "solid-js";
import type { RankingResponseDTO } from "./rankingCrud.types";

/**
 * Optimistic overlay on top of the query cache, keyed by ranking id.
 *
 * A ranking is a single entity per identifier rather than a list, so the overlay is simply "this id has
 * a pending version" plus "this id has been removed".
 */
const [rankingDrafts, setRankingDrafts] = createSignal<
  Record<string, RankingResponseDTO>
>({});
const [removedRankingIds, setRemovedRankingIds] = createSignal<string[]>([]);

const removeId = (ids: string[], id: string) =>
  ids.filter((entry) => entry !== id);

export const mergeRankingWithDraft = (
  id: string,
  baseRanking?: RankingResponseDTO | null,
): RankingResponseDTO | null => {
  if (removedRankingIds().includes(id)) {
    return null;
  }

  return rankingDrafts()[id] ?? baseRanking ?? null;
};

export const upsertRankingDraft = (ranking: RankingResponseDTO) => {
  setRankingDrafts((current) => ({
    ...current,
    [ranking.rankingId]: ranking,
  }));
  setRemovedRankingIds((current) => removeId(current, ranking.rankingId));
};

export const removeRankingDraft = (id: string) => {
  setRankingDrafts((current) => {
    const nextDrafts = { ...current };

    delete nextDrafts[id];

    return nextDrafts;
  });
  setRemovedRankingIds((current) =>
    current.includes(id) ? current : [...current, id],
  );
};

/**
 * Folds the confirmed server state back in: once the base cache holds the same thing the overlay does,
 * the draft is no longer needed.
 */
export const replaceRankingDraft = (
  id: string,
  visibleRanking: RankingResponseDTO | null,
  baseRanking?: RankingResponseDTO | null,
) => {
  const isSameAsBase =
    JSON.stringify(baseRanking ?? null) === JSON.stringify(visibleRanking);

  setRankingDrafts((current) => {
    const nextDrafts = { ...current };

    if (visibleRanking && !isSameAsBase) {
      nextDrafts[id] = visibleRanking;
    } else {
      delete nextDrafts[id];
    }

    return nextDrafts;
  });
  setRemovedRankingIds((current) =>
    !visibleRanking && baseRanking
      ? current.includes(id)
        ? current
        : [...current, id]
      : removeId(current, id),
  );
};

export const clearRankingDrafts = () => {
  setRankingDrafts({});
  setRemovedRankingIds([]);
};
