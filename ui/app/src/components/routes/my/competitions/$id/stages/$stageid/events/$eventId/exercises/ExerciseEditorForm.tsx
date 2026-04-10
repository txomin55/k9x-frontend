import type { EventExerciseDetail } from "@/services/api/competition-crud/competitionCrud.types";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

type OrderBounds = {
  minValue: number;
  maxValue: number;
};

type ExerciseEditorFormProps = {
  draft: () => EventExerciseDetail;
  onDraftChange: (
    updater: (
      current: EventExerciseDetail | null,
    ) => EventExerciseDetail | null,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
  orderBounds: OrderBounds;
};

export default function ExerciseEditorForm(props: ExerciseEditorFormProps) {
  const setOrder = (value: string) => {
    const parsedOrder = Number(value);
    const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0;

    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            order: normalizedOrder,
          }
        : current,
    );
  };

  const setText = (value: string) => {
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            name: value,
          }
        : current,
    );
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

  const minOrder = Math.max(props.orderBounds.minValue, 1);
  const maxOrder = Math.max(minOrder, props.orderBounds.maxValue);

  return (
    <div class="exercise-editor-form">
      <AtomNumberInput
        label="--Order"
        value={props.draft().order}
        onChange={setOrder}
        minValue={minOrder}
        maxValue={maxOrder}
      />
      <AtomInput label="--Text" value={props.draft().name} onChange={setText} />
      <AtomInput
        label="--Tags"
        value={props.draft().tags.join(", ")}
        onChange={setTags}
        description="--Comma separated text"
      />
      <div class="exercise-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
