import type { PublicEventExercise } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

type ExerciseEditorFormProps = {
  draft: () => PublicEventExercise;
  onDraftChange: (
    updater: (
      current: PublicEventExercise | null,
    ) => PublicEventExercise | null,
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
    <div>
      <AtomNumberInput
        label="--Order"
        value={props.draft().order}
        onChange={setOrder}
      />
      <AtomInput
        label="--Text"
        value={props.draft().text}
        onChange={setText}
      />
      <div>
        <AtomButton onClick={props.onCancel}>--Cancel</AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
