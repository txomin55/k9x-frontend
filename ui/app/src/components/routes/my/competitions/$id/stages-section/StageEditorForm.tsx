import type { Accessor } from "solid-js";
import { Show } from "solid-js";
import type { StageEditorModel } from "@/services/api/stage-api-crud/stageApiCrud";
import { parseDateInputValue, toDateInputValue } from "@/utils/stage";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";

type StageDialogProps = {
  draft: Accessor<StageEditorModel | null>;
  onCancel: () => void;
  onDraftChange: (
    updater: (current: StageEditorModel | null) => StageEditorModel | null,
  ) => void;
  onSave: () => void;
};

export default function StageEditorForm(props: StageDialogProps) {
  return (
    <Show when={props.draft()}>
      {(draft) => (
        <div class="stage-editor-form">
          <AtomInput
            label="--Stage title"
            value={draft().name}
            onChange={(value) =>
              props.onDraftChange((current) =>
                current
                  ? {
                      ...current,
                      name: value,
                    }
                  : current,
              )
            }
          />
          <AtomInput
            label="--Date from"
            type="date"
            value={toDateInputValue(draft().dateFrom)}
            onChange={(value) =>
              props.onDraftChange((current) =>
                current
                  ? {
                      ...current,
                      dateFrom: parseDateInputValue(value, current.dateFrom),
                    }
                  : current,
              )
            }
          />
          <AtomInput
            label="--Date to"
            type="date"
            value={toDateInputValue(draft().dateTo)}
            onChange={(value) =>
              props.onDraftChange((current) =>
                current
                  ? {
                      ...current,
                      dateTo: parseDateInputValue(value, current.dateTo),
                    }
                  : current,
              )
            }
          />
          <div class="stage-editor-form__actions">
            <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
              --Cancel
            </AtomButton>
            <AtomButton onClick={props.onSave}>--Save</AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
