import type { CreateJudgeRequest } from "@/services/api/judge-crud/judgeCrud.types";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import "./styles.css";

type JudgeFormProps = {
  draft: () => CreateJudgeRequest;
  onDraftChange: (
    updater: (current: CreateJudgeRequest) => CreateJudgeRequest,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeForm(props: JudgeFormProps) {
  const updateField = (field: keyof CreateJudgeRequest) => (value: string) => {
    props.onDraftChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div class="judge-form">
      <AtomInput
        label="--Name"
        value={props.draft().name ?? ""}
        onChange={updateField("name")}
      />
      <div class="judge-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
