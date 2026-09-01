import type { EventJudgeDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "library/src/components/atoms/combobox/AtomCombobox";
import AtomCheckbox from "library/src/components/atoms/checkbox/AtomCheckbox";
import AtomInput from "library/src/components/atoms/input/AtomInput";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect";
import { createSignal, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import { validateEmail } from "@/utils/validation/textField";

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
  /** Name of the judge already flagged as main, when it is not this one. */
  mainJudgeTakenBy?: string;
};

export default function JudgeEditorForm(props: JudgeEditorFormProps) {
  const navigate = useNavigate();
  const i18n = useI18n();

  const [emailTouched, setEmailTouched] = createSignal(false);

  const emailError = () => validateEmail(props.draft().collectorEmail);
  const emailInvalid = () => emailTouched() && !!emailError();
  const canSubmit = () => !emailError();

  const updateField = (field: "collectorEmail") => (value: string) => {
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
  };

  const setMainJudge = (mainJudge: boolean) => {
    props.onDraftChange((current) => (current ? { ...current, mainJudge } : current));
    props.onCommit();
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
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            id: option?.value ?? "",
            name: option?.label ?? "",
          }
        : current,
    );
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
        description={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.EMAIL_HINT")}
        value={props.draft().collectorEmail}
        validationState={emailInvalid() ? "invalid" : undefined}
        errorMessage={
          emailInvalid()
            ? i18n.t("COMMON.VALIDATION.INVALID_EMAIL")
            : undefined
        }
        onBlur={() => {
          setEmailTouched(true);
          if (!canSubmit()) return;
          props.onCommit();
        }}
        onChange={updateField("collectorEmail")}
      />
      <div class="judge-editor-form__main-judge">
        <AtomCheckbox
          label={i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.MAIN_JUDGE")}
          checked={props.draft().mainJudge}
          setChecked={setMainJudge}
          disabled={!!props.mainJudgeTakenBy}
        />
        <Show when={props.mainJudgeTakenBy}>
          {(takenBy) => (
            <span class="judge-editor-form__main-judge-hint">
              {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.MAIN_JUDGE_TAKEN", {
                name: takenBy(),
              })}
            </span>
          )}
        </Show>
      </div>
      <div class="judge-editor-form__actions">
        <AtomButton onClick={props.onCancel} type={BUTTON_TYPES.ACCENT}>
          {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.CLOSE")}
        </AtomButton>
        <Show when={props.displaySave}>
          <AtomButton onClick={props.onCreate} disabled={!canSubmit()}>
            {i18n.t("MY.COMPETITIONS.JUDGE_EDITOR.CREATE")}
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
