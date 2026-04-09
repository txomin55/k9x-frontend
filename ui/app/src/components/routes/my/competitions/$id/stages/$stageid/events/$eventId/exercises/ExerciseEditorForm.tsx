import type { EventExerciseDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

type ExerciseEditorFormProps = {
  draft: () => EventExerciseDetail;
  onDraftChange: (
    updater: (
      current: EventExerciseDetail | null,
    ) => EventExerciseDetail | null,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
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
            text: value,
          }
        : current,
    );
  };

  return (
    <div class="exercise-editor-form">
      <AtomNumberInput
        label="--Order"
        value={props.draft().order}
        onChange={setOrder}
      />
      <AtomInput label="--Text" value={props.draft().text} onChange={setText} />
      <div class="exercise-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
