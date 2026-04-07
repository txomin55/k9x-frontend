import type { Accessor } from "solid-js";
import { Show } from "solid-js";
import type { StageEditorModel } from "@/services/api/stage-api-crud/stageApiCrud";
import { parseDateInputValue, toDateInputValue } from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";

type StageDialogProps = {
  draft: Accessor<StageEditorModel | null>;
  onCancel: () => void;
  onDraftChange: (
    updater: (current: StageEditorModel | null) => StageEditorModel | null,
  ) => void;
  onSave: () => void;
};

export default function StageDialog(props: StageDialogProps) {
  return (
    <Show when={props.draft()}>
      {(draft) => (
        <div>
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
          <label>--Date from</label>
          <input
            type="date"
            value={toDateInputValue(draft().dateFrom)}
            onInput={(event) =>
              props.onDraftChange((current) =>
                current
                  ? {
                      ...current,
                      dateFrom: parseDateInputValue(
                        event.currentTarget.value,
                        current.dateFrom,
                      ),
                    }
                  : current,
              )
            }
          />
          <label>--Date to</label>
          <input
            type="date"
            value={toDateInputValue(draft().dateTo)}
            onInput={(event) =>
              props.onDraftChange((current) =>
                current
                  ? {
                      ...current,
                      dateTo: parseDateInputValue(
                        event.currentTarget.value,
                        current.dateTo,
                      ),
                    }
                  : current,
              )
            }
          />
          <div>
            <AtomButton onClick={props.onCancel}>--Cancel</AtomButton>
            <AtomButton onClick={props.onSave}>--Save</AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
