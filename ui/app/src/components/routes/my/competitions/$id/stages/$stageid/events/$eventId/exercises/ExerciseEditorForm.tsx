import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import { EventExerciseDetail } from "@/services/api/event-crud/eventCrud.types";

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
  onSave: () => void;
  orderBounds: OrderBounds;
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
      <AtomInput
        label="--Text"
        value={props.draft().name}
        onBlur={props.onCommit}
        onChange={setText}
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
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
