import { Show } from "solid-js";
import type { PublicEventCompetitor } from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

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

export default function CompetitorDialogContent(
  props: CompetitorDialogContentProps,
) {
  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div>
          <AtomInput
            label="--Name"
            value={draft().name}
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
          <div>
            <AtomButton onClick={props.onCloseCompetitorEditor}>
              --Cancel
            </AtomButton>
            <AtomButton onClick={props.onSaveCompetitor}>--Save</AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
