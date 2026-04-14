import type { EventJudgeDetail } from "@/services/api/event-crud/eventCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";

type JudgeEditorFormProps = {
  draft: () => EventJudgeDetail;
  onCommit: () => void;
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
    props.judgeOptions.find((option) => option.value === props.draft().id) ??
    null;

  const handleJudgeChange = (option: AtomSelectOption | null) => {
    updateField("id")(option?.value ?? "");
  };

  return (
    <div class="judge-editor-form">
      <AtomSelect
        label="--Judge"
        onChange={(option) => {
          handleJudgeChange(option);
          props.onCommit();
        }}
        options={props.judgeOptions}
        placeholder="--Select a judge"
        value={selectedJudgeOption()}
      />
      <AtomInput
        label="--Email"
        type="email"
        value={props.draft().collectorEmail}
        onBlur={props.onCommit}
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
