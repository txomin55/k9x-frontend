import type { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { useI18n } from "@/stores/i18n/i18n";
import { createSignal } from "solid-js";
import CountryField from "@/components/common/country-field/CountryField";
import {
  MIN_TEXT_LENGTH,
  validateRequiredSelection,
  validateRequiredText,
} from "@/utils/validation/textField";
import "./styles.css";

type JudgeFormProps = {
  draft: () => JudgeResponseDTO;
  onDraftChange: (
    updater: (current: JudgeResponseDTO) => JudgeResponseDTO,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function JudgeForm(props: JudgeFormProps) {
  const i18n = useI18n();
  const updateField = (field: keyof JudgeResponseDTO) => (value: string) => {
    props.onDraftChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const [nameTouched, setNameTouched] = createSignal(false);
  const [countryTouched, setCountryTouched] = createSignal(false);
  const nameError = () => validateRequiredText(props.draft().name);
  const countryError = () => validateRequiredSelection(props.draft().country);

  const isValid = () => !nameError() && !countryError();

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
      <CountryField
        onChange={(value) => {
          setCountryTouched(true);
          updateField("country")(value.value);
        }}
        value={props.draft().country ?? ""}
        validationState={
          countryTouched() && countryError() ? "invalid" : undefined
        }
        errorMessage={
          countryTouched() && countryError()
            ? i18n.t("COMMON.VALIDATION.REQUIRED")
            : undefined
        }
      />
      <div class="judge-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.JUDGES.JUDGE_FORM.CANCEL")}
        </AtomButton>
        <AtomButton onClick={props.onSave} disabled={!isValid()}>
          {i18n.t("MY.JUDGES.JUDGE_FORM.SAVE")}
        </AtomButton>
      </div>
    </div>
  );
}
