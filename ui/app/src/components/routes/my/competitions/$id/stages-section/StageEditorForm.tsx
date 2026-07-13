import type { Accessor } from "solid-js";
import { createSignal, Show } from "solid-js";
import { parseDateInputValue, toDateInputValue } from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { StageEditorModel } from "@/services/secured/stage-crud/stageCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import {
  MIN_TEXT_LENGTH,
  validateRequiredText,
} from "@/utils/validation/textField";

type StageDialogProps = {
  draft: Accessor<StageEditorModel | null>;
  onCancel: () => void;
  onDraftChange: (
    updater: (current: StageEditorModel | null) => StageEditorModel | null,
  ) => void;
  onSave: () => void;
};

export default function StageEditorForm(props: StageDialogProps) {
  const i18n = useI18n();

  const [nameTouched, setNameTouched] = createSignal(false);

  const nameError = () => {
    const draft = props.draft();
    return draft ? validateRequiredText(draft.name) : "REQUIRED";
  };

  const hasDateRangeError = () => {
    const draft = props.draft();
    return draft ? draft.dateTo < draft.dateFrom : false;
  };

  const nameErrorMessage = () => {
    const error = nameError();
    if (error === "REQUIRED") return i18n.t("COMMON.VALIDATION.REQUIRED");
    if (error === "MIN_LENGTH")
      return i18n.t("COMMON.VALIDATION.MIN_LENGTH", { min: MIN_TEXT_LENGTH });
    return undefined;
  };

  const isValid = () => !nameError() && !hasDateRangeError();

  const updateTitle = (value: string) =>
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            name: value,
          }
        : current,
    );

  const updateDateTo = (value: string) =>
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            dateTo: parseDateInputValue(value, current.dateTo),
          }
        : current,
    );

  const updateDateFrom = (value: string) =>
    props.onDraftChange((current) =>
      current
        ? {
            ...current,
            dateFrom: parseDateInputValue(value, current.dateFrom),
          }
        : current,
    );
  return (
    <Show when={props.draft()}>
      {(draft) => (
        <div class="form-grid form-grid--2col">
          <div class="form-grid__full">
            <AtomInput
              label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.STAGE_TITLE")}
              value={draft().name}
              onChange={updateTitle}
              onBlur={() => setNameTouched(true)}
              validationState={
                nameTouched() && nameError() ? "invalid" : undefined
              }
              errorMessage={nameTouched() ? nameErrorMessage() : undefined}
            />
          </div>
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.DATE_FROM")}
            type="date"
            value={toDateInputValue(draft().dateFrom)}
            onChange={updateDateFrom}
            validationState={hasDateRangeError() ? "invalid" : undefined}
          />
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.DATE_TO")}
            type="date"
            value={toDateInputValue(draft().dateTo)}
            onChange={updateDateTo}
            validationState={hasDateRangeError() ? "invalid" : undefined}
            errorMessage={
              hasDateRangeError()
                ? i18n.t("COMMON.VALIDATION.DATE_RANGE")
                : undefined
            }
          />
          <div class="form-grid__actions">
            <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
              {i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.CANCEL")}
            </AtomButton>
            <AtomButton onClick={props.onSave} disabled={!isValid()}>
              {i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.SAVE")}
            </AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
