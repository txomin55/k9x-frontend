import { createFileRoute, useParams, useSearch } from "@tanstack/solid-router";
import {
  getCachedCollections,
  updateCollectionScore,
  useCollectionById,
} from "@/services/secured/collection-crud/collectionCrud";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import ScoresCompetitorPreLabel from "@/components/routes/my/collections/$id/scores-competitor-pre-label/ScoresCompetitorPreLabel";
import CollectionExerciseScore from "@/components/routes/my/collections/$id/collection-exercise-scores/CollectionExerciseScores";
import {
  CollectionScore,
  ExerciseScores,
  UpdateCollectionScoreRequest,
} from "@/services/secured/collection-crud/collectionCrud.types";
import "./styles.css";

type CollectionDetailSearch = {
  competitorId: string;
  judgesIds: string[];
};

const getPendingScoreKey = ({
  dogId,
  exerciseId,
  judgeId,
}: {
  dogId: string;
  exerciseId: string;
  judgeId: string;
}) => `${dogId}:${exerciseId}:${judgeId}`;

const applyPendingScores = ({
  dogId,
  exercises,
  pendingScores,
}: {
  dogId: string;
  exercises: ExerciseScores[];
  pendingScores: Record<string, number>;
}) =>
  exercises.map((exerciseScores) => ({
    ...exerciseScores,
    scores: exerciseScores.collectionScores.map((score) => {
      const pendingScore =
        pendingScores[
          getPendingScoreKey({
            dogId,
            exerciseId: exerciseScores.exercise.id,
            judgeId: score.judge.id,
          })
        ];

      return pendingScore === undefined
        ? score
        : {
            ...score,
            score: pendingScore,
          };
    }),
  }));

export const Route = createFileRoute("/my/collections/$id")({
  component: CollectionDetailPage,
  staticData: {
    breadcrumb: (match) => {
      const collection = getCachedCollections()?.find(
        (entry) => entry.eventId === match.params.id,
      );

      return collection?.eventName;
    },
  },
  validateSearch: (
    search: Record<string, string | string[]>,
  ): CollectionDetailSearch => {
    const validatedSearch: CollectionDetailSearch = {
      competitorId: "",
      judgesIds: [],
    };

    if (typeof search.competitorId === "string") {
      validatedSearch.competitorId = search.competitorId ?? "";
    }

    if (Array.isArray(search.judgesIds)) {
      validatedSearch.judgesIds = search.judgesIds ?? [];
    }

    return validatedSearch;
  },
});

