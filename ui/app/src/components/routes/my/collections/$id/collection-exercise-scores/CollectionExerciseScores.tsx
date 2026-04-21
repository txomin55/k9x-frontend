import {
  CollectionScore,
  Exercise,
  UpdateCollectionScoreRequest
} from "@/services/api/collection-crud/collectionCrud.types";
import { createMemo, createSignal, For } from "solid-js";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import "./styles.css";

const roundToTwoDecimals = (value: number) => Number(value.toFixed(2));

interface CollectionExerciseScoresProps {
  competitorId: string;
  eventId: string;
  exercise: Exercise;
  scores: CollectionScore[];
  allowedValues: number[];
  onCommitScore: (payload: UpdateCollectionScoreRequest) => void;
}

function CollectionExerciseScoreInput(props: {
  competitorId: string;
  eventId: string;
  exerciseId: string;
  score: CollectionScore;
  allowedValues: number[];
  onCommitScore: (payload: UpdateCollectionScoreRequest) => void;
}) {
  const [rawValue, setRawValue] = createSignal(props.score.score);

  const sortedAllowedValues = createMemo(() =>
    [...props.allowedValues]
      .map(roundToTwoDecimals)
      .sort((left, right) => left - right),
  );
  const isValidValue = createMemo(
    () =>
      sortedAllowedValues().length === 0 ||
      sortedAllowedValues().includes(roundToTwoDecimals(rawValue())),
  );
  const allowedValuesText = createMemo(() => sortedAllowedValues().join(", "));

  const handleBlur = () => {
    const nextScore = rawValue();

    if (!Number.isFinite(nextScore) || !isValidValue()) {
      setRawValue(props.score.score);
      return;
    }

    if (nextScore === props.score.score) {
      return;
    }

    props.onCommitScore({
      competitorId: props.competitorId,
      eventId: props.eventId,
      exerciseId: props.exerciseId,
      judgeId: props.score.judge.id,
      score: roundToTwoDecimals(nextScore),
    });
  };

  return (
    <AtomNumberInput
      rawValue={rawValue()}
      onRawValueChange={setRawValue}
      onBlur={handleBlur}
      minValue={sortedAllowedValues()[0]}
      maxValue={sortedAllowedValues()[sortedAllowedValues().length - 1]}
      validationState={isValidValue() ? "valid" : "invalid"}
      errorMessage={`--Allowed values: ${allowedValuesText()}`}
    />
  );
}

export default (props: CollectionExerciseScoresProps) => {
  return (
    <div class="collection-exercise-scores">
      <span class="collection-exercise-scores__exercise">
        {props.exercise.name}
      </span>
      <For each={props.scores}>
        {(score) => (
          <div class="collection-exercise-scores__score">
            <CollectionExerciseScoreInput
              competitorId={props.competitorId}
              eventId={props.eventId}
              exerciseId={props.exercise.id}
              score={score}
              allowedValues={props.allowedValues}
              onCommitScore={props.onCommitScore}
            />
          </div>
        )}
      </For>
    </div>
  );
};
