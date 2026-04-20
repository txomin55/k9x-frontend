import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { EventExerciseDetail } from "@/services/api/event-crud/eventCrud.types";
import { createMemo, Show } from "solid-js";

type OrderBounds = {
  minValue: number;
  maxValue: number;
};

type ExerciseEditorFormProps = {
  draft: () => EventExerciseDetail;
  onCommit: () => void;
  onDraftChange: (
    updater: (
      current: EventExerciseDetail | null,
    ) => EventExerciseDetail | null,
  ) => void;
  onCancel: () => void;
  onCreate: () => void;
  orderBounds: OrderBounds;
  exerciseOptions: AtomSelectOption[];
  displaySave?: boolean;
};

export default function ExerciseEditorForm(props: ExerciseEditorFormProps) {
  const minOrder = Math.max(props.orderBounds.minValue, 1);
  const maxOrder = Math.max(minOrder, props.orderBounds.maxValue);

  const setOrder = (value: string) => {
    const parsedOrder = Number(value);
    const normalizedOrder = Number.isFinite(parsedOrder)
      ? Math.min(Math.max(parsedOrder, minOrder), maxOrder)
      : minOrder;

    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            order: normalizedOrder,
          }
        : current,
    );
  };

  const selectedExerciseOption = createMemo<AtomSelectOption | null>(() => {
    const draft = props.draft();

    return (
      props.exerciseOptions.find((option) => option.value === draft.id) ?? {
        label: `--${draft.name}`,
        value: draft.id,
      }
    );
  });

  const setExercise = (option: AtomSelectOption) => {
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            id: option.value,
            name: option.label.replace(/^--/, ""),
          }
        : current,
    );

    props.onCommit();
  };

  const setTags = (value: string) => {
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            tags: value.split(", "),
          }
        : current,
    );
  };

  return (
    <div class="exercise-editor-form">
      <AtomNumberInput
        label="--Order"
        value={props.draft().order}
        onBlur={props.onCommit}
        onChange={setOrder}
        minValue={minOrder}
        maxValue={maxOrder}
      />
      <AtomSelect
        label="--Exercise"
        options={props.exerciseOptions}
        value={selectedExerciseOption()}
        onChange={setExercise}
        disabled={props.exerciseOptions.length === 0}
        description={
          props.exerciseOptions.length === 0
            ? "--Select a configuration with exercises first"
            : undefined
        }
        placeholder="--Select an exercise"
      />
      <AtomInput
        label="--Tags"
        value={props.draft().tags.join(", ")}
        onBlur={props.onCommit}
        onChange={setTags}
        description="--Comma separated text"
      />
      <div class="exercise-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Close
        </AtomButton>
        <Show when={props.displaySave}>
          <AtomButton onClick={props.onCreate}>--Create</AtomButton>
        </Show>
      </div>
    </div>
  );
}
