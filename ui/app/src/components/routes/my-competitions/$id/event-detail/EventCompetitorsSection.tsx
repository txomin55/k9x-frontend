import { Index, Show } from "solid-js";
import type { PublicEventCompetitor } from "@/services/api/competition_crud/competitionCrudTypes";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import CompetitorDialogContent from "./CompetitorDialogContent";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: PublicEventCompetitor | null;
  competitors: PublicEventCompetitor[];
  editingCompetitorId: string | null;
  isCreatingCompetitor: boolean;
  isEditing: boolean;
  onAddCompetitor: () => void;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: PublicEventCompetitor | null,
    ) => PublicEventCompetitor | null,
  ) => void;
  onDeleteCompetitor: (competitorId: string) => void;
  onOpenCompetitorEditor: (competitor: PublicEventCompetitor) => void;
  onSaveCompetitor: () => void;
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
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <CompetitorDialogContent
                competitorDialogDraft={props.competitorDialogDraft}
                onCloseCompetitorEditor={props.onCloseCompetitorEditor}
                onCompetitorDraftChange={props.onCompetitorDraftChange}
                onSaveCompetitor={props.onSaveCompetitor}
              />
            }
            onOpenChange={(isOpen) => {
              if (!isOpen && props.isCreatingCompetitor) {
                props.onCloseCompetitorEditor();
              }
            }}
            open={props.isCreatingCompetitor}
            title="--New competitor"
            trigger={<span />}
          />
        </Show>
      </div>
      <Show
        when={props.competitors.length > 0}
        fallback={<p>--No competitors.</p>}
      >
        <div>
          <Index each={props.competitors}>
            {(competitor) => (
              <Card
                topLeft={competitor().name || "--No name"}
                content={
                  <>
                    <p>{`--Owner: ${competitor().owner}`}</p>
                    <p>{`--Identity: ${competitor().identity}`}</p>
                    <p>{`--Team: ${competitor().team}`}</p>
                    <p>{`--Country: ${competitor().country}`}</p>
                    <p>{`--Final score: ${competitor().finalScore}`}</p>
                  </>
                }
                actions={
                  <Show when={props.isEditing}>
                    <>
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
                          <CompetitorDialogContent
                            competitorDialogDraft={props.competitorDialogDraft}
                            onCloseCompetitorEditor={
                              props.onCloseCompetitorEditor
                            }
                            onCompetitorDraftChange={
                              props.onCompetitorDraftChange
                            }
                            onSaveCompetitor={props.onSaveCompetitor}
                          />
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            props.onOpenCompetitorEditor(competitor());
                            return;
                          }

                          if (
                            props.editingCompetitorId === competitor().dogId
                          ) {
                            props.onCloseCompetitorEditor();
                          }
                        }}
                        open={props.editingCompetitorId === competitor().dogId}
                        title={`--Edit ${competitor().name || "competitor"}`}
                        trigger={<span>--Edit</span>}
                      />
                      <CircleButton
                        aria-label={`--Delete ${competitor().name || "competitor"}`}
                        onClick={() =>
                          props.onDeleteCompetitor(competitor().dogId)
                        }
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
