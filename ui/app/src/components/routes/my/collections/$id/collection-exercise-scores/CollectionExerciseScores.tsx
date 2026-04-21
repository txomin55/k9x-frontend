import {
  CollectionScore,
  Exercise,
} from "@/services/api/collection-crud/collectionCrud.types";
import { For } from "solid-js";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import "./styles.css";

interface CollectionExerciseScoresProps {
  exercise: Exercise;
  scores: CollectionScore[];
}
export default (props: CollectionExerciseScoresProps) => {
  return (
    <div class="collection-exercise-scores">
      <span class="collection-exercise-scores__exercise">
        {props.exercise.name}
      </span>
      <For each={props.scores}>
        {() => (
          <div class="collection-exercise-scores__score">
            <AtomNumberInput />
          </div>
        )}
      </For>
    </div>
  );
};
