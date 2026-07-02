import { createMemo, For, Show } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import ScoreChip from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip";
import ScoreFraction from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-fraction/ScoreFraction";
import TagList from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/tag-list/TagList";
import TotalBlock from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/total-block/TotalBlock";
import {
  judgeInitials,
  uniqueJudges,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { ObdxExerciseDetailTableProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function ObdxExerciseDetailTable(
  props: ObdxExerciseDetailTableProps,
) {
  const { t } = useI18n();
  const judges = createMemo(() => uniqueJudges(props.competitor.exercises));

  return (
    <div class="obdx-clf__detail">
      <table class="obdx-clf__table">
        <thead>
          <tr>
            <th>{t("STAGES.CLASSIFICATION_CARD.EXERCISE")}</th>
            <For each={judges()}>
              {(judge) => (
                <th title={judge.name}>{judgeInitials(judge.name)}</th>
              )}
            </For>
            <th>{t("STAGES.CLASSIFICATION_CARD.SCORE")}</th>
          </tr>
        </thead>
        <tbody>
          <For each={props.competitor.exercises}>
            {(exercise) => {
              const scoreByJudge = (judgeId: string) =>
                exercise.scores.find((score) => score.judge.id === judgeId);
              return (
                <>
                  <tr
                    class="obdx-clf__ex-row"
                    classList={{ "is-last-line": exercise.tags.length === 0 }}
                  >
                    <td>
                      <span class="obdx-clf__ex-name text-body-md">
                        {exercise.exercise.name}
                      </span>
                    </td>
                    <For each={judges()}>
                      {(judge) => {
                        const score = scoreByJudge(judge.id);
                        return (
                          <td>
                            <Show when={score}>
                              {(s) => (
                                <ScoreChip
                                  shape="pill"
                                  value={s().value}
                                  rating={s().scoreRating}
                                  hasYellowCard={exercise.yellowCards.some(
                                    (card) => card.judge.id === judge.id,
                                  )}
                                  hasRedCard={
                                    exercise.redCard?.judge.id === judge.id
                                  }
                                />
                              )}
                            </Show>
                          </td>
                        );
                      }}
                    </For>
                    <td>
                      <ScoreFraction
                        score={exercise.exerciseScore}
                        max={exercise.totalScore}
                        rating={exercise.scoreRating}
                      />
                    </td>
                  </tr>
                  <Show when={exercise.tags.length > 0}>
                    <tr class="obdx-clf__tags-row">
                      <td colSpan={judges().length + 2}>
                        <TagList tags={exercise.tags} />
                      </td>
                    </tr>
                  </Show>
                </>
              );
            }}
          </For>
          <tr class="obdx-clf__total-row">
            <td colSpan={judges().length + 2}>
              <TotalBlock
                value={props.competitor.totalScore ?? null}
                layout="row"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
