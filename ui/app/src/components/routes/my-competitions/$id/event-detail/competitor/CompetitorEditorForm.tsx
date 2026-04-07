import type { PublicEventCompetitor } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import { Show } from "solid-js";

type CompetitorDialogContentProps = {
  competitorDialogDraft: PublicEventCompetitor | null;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: PublicEventCompetitor | null,
    ) => PublicEventCompetitor | null,
  ) => void;
  onSaveCompetitor: () => void;
};

export default function CompetitorEditorForm(
  props: CompetitorDialogContentProps,
) {
  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div class="competitor-editor-form">
          <AtomInput
            label="--Owner"
            value={draft().owner}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      owner: value,
                    }
                  : current,
              )
            }
          />
          <AtomInput
            label="--Name"
            value={draft().name}
            description={`--Breed ${draft().breed}`}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
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
            label="--Identity"
            value={draft().identity}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      identity: value,
                    }
                  : current,
              )
            }
          />
          <AtomInput
            label="--Team"
            value={draft().team}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      team: value,
                    }
                  : current,
              )
            }
          />
          <AtomInput
            label="--Country"
            value={draft().country}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      country: value,
                    }
                  : current,
              )
            }
          />
          <AtomNumberInput
            label="--Order"
            value={draft().order}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      order: Number(value) || 0,
                    }
                  : current,
              )
            }
          />
          <AtomNumberInput
            label="--Final score"
            value={draft().finalScore}
            onChange={(value) =>
              props.onCompetitorDraftChange((current) =>
                current
                  ? {
                      ...current,
                      finalScore: Number(value) || 0,
                    }
                  : current,
              )
            }
          />
          <div class="competitor-editor-form__actions">
            <AtomButton type="accent" onClick={props.onCloseCompetitorEditor}>
              --Cancel
            </AtomButton>
            <AtomButton onClick={props.onSaveCompetitor}>--Save</AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
