import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { useI18n } from "@/stores/i18n/i18n";
import { createSignal } from "solid-js";
import {
  MIN_TEXT_LENGTH,
  validateRequiredText,
} from "@/utils/validation/textField";
import "./styles.css";

type JudgeFormProps = {
  draft: () => IdNameDTO;
  onDraftChange: (
    updater: (current: IdNameDTO) => IdNameDTO,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeForm(props: JudgeFormProps) {
  const i18n = useI18n();
  const updateField = (field: keyof IdNameDTO) => (value: string) => {
    props.onDraftChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const [nameTouched, setNameTouched] = createSignal(false);
  const nameError = () => validateRequiredText(props.draft().name);

  const nameErrorMessage = () => {
    const error = nameError();
    if (error === "REQUIRED") return i18n.t("COMMON.VALIDATION.REQUIRED");
    if (error === "MIN_LENGTH")
      return i18n.t("COMMON.VALIDATION.MIN_LENGTH", { min: MIN_TEXT_LENGTH });
    return undefined;
  };

  return (
    <div class="judge-form">
      <AtomInput
        label={i18n.t("MY.JUDGES.JUDGE_FORM.NAME")}
        value={props.draft().name ?? ""}
        onChange={updateField("name")}
        onBlur={() => setNameTouched(true)}
        validationState={
          nameTouched() && nameError() ? "invalid" : undefined
        }
        errorMessage={nameTouched() ? nameErrorMessage() : undefined}
      />
      <div class="judge-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.JUDGES.JUDGE_FORM.CANCEL")}
        </AtomButton>
        <AtomButton onClick={props.onSave} disabled={!!nameError()}>
          {i18n.t("MY.JUDGES.JUDGE_FORM.SAVE")}
        </AtomButton>
      </div>
    </div>
  );
}
