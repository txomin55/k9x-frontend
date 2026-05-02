import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "@lib/components/atoms/combobox/AtomCombobox";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { EventExerciseDetail } from "@/services/secured/event-crud/eventCrud.types";
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

  const exerciseOptions = createMemo<AtomComboboxOption[]>(() =>
    props.exerciseOptions.map((option) => ({
      disabled: option.disabled,
      label: option.label,
      preLabel: option.preLabel,
      value: option.value,
    })),
  );

  const selectedExerciseOption = createMemo<AtomComboboxOption | null>(() => {
    const draft = props.draft();

    return (
      exerciseOptions().find((option) => option.value === draft.id) ?? {
        label: `--${draft.name}`,
        value: draft.id,
      }
    );
  });

  const setExercise = (option: AtomComboboxOption | null) => {
    if (!option) {
      return;
    }

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
      <AtomCombobox
        label="--Exercise"
        options={exerciseOptions()}
        value={selectedExerciseOption()}
        onChange={setExercise}
        disabled={exerciseOptions().length === 0}
        description={
          exerciseOptions().length === 0
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
