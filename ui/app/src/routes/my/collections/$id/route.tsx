import { createFileRoute, useParams, useSearch } from "@tanstack/solid-router";
import { getCachedCollections, useCollectionById } from "@/services/api/collection-crud/collectionCrud";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import ScoresCompetitorPreLabel
  from "@/components/routes/my/collections/$id/scores-competitor-pre-label/ScoresCompetitorPreLabel";
import CollectionExerciseScore
  from "@/components/routes/my/collections/$id/collection-exercise-scores/CollectionExerciseScores";
import "./styles.css";
import { CollectionScore } from "@/services/api/collection-crud/collectionCrud.types";

type CollectionDetailSearch = {
  competitorId: string;
  judgesIds: string[];
};

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

  const collectionCompetitors = createMemo<AtomSelectOption[]>(() => {
    if (!collectionData.data) {
      return [];
    }

    return collectionData.data
      .toSorted((a, b) => (a.competitor.order ?? 0) - (b.competitor.order ?? 0))
      .flatMap((c) => {
        if (!c.competitor.owner || !c.competitor.dogId) {
          return [];
        }

        return [
          {
            label: c.competitor.owner,
            value: c.competitor.dogId,
            preLabel: <ScoresCompetitorPreLabel competitor={c.competitor} />,
          },
        ];
      });
  });

  const [selectedCompetitor, setSelectedCompetitor] = createSignal(
    collectionCompetitors().find(
      (option) => option.value === search().competitorId,
    ),
  );

  const collectionExercises = createMemo(() => {
    if (!selectedCompetitor() || !collectionData.data) {
      return [];
    }

    const competitorScores = collectionData.data.find(
      (c) => c.competitor.dogId === selectedCompetitor()?.value,
    );

    if (!competitorScores) {
      return [];
    }

    return competitorScores.exercises;
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

  return (
    <div class="collection-detail">
      <h1>--SPECIFIC SCORES</h1>
      <AtomSelect
        label="--Competitors"
        options={collectionCompetitors()}
        value={selectedCompetitor()}
        onChange={setSelectedCompetitor}
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
                <CollectionExerciseScore
                  exercise={exerciseScores.exercise}
                  scores={exerciseScores.scores.filter(filterByEligibleJudges)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
