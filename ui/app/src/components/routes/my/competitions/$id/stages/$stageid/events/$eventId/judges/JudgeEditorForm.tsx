import type { EventJudgeDetail } from "@/services/secured/event-crud/eventCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "@lib/components/atoms/combobox/AtomCombobox";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";

type JudgeEditorFormProps = {
  draft: () => EventJudgeDetail;
  onCommit: () => void;
  onDraftChange: (
    updater: (current: EventJudgeDetail | null) => EventJudgeDetail | null,
  ) => void;
  onCancel: () => void;
  onCreate: () => void;
  judgeOptions: AtomSelectOption[];
  displaySave?: boolean;
};

export default function JudgeEditorForm(props: JudgeEditorFormProps) {
  const navigate = useNavigate();

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

  const judgeOptions = (): AtomComboboxOption[] =>
    props.judgeOptions.map((option) => ({
      disabled: option.disabled,
      label: option.label,
      preLabel: option.preLabel,
      value: option.value,
    }));

  const selectedJudgeOption = () =>
    judgeOptions().find((option) => option.value === props.draft().id) ?? null;

  const handleJudgeChange = (option: AtomComboboxOption | null) => {
    updateField("id")(option?.value ?? "");
  };

  const handleGoToJudges = () =>
    navigate({
      to: "/my/judges",
    });

  return (
    <div class="judge-editor-form">
      <AtomCombobox
        label="--Judge"
        onChange={(option) => {
          handleJudgeChange(option);
          props.onCommit();
        }}
        options={judgeOptions()}
        placeholder="--Select a judge"
        value={selectedJudgeOption()}
      >
        <Show when={judgeOptions().length === 0}>
          <AtomButton type={BUTTON_TYPES.GHOST} onClick={handleGoToJudges}>
            --Create judge
          </AtomButton>
        </Show>
      </AtomCombobox>
      <AtomInput
        label="--Email"
        type="email"
        value={props.draft().collectorEmail}
        onBlur={props.onCommit}
        onChange={updateField("collectorEmail")}
      />
      <div class="judge-editor-form__actions">
        <AtomButton onClick={props.onCancel} type={BUTTON_TYPES.ACCENT}>
          --Close
        </AtomButton>
        <Show when={props.displaySave}>
          <AtomButton onClick={props.onCreate}>--Create</AtomButton>
        </Show>
      </div>
    </div>
  );
}
