import type { Accessor } from "solid-js";
import { Show } from "solid-js";
import { parseDateInputValue, toDateInputValue } from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { StageEditorModel } from "@/services/secured/stage-crud/stageCrud.types";
import { useI18n } from "@/stores/i18n/i18n";

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
        <div class="stage-editor-form">
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.STAGE_TITLE")}
            value={draft().name}
            onChange={updateTitle}
          />
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.DATE_FROM")}
            type="date"
            value={toDateInputValue(draft().dateFrom)}
            onChange={updateDateFrom}
          />
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.DATE_TO")}
            type="date"
            value={toDateInputValue(draft().dateTo)}
            onChange={updateDateTo}
          />
          <div class="stage-editor-form__actions">
            <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
              {i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.CANCEL")}
            </AtomButton>
            <AtomButton onClick={props.onSave}>
              {i18n.t("MY.COMPETITIONS.STAGE_EDITOR_FORM.SAVE")}
            </AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
