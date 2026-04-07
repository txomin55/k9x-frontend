import type { PublicStageJudge } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";

type JudgeEditorFormProps = {
  draft: () => PublicStageJudge;
  onDraftChange: (
    updater: (current: PublicStageJudge | null) => PublicStageJudge | null,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeEditorForm(props: JudgeEditorFormProps) {
  const updateField = (field: "name" | "collectorEmail") => (value: string) => {
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  };

  return (
    <div>
      <AtomInput
        label="--Name"
        value={props.draft().name}
        onChange={updateField("name")}
      />
      <AtomInput
        label="--Email"
        type="email"
        value={props.draft().collectorEmail}
        onChange={updateField("collectorEmail")}
      />
      <div>
        <AtomButton onClick={props.onCancel}>--Cancel</AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
