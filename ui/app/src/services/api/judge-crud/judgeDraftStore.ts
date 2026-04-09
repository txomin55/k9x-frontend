import { createSignal } from "solid-js";
import type { Judge } from "./judgeCrudTypes";

const [judgeDrafts, setJudgeDrafts] = createSignal<Record<string, Judge>>({});
const [removedJudgeIds, setRemovedJudgeIds] = createSignal<string[]>([]);

const removeId = (ids: string[], id: string) =>
  ids.filter((entry) => entry !== id);

export const mergeJudgesWithDrafts = (baseJudges?: Judge[]) => {
  const drafts = judgeDrafts();
  const removedIds = new Set(removedJudgeIds());
  const judges = baseJudges ?? [];
  const nextJudges = judges
    .filter((judge) => !removedIds.has(judge.id))
    .map((judge) => drafts[judge.id] ?? judge);
  const baseIds = new Set(judges.map((judge) => judge.id));
  const appendedDrafts = Object.values(drafts).filter(
    (judge) => !baseIds.has(judge.id) && !removedIds.has(judge.id),
  );

  return [...appendedDrafts, ...nextJudges];
};

export const upsertJudgeDraft = (judge: Judge) => {
  setJudgeDrafts((current) => ({
    ...current,
    [judge.id]: judge,
  }));
  setRemovedJudgeIds((current) => removeId(current, judge.id));
};

export const removeJudgeDraft = (judgeId: string) => {
  setJudgeDrafts((current) => {
    const nextDrafts = { ...current };

    delete nextDrafts[judgeId];

    return nextDrafts;
  });
  setRemovedJudgeIds((current) =>
    current.includes(judgeId) ? current : [...current, judgeId],
  );
};

export const replaceJudgeDrafts = (
  visibleJudges: Judge[] | null,
  baseJudges?: Judge[],
) => {
  const baseById = new Map(
    (baseJudges ?? []).map((judge) => [judge.id, judge]),
  );
  const visibleIds = new Set((visibleJudges ?? []).map((judge) => judge.id));
  const nextDrafts: Record<string, Judge> = {};
  const nextRemovedIds: string[] = [];

  for (const judge of visibleJudges ?? []) {
    const baseJudge = baseById.get(judge.id);

    if (!baseJudge || JSON.stringify(baseJudge) !== JSON.stringify(judge)) {
      nextDrafts[judge.id] = judge;
    }
  }

  for (const judge of baseJudges ?? []) {
    if (!visibleIds.has(judge.id)) {
      nextRemovedIds.push(judge.id);
    }
  }

  setJudgeDrafts(nextDrafts);
  setRemovedJudgeIds(nextRemovedIds);
};
