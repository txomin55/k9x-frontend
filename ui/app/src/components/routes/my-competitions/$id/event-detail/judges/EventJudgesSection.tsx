import { Index, Show } from "solid-js";
import type { PublicStageJudge } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import JudgeEditorForm from "./JudgeEditorForm";

type EventJudgesSectionProps = {
  editingJudgeIndex: number | null;
  isCreatingJudge: boolean;
  isEditing: boolean;
  judgeDialogDraft: PublicStageJudge | null;
  judges: PublicStageJudge[];
  onAddJudge: () => void;
  onCloseJudgeEditor: () => void;
  onDeleteJudge: (index: number) => void;
  onJudgeDraftChange: (
    updater: (current: PublicStageJudge | null) => PublicStageJudge | null,
  ) => void;
  onOpenJudgeEditor: (index: number, judge: PublicStageJudge) => void;
  onSaveJudge: () => void;
};

export default function EventJudgesSection(props: EventJudgesSectionProps) {
  return (
    <section>
      <div>
        <h2>--Judges</h2>
        <Show when={props.isEditing}>
          <CircleButton onClick={props.onAddJudge}>+</CircleButton>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <Show when={props.judgeDialogDraft}>
                {(draft) => (
                  <JudgeEditorForm
                    draft={draft}
                    onDraftChange={props.onJudgeDraftChange}
                    onCancel={props.onCloseJudgeEditor}
                    onSave={props.onSaveJudge}
                  />
                )}
              </Show>
            }
            onOpenChange={(isOpen) => {
              if (!isOpen && props.isCreatingJudge) {
                props.onCloseJudgeEditor();
              }
            }}
            open={props.isCreatingJudge}
            title="--New judge"
            trigger={<span />}
          />
        </Show>
      </div>
      <Show when={props.judges.length > 0} fallback={<p>--No judges.</p>}>
        <div>
          <Index each={props.judges}>
            {(judge, index) => (
              <Card
                topLeft={judge().name || "--No name"}
                description={
                  <p>{`--Email: ${judge().collectorEmail || "--No email"}`}</p>
                }
                actions={
                  props.isEditing ? (
                    <>
                      <AtomDialog
                        closeButtonText="--Close dialog"
                        content={
                          <Show when={props.judgeDialogDraft}>
                            {(draft) => (
                              <JudgeEditorForm
                                draft={draft}
                                onDraftChange={props.onJudgeDraftChange}
                                onCancel={props.onCloseJudgeEditor}
                                onSave={props.onSaveJudge}
                              />
                            )}
                          </Show>
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            props.onOpenJudgeEditor(index, judge());
                            return;
                          }

                          if (props.editingJudgeIndex === index) {
                            props.onCloseJudgeEditor();
                          }
                        }}
                        open={props.editingJudgeIndex === index}
                        title={`--Edit ${judge().name || "judge"}`}
                        trigger={<span>--Edit</span>}
                      />
                      <CircleButton onClick={() => props.onDeleteJudge(index)}>
                        -
                      </CircleButton>
                    </>
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
