import { For } from "solid-js";
import ScoreChip from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip";
import {
  averageValue,
  exerciseShortCode,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { StageEventClassificationExerciseScoresResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type ObdxExerciseSquaresProps = {
  exercises: StageEventClassificationExerciseScoresResponseDTO[];
};

export default function ObdxExerciseSquares(props: ObdxExerciseSquaresProps) {
  return (
    <div class="obdx-clf__squares">
      <div class="obdx-clf__squares-grid">
        <For each={props.exercises}>
          {(exercise) => (
            <ScoreChip
              shape="square"
              value={averageValue(exercise.scores)}
              rating={exercise.scoreRating}
              sublabel={exerciseShortCode(exercise.exercise.name)}
              hasYellowCard={exercise.yellowCards.length > 0}
              hasRedCard={exercise.redCard != null}
            />
          )}
        </For>
      </div>
    </div>
  );
}