function CollectionDetailPage() {
  const params = useParams({ from: "/my/collections/$id" });
  const search = useSearch({ from: "/my/collections/$id" });

  const collectionData = useCollectionById(params().id);
  const [pendingScores, setPendingScores] = createSignal<
    Record<string, number>
  >({});

  const collectionCompetitors = createMemo<AtomSelectOption[]>(() => {
    if (!collectionData.data?.competitors) {
      return [];
    }

    return collectionData.data.competitors
      .toSorted((a, b) => (a.competitor.order ?? 0) - (b.competitor.order ?? 0))
      .flatMap((c) => {
        if (!c.competitor.owner || !c.competitor.dogId) {
          return [];
        }

        return [
          {
            label: c.competitor.owner,
            value: c.competitor.dogId,
            preLabel: (
              <ScoresCompetitorPreLabel
                competitor={c.competitor}
                seen={seenCompetitors().includes(c.competitor.dogId)}
              />
            ),
          },
        ];
      });
  });

  const [seenCompetitors, setSeenCompetitors] = createSignal<string[]>([]);
  const markCompetitorAsSeen = (opt: AtomSelectOption) => {
    setSeenCompetitors([...seenCompetitors(), opt.value]);
    setSelectedCompetitor(opt);
  };

  createEffect(() => {
    if (collectionData.data?.competitors) {
      const seen: string[] = [];
      for (const c of collectionData.data.competitors) {
        const dogId = c.competitor.dogId;

        for (const e of c.exercises) {
          const touched = e.collectionScores.some((s) => s.score !== 0);

          if (touched && dogId) {
            seen.push(dogId);
            break;
          }
        }
      }

      setSeenCompetitors(seen);
    }
  });

  const [selectedCompetitor, setSelectedCompetitor] = createSignal(
    collectionCompetitors().find(
      (option) => option.value === search().competitorId,
    ),
  );

  const collectionExercises = createMemo(() => {
    if (!selectedCompetitor() || !collectionData.data?.competitors) {
      return [];
    }

    const competitorScores = collectionData.data.competitors.find(
      (c) => c.competitor.dogId === selectedCompetitor()?.value,
    );

    if (!competitorScores) {
      return [];
    }

    return applyPendingScores({
      dogId: competitorScores.competitor.dogId ?? "",
      exercises: competitorScores.exercises,
      pendingScores: pendingScores(),
    });
  });

  const filterByEligibleJudges = (score: CollectionScore) => {
    if (search().judgesIds.length) {
      return search().judgesIds.includes(score.judge.id);
    }
    return true;
  };

  const collectionJudges = createMemo(() => {
    if (!collectionExercises()[0]?.scores) {
      return [];
    }
    return collectionExercises()[0]?.scores.filter(filterByEligibleJudges);
  });

  const exercisesGridTemplate = createMemo(() => {
    const judgesCount = collectionJudges().length;

    return `2fr repeat(${judgesCount}, 1.25fr)`;
  });

  const handleCommitScore = (payload: UpdateCollectionScoreRequest) => {
    const scoreKey = getPendingScoreKey(payload);

    setPendingScores((currentScores) => ({
      ...currentScores,
      [scoreKey]: payload.score,
    }));
    updateCollectionScore(params().id, payload);
  };

  createEffect(() => {
    const currentCollection = collectionData.data;
    const currentPendingScores = pendingScores();

    if (!currentCollection || Object.keys(currentPendingScores).length === 0) {
      return;
    }

    const committedScoreKeys = new Set<string>();

    currentCollection.competitors.forEach((competitorScores) => {
      competitorScores.exercises.forEach((exerciseScores) => {
        exerciseScores.collectionScores.forEach((score) => {
          const scoreKey = getPendingScoreKey({
            dogId: competitorScores.competitor.dogId ?? "",
            exerciseId: exerciseScores.exercise.id,
            judgeId: score.judge.id,
          });

          if (currentPendingScores[scoreKey] === score.score) {
            committedScoreKeys.add(scoreKey);
          }
        });
      });
    });

    if (committedScoreKeys.size === 0) {
      return;
    }

    setPendingScores((currentScores) => {
      const nextScores = { ...currentScores };

      committedScoreKeys.forEach((scoreKey) => {
        delete nextScores[scoreKey];
      });

      return nextScores;
    });
  });

  return (
    <div class="collection-detail">
      <h1>--SPECIFIC SCORES</h1>
      <span class="text-caption-sm">
        {collectionData.data?.configuration?.description}
      </span>
      <AtomSelect
        label="--Competitors"
        options={collectionCompetitors()}
        value={selectedCompetitor()}
        onChange={markCompetitorAsSeen}
      />

      <Show when={selectedCompetitor()}>
        <div
          class="collection-detail__exercises"
          style={{
            "--collection-detail-exercises-columns": exercisesGridTemplate(),
          }}
        >
          <div class="collection-detail__exercises--headers">
            <span>--Exercise</span>
            <For each={collectionJudges()}>
              {(score) => <span>{score.judge.name}</span>}
            </For>
          </div>
          <div class="collection-detail__exercises--rows">
            <For each={collectionExercises()}>
              {(exerciseScores) => (
                <Show when={collectionData.data?.configuration}>
                  {(configuration) => (
                    <CollectionExerciseScore
                      competitorId={selectedCompetitor()?.value ?? ""}
                      eventId={params().id}
                      exercise={exerciseScores.exercise}
                      scores={exerciseScores.scores.filter(
                        filterByEligibleJudges,
                      )}
                      allowedValues={configuration().allowedValues}
                      onCommitScore={handleCommitScore}
                    />
                  )}
                </Show>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
