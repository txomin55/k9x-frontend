import { For } from "solid-js";
import ScoreChip from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip";
import {
  averageValue,
  exerciseShortCode,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { ObdxExerciseSquaresProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function ObdxExerciseSquares(props: ObdxExerciseSquaresProps) {
  return (
    <div class="obdx-clf__squares">
      <For each={props.exercises}>
        {(exercise) => (
          <ScoreChip
            shape="square"
            value={averageValue(exercise.scores)}
            rating={exercise.scoreRating}
            sublabel={exerciseShortCode(exercise.exercise.name)}
            hasYellowCard={exercise.yellowCards.length > 0}
          />
        )}
      </For>
    </div>
  );
}
