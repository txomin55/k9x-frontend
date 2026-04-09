import { createMemo, Index, Show } from "solid-js";
import type { EventCompetitorDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import CompetitorEditorForm from "./CompetitorEditorForm";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import "./styles.css";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  competitors: EventCompetitorDetail[];
  editingCompetitorId: string | null;
  isCreatingCompetitor: boolean;
  isEditing: boolean;
  onAddCompetitor: () => void;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onDeleteCompetitor: (competitorId: string) => void;
  onOpenCompetitorEditor: (competitor: EventCompetitorDetail) => void;
  onSaveCompetitor: () => void;
};

export default function EventCompetitorsSection(
  props: EventCompetitorsSectionProps,
) {
  const getOrderValue = (competitor: EventCompetitorDetail) => competitor.order;

  const sortedCompetitors = createMemo(() =>
    [...props.competitors].toSorted(
      (a, b) => getOrderValue(a) - getOrderValue(b),
    ),
  );

  return (
    <section class="event-competitors-section">
      <div class="event-competitors-section__header">
        <h2>--Competitors</h2>
        <Show when={props.isEditing}>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <CompetitorEditorForm
                competitorDialogDraft={props.competitorDialogDraft}
                onCloseCompetitorEditor={props.onCloseCompetitorEditor}
                onCompetitorDraftChange={props.onCompetitorDraftChange}
                onSaveCompetitor={props.onSaveCompetitor}
              />
            }
            onOpenChange={(isOpen) => {
              if (isOpen) {
                props.onAddCompetitor();
              } else {
                props.onCloseCompetitorEditor();
              }
            }}
            open={props.isCreatingCompetitor}
            title="--New competitor"
            trigger={<CircleButton>+</CircleButton>}
          />
        </Show>
      </div>
      <Show
        when={props.competitors.length > 0}
        fallback={<p>--No competitors.</p>}
      >
        <div class="event-competitors-section__competitors">
          <Index each={sortedCompetitors()}>
            {(competitor) => (
              <Card
                topLeft={competitor().owner}
                content={
                  <div class="event-competitors-section__competitors--competitor">
                    <p>{`--Dog: ${competitor().name}`}</p>
                    <p>{`--Identity: ${competitor().identity}`}</p>
                    <p>{`--Team: ${competitor().team}`}</p>
                    <p>{`--Country: ${competitor().country}`}</p>
                    <p>{`--Final score: ${competitor().finalScore}`}</p>
                  </div>
                }
                actions={
                  props.isEditing ? (
                    <div class="event-competitors-section__competitors--actions">
                      <AtomDialog
                        closeButtonText="--Close dialog"
                        content={
                          <CompetitorEditorForm
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
                        title={`--Edit ${competitor().name}`}
                        trigger={<span>--Edit</span>}
                      />
                      <ConfirmActionButton
                        text={competitor().owner}
                        onConfirm={() =>
                          props.onDeleteCompetitor(competitor().dogId)
                        }
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          --Delete
                        </AtomButton>
                      </ConfirmActionButton>
                    </div>
                  ) : undefined
                }
              />
            )}
          </Index>
        </div>
      </Show>
    </section>
  );
}
