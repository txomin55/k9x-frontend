import type { EventJudgeDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";

type JudgeEditorFormProps = {
  draft: () => EventJudgeDetail;
  onDraftChange: (
    updater: (current: EventJudgeDetail | null) => EventJudgeDetail | null,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
  judgeOptions: AtomSelectOption[];
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

  const selectedJudgeOption = () =>
    props.judgeOptions.find((option) => option.value === props.draft().id) ?? null;

  const handleJudgeChange = (option: AtomSelectOption | null) => {
    updateField("id")(option?.value ?? "");
  };

  return (
    <div class="judge-editor-form">
      <AtomSelect
        label="--Judge"
        onChange={handleJudgeChange}
        options={props.judgeOptions}
        placeholder="--Select a judge"
        value={selectedJudgeOption()}
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
