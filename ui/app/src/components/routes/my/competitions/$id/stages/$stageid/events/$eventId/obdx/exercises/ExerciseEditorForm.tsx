import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "library/src/components/atoms/combobox/AtomCombobox";
import AtomInput from "library/src/components/atoms/input/AtomInput";
import AtomNumberInput from "library/src/components/atoms/number-input/AtomNumberInput";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import { EventExerciseDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { createMemo, Show } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";

type OrderBounds = {
  minValue: number;
  maxValue: number;
};

type ExerciseEditorFormProps = {
  draft: () => EventExerciseDetailResponseDTO;
  onCommit: () => void;
  onDraftChange: (
    updater: (
      current: EventExerciseDetailResponseDTO | null,
    ) => EventExerciseDetailResponseDTO | null,
  ) => void;
  onCancel: () => void;
  onCreate: () => void;
  orderBounds: OrderBounds;
  exerciseOptions: AtomSelectOption[];
  displaySave?: boolean;
};

export default function ExerciseEditorForm(props: ExerciseEditorFormProps) {
  const i18n = useI18n();
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
        label: draft.name,
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
            name: option.label,
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
        label={i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.ORDER")}
        value={props.draft().order}
        onBlur={props.onCommit}
        onChange={setOrder}
        minValue={minOrder}
        maxValue={maxOrder}
      />
      <AtomCombobox
        label={i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.EXERCISE")}
        options={exerciseOptions()}
        value={selectedExerciseOption()}
        onChange={setExercise}
        disabled={exerciseOptions().length === 0}
        description={
          exerciseOptions().length === 0
            ? i18n.t(
                "MY.COMPETITIONS.EXERCISE_EDITOR.SELECT_CONFIGURATION_FIRST",
              )
            : undefined
        }
        placeholder={i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.SELECT_EXERCISE")}
      />
      <AtomInput
        label={i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.TAGS")}
        value={props.draft().tags.join(", ")}
        onBlur={props.onCommit}
        onChange={setTags}
        description={i18n.t(
          "MY.COMPETITIONS.EXERCISE_EDITOR.COMMA_SEPARATED_TEXT",
        )}
      />
      <div class="exercise-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.CLOSE")}
        </AtomButton>
        <Show when={props.displaySave}>
          <AtomButton onClick={props.onCreate}>
            {i18n.t("MY.COMPETITIONS.EXERCISE_EDITOR.CREATE")}
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
