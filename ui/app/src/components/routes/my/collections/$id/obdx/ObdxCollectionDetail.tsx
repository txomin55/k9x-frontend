import { useNavigate, useParams, useSearch } from "@tanstack/solid-router";
import {
  updateCollectionScore,
  useCollectionById,
  useCollections
} from "@/services/secured/collection-crud/collectionCrud";
import { updateApiEventNotCompeting } from "@/services/secured/event-crud/eventCrud";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import YellowCardDialog from "@/components/routes/my/collections/$id/obdx/yellow-card/YellowCardDialog";
import RedCardDialog from "@/components/routes/my/collections/$id/obdx/red-card/RedCardDialog";
import Page from "@/components/common/page/Page";
import { EVENT_STATUS } from "@/utils/event";
import { isDayAfterStageDateTo } from "@/utils/stage";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { isOrganizer } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import ScoresCompetitorPreLabel
  from "@/components/routes/my/collections/$id/obdx/scores-competitor-pre-label/ScoresCompetitorPreLabel";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import CollectionExerciseScore
  from "@/components/routes/my/collections/$id/obdx/collection-exercise-scores/CollectionExerciseScores";
import type {
  CollectionScoreResponseDTO,
  ExerciseScoresResponseDTO,
  UpdateCollectionScoreRequestDTO
} from "@/services/secured/collection-crud/collectionCrud.types";
import "./styles.css";

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
  exercises: ExerciseScoresResponseDTO[];
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

