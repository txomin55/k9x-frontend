import { Index, Show } from "solid-js";
import type { PublicEventCompetitor } from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: PublicEventCompetitor | null;
  competitors: PublicEventCompetitor[];
  editingCompetitorIndex: number | null;
  isEditing: boolean;
  onAddCompetitor: () => void;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: PublicEventCompetitor | null,
    ) => PublicEventCompetitor | null,
  ) => void;
  onDeleteCompetitor: (index: number) => void;
  onOpenCompetitorEditor: (
    index: number,
    competitor: PublicEventCompetitor,
  ) => void;
  onSaveCompetitor: (index: number) => void;
};

export default function EventCompetitorsSection(
  props: EventCompetitorsSectionProps,
) {
  return (
    <section>
      <div>
        <h2>--Competitors</h2>
        <Show when={props.isEditing}>
          <CircleButton
            aria-label="--Add competitor"
            onClick={props.onAddCompetitor}
          >
            +
          </CircleButton>
        </Show>
      </div>
      <Show
        when={props.competitors.length > 0}
        fallback={<p>--No competitors.</p>}
      >
        <div>
          <Index each={props.competitors}>
            {(competitor, index) => (
              <Card
                topLeft={competitor().name || "--No name"}
                content={
                  <>
                    <p>{`--Owner: ${competitor().owner}`}</p>
                    <p>{`--Identity: ${competitor().identity}`}</p>
                    <p>{`--Final score: ${competitor().finalScore}`}</p>
                  </>
                }
                actions={
                  <Show when={props.isEditing}>
                    <>
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
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
                                  <AtomButton
                                    onClick={props.onCloseCompetitorEditor}
                                  >
                                    --Cancel
                                  </AtomButton>
                                  <AtomButton
                                    onClick={() =>
                                      props.onSaveCompetitor(index)
                                    }
                                  >
                                    --Save
                                  </AtomButton>
                                </div>
                              </div>
                            )}
                          </Show>
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            props.onOpenCompetitorEditor(index, competitor());
                            return;
                          }

                          if (props.editingCompetitorIndex === index) {
                            props.onCloseCompetitorEditor();
                          }
                        }}
                        open={props.editingCompetitorIndex === index}
                        title={`--Edit ${competitor().name || "competitor"}`}
                        trigger={<span>--Edit</span>}
                      />
                      <CircleButton
                        aria-label={`--Delete ${competitor().name || "competitor"}`}
                        onClick={() => props.onDeleteCompetitor(index)}
                      >
                        -
                      </CircleButton>
                    </>
                  </Show>
                }
              />
            )}
          </Index>
        </div>
      </Show>
    </section>
  );
}
