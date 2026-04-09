import type { EventJudgeDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import AtomInput from "@lib/components/atoms/input/AtomInput";

type JudgeEditorFormProps = {
  draft: () => EventJudgeDetail;
  onDraftChange: (
    updater: (current: EventJudgeDetail | null) => EventJudgeDetail | null,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeEditorForm(props: JudgeEditorFormProps) {
  const updateField = (field: "id" | "collectorEmail") => (value: string) => {
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
    <div class="judge-editor-form">
      <AtomInput
        label="--Judge ID"
        value={props.draft().id}
        onChange={updateField("id")}
      />
      <AtomInput
        label="--Email"
        type="email"
        value={props.draft().collectorEmail}
        onChange={updateField("collectorEmail")}
      />
      <div class="judge-editor-form__actions">
        <AtomButton onClick={props.onCancel} type={BUTTON_TYPES.ACCENT}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