export default function ObdxCollectionDetail() {
  const i18n = useI18n();
  const params = useParams({ from: "/my/collections/$id" });
  const search = useSearch({ from: "/my/collections/$id" });
  const navigate = useNavigate({ from: "/my/collections/$id" });

  const collectionData = useCollectionById(params().id);
  const collectionsList = useCollections({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });
  const eventStatus = createMemo(
    () =>
      collectionsList.data?.find((entry) => entry.eventId === params()?.id)
        ?.status ?? "",
  );

  const stageDateTo = createMemo(() =>
    getCachedCompetitions()
      ?.flatMap((competition) => competition.stages)
      .find((stage) => stage.events.some((event) => event.id === params()?.id))
      ?.dateTo,
  );

  const isPastStageEditWindow = createMemo(() =>
    isDayAfterStageDateTo(stageDateTo()),
  );
  const [pendingScores, setPendingScores] = createSignal<
    Record<string, number>
  >({});

  const [seenCompetitors, setSeenCompetitors] = createSignal<string[]>([]);

  const collectionCompetitors = createMemo<AtomSelectOption[]>(() => {
    if (!collectionData.data?.obdx.competitors) {
      return [];
    }

    return collectionData.data.obdx.competitors
      .toSorted(
        (a, b) => (a.competitor.position ?? 0) - (b.competitor.position ?? 0),
      )
      .flatMap((c) => {
        return [
          {
            label: c.competitor.dog.name,
            value: c.competitor.dog.id,
            preLabel: (
              <ScoresCompetitorPreLabel
                competitor={c.competitor}
                seen={seenCompetitors().includes(c.competitor.dog.id)}
              />
            ),
          },
        ];
      });
  });

  const [selectedCompetitor, setSelectedCompetitor] = createSignal(
    collectionCompetitors().find(
      (option) => option.value === search().competitorId,
    ),
  );

  const isSelectedCompetitorNotCompeting = createMemo(
    () =>
      collectionData.data?.obdx.competitors.find(
        (c) => c.competitor.dog.id === selectedCompetitor()?.value,
      )?.competitor.notCompeting ?? false,
  );

  const isSelectedCompetitorScoresAllowed = createMemo(
    () =>
      collectionData.data?.obdx.competitors.find(
        (c) => c.competitor.dog.id === selectedCompetitor()?.value,
      )?.competitor.scoresAllowed !== false,
  );

  const markCompetitorAsSeen = (opt: AtomSelectOption | null) => {
    if (!opt) {
      return;
    }

    setSeenCompetitors([...seenCompetitors(), opt.value]);
    setSelectedCompetitor(opt);
    void navigate({
      search: (prev) => ({ ...prev, competitorId: opt.value }),
    });
  };

  const handleMarkNotCompeting = () => {
    const competitor = selectedCompetitor();

    if (!competitor) {
      return;
    }

    updateApiEventNotCompeting(params().id, {
      dogId: competitor.value,
      notCompeting: true,
    });
  };

  createEffect(() => {
    if (!selectedCompetitor() && search().competitorId) {
      const match = collectionCompetitors().find(
        (option) => option.value === search().competitorId,
      );
      if (match) {
        setSelectedCompetitor(match);
      }
    }
  });

  createEffect(() => {
    if (collectionData.data?.obdx.competitors) {
      const seen: string[] = [];
      for (const c of collectionData.data.obdx.competitors) {
        const dogId = c.competitor.dog.id;

        for (const e of c.exercises) {
          const touched = e.collectionScores.some(
            (s) => s.score != null && s.score !== 0,
          );

          if (touched && dogId) {
            seen.push(dogId);
            break;
          }
        }
      }

      setSeenCompetitors(seen);
    }
  });

  const collectionExercises = createMemo(() => {
    if (!selectedCompetitor() || !collectionData.data?.obdx.competitors) {
      return [];
    }

    const competitorScores = collectionData.data.obdx.competitors.find(
      (c) => c.competitor.dog.id === selectedCompetitor()?.value,
    );

    if (!competitorScores) {
      return [];
    }

    return applyPendingScores({
      dogId: competitorScores.competitor.dog.id ?? "",
      exercises: competitorScores.exercises,
      pendingScores: pendingScores(),
    });
  });

  const filterByEligibleJudges = (score: CollectionScoreResponseDTO) => {
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

  const handleCommitScore = (payload: UpdateCollectionScoreRequestDTO) => {
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

    currentCollection.obdx.competitors.forEach((competitorScores) => {
      competitorScores.exercises.forEach((exerciseScores) => {
        exerciseScores.collectionScores.forEach((score) => {
          const scoreKey = getPendingScoreKey({
            dogId: competitorScores.competitor.dog.id ?? "",
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
    <Page title={i18n.t("MY.COLLECTIONS.DETAIL.SPECIFIC_SCORES")}>
      <DisciplineIcon disciplineId={collectionData.data?.discipline.id} />
      <span class="text-caption-sm">
        {collectionData.data?.configuration?.description}
      </span>

      <div class="obdx-collection-detail__competitor">
        <AtomSelect
          label={i18n.t("MY.COLLECTIONS.DETAIL.COMPETITORS")}
          placeholder={i18n.t("MY.COLLECTIONS.DETAIL.SELECT_COMPETITOR")}
          options={collectionCompetitors()}
          value={selectedCompetitor()}
          onChange={markCompetitorAsSeen}
        />

        <YellowCardDialog
          eventId={params().id}
          competitorId={
            isSelectedCompetitorScoresAllowed()
              ? selectedCompetitor()?.value ?? ""
              : ""
          }
          competitors={collectionData.data?.obdx.competitors ?? []}
          judgesIds={search().judgesIds}
          canChooseJudge={isOrganizer()}
          disabled={
            isPastStageEditWindow() || !isSelectedCompetitorScoresAllowed()
          }
        />

        <RedCardDialog
          eventId={params().id}
          competitorId={
            isSelectedCompetitorScoresAllowed()
              ? selectedCompetitor()?.value ?? ""
              : ""
          }
          competitors={collectionData.data?.obdx.competitors ?? []}
          judgesIds={search().judgesIds}
          canChooseJudge={isOrganizer()}
          disabled={
            isPastStageEditWindow() || !isSelectedCompetitorScoresAllowed()
          }
        />
      </div>

      <Show
        when={
          selectedCompetitor() &&
          eventStatus() === EVENT_STATUS.STARTED &&
          !isSelectedCompetitorNotCompeting()
        }
      >
        <ConfirmActionButton
          text={selectedCompetitor()?.label ?? ""}
          onConfirm={handleMarkNotCompeting}
        >
          <AtomButton
            type={BUTTON_TYPES.DESTRUCTIVE}
            disabled={
              isPastStageEditWindow() || !isSelectedCompetitorScoresAllowed()
            }
          >
            {i18n.t("MY.COLLECTIONS.DETAIL.NOT_PRESENTED")}
          </AtomButton>
        </ConfirmActionButton>
      </Show>

      <Show when={selectedCompetitor()}>
        <Show
          when={isPastStageEditWindow()}
          fallback={
            <Show when={!isSelectedCompetitorScoresAllowed()}>
              <div class="collection-detail__scores-banner collection-detail__scores-banner--warning">
                {i18n.t("MY.COLLECTIONS.DETAIL.SCORES_NOT_ALLOWED")}
              </div>
            </Show>
          }
        >
          <div class="collection-detail__scores-banner collection-detail__scores-banner--info">
            {i18n.t("MY.COLLECTIONS.DETAIL.EDIT_WINDOW_CLOSED")}
          </div>
        </Show>
        <div
          class="collection-detail__exercises"
          style={{
            "--collection-detail-exercises-columns": exercisesGridTemplate(),
          }}
        >
          <div class="collection-detail__exercises--headers">
            <span>{i18n.t("MY.COLLECTIONS.DETAIL.EXERCISE")}</span>
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
                      disabled={
                        !isSelectedCompetitorScoresAllowed() ||
                        isPastStageEditWindow()
                      }
                      onCommitScore={handleCommitScore}
                    />
                  )}
                </Show>
              )}
            </For>
          </div>
        </div>
      </Show>
    </Page>
  );
}
