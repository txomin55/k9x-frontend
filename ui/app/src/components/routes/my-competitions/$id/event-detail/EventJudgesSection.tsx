import { Index, Show } from "solid-js";
import type { PublicStageJudge } from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

type EventJudgesSectionProps = {
  editingJudgeIndex: number | null;
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
  onSaveJudge: (index: number) => void;
};

export default function EventJudgesSection(props: EventJudgesSectionProps) {
  return (
    <section>
      <div>
        <h2>--Judges</h2>
        <Show when={props.isEditing}>
          <CircleButton aria-label="--Add judge" onClick={props.onAddJudge}>
            +
          </CircleButton>
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
                  <Show when={props.isEditing}>
                    <>
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
                          <Show when={props.judgeDialogDraft}>
                            {(draft) => (
                              <div>
                                <AtomInput
                                  label="--Name"
                                  value={draft().name}
                                  onChange={(value) =>
                                    props.onJudgeDraftChange((current) =>
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
                                  label="--Email"
                                  type="email"
                                  value={draft().collectorEmail}
                                  onChange={(value) =>
                                    props.onJudgeDraftChange((current) =>
                                      current
                                        ? {
                                            ...current,
                                            collectorEmail: value,
                                          }
                                        : current,
                                    )
                                  }
                                />
                                <div>
                                  <AtomButton
                                    onClick={props.onCloseJudgeEditor}
                                  >
                                    --Cancel
                                  </AtomButton>
                                  <AtomButton
                                    onClick={() => props.onSaveJudge(index)}
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
                      <CircleButton
                        aria-label={`--Delete ${judge().name || "judge"}`}
                        onClick={() => props.onDeleteJudge(index)}
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
