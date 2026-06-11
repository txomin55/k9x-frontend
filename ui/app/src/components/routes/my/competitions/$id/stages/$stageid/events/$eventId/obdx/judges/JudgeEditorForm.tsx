import type { EventJudgeDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "library/src/components/atoms/combobox/AtomCombobox";
import AtomInput from "library/src/components/atoms/input/AtomInput";
import AtomNumberInput from "library/src/components/atoms/number-input/AtomNumberInput";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import { Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";

type JudgeEditorFormProps = {
  draft: () => EventJudgeDetailResponseDTO;
  onCommit: () => void;
  onDraftChange: (
    updater: (
      current: EventJudgeDetailResponseDTO | null,
    ) => EventJudgeDetailResponseDTO | null,
  ) => void;
  onCancel: () => void;
  onCreate: () => void;
  judgeOptions: AtomSelectOption[];
  displaySave?: boolean;
};

export default function JudgeEditorForm(props: JudgeEditorFormProps) {
  const navigate = useNavigate();
  const i18n = useI18n();

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

  const updateRing = (value: number) => {
    const ring = Math.max(1, Math.trunc(value) || 1);

    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            ring,
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
        label={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.JUDGE")}
        onChange={(option) => {
          handleJudgeChange(option);
          props.onCommit();
        }}
        options={judgeOptions()}
        placeholder={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.SELECT_JUDGE")}
        value={selectedJudgeOption()}
      >
        <Show when={judgeOptions().length === 0}>
          <AtomButton type={BUTTON_TYPES.GHOST} onClick={handleGoToJudges}>
            {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.CREATE_JUDGE")}
          </AtomButton>
        </Show>
      </AtomCombobox>
      <AtomInput
        label={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.EMAIL")}
        type="email"
        value={props.draft().collectorEmail}
        onBlur={props.onCommit}
        onChange={updateField("collectorEmail")}
      />
      <AtomNumberInput
        label={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.RING")}
        value={props.draft().ring}
        minValue={1}
        onBlur={props.onCommit}
        onRawValueChange={updateRing}
      />
      <div class="judge-editor-form__actions">
        <AtomButton onClick={props.onCancel} type={BUTTON_TYPES.ACCENT}>
          {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.CLOSE")}
        </AtomButton>
        <Show when={props.displaySave}>
          <AtomButton onClick={props.onCreate}>
            {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.CREATE")}
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
