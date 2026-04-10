import { createMemo, Index, Show } from "solid-js";
import type { EventJudgeDetail } from "@/services/api/competition-crud/competitionCrud.types";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import JudgeEditorForm from "./JudgeEditorForm";
import { useJudges } from "@/services/api/judge-crud/judgeCrud";
import "./styles.css";

type EventJudgesSectionProps = {
  editingJudgeIndex: number | null;
  isCreatingJudge: boolean;
  isEditing: boolean;
  judgeDialogDraft: EventJudgeDetail | null;
  judges: EventJudgeDetail[];
  onAddJudge: () => void;
  onCloseJudgeEditor: () => void;
  onDeleteJudge: (index: number) => void;
  onJudgeDraftChange: (
    updater: (current: EventJudgeDetail | null) => EventJudgeDetail | null,
  ) => void;
  onOpenJudgeEditor: (index: number, judge: EventJudgeDetail) => void;
  onSaveJudge: () => void;
};

export default function EventJudgesSection(props: EventJudgesSectionProps) {
  const judgesQuery = useJudges({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });
  const judgeNameById = createMemo(() => {
    const map = new Map<string, string>();
    for (const judge of judgesQuery.data ?? []) {
      map.set(judge.id, judge.name);
    }
    return map;
  });

  const judgeOptions = createMemo(() =>
    (judgesQuery.data ?? []).map((judge) => ({
      label: judge.name,
      value: judge.id,
    })),
  );

  const getJudgeName = (judgeId: string) =>
    judgeNameById().get(judgeId) ?? judgeId;

  return (
    <section class="event-judges-section">
      <div class="event-judges-section__header">
        <Show when={props.isEditing}>
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
                    judgeOptions={judgeOptions()}
                  />
                )}
              </Show>
            }
            onOpenChange={(isOpen) => {
              if (isOpen) {
                props.onAddJudge();
              } else {
                props.onCloseJudgeEditor();
              }
            }}
            open={props.isCreatingJudge}
            title="--New judge"
            trigger={<CircleButton>+</CircleButton>}
          />
        </Show>
      </div>
      <Show when={props.judges.length > 0} fallback={<p>--No judges.</p>}>
        <div class="event-judges-section__judges">
          <Index each={props.judges}>
            {(judge, index) => (
              <Card
                topLeft={getJudgeName(judge().id)}
                description={<p>{`--Email: ${judge().collectorEmail}`}</p>}
                actions={
                  props.isEditing ? (
                    <div class="event-judges-section__judges--actions">
                      <ConfirmActionButton
                        text={getJudgeName(judge().id)}
                        onConfirm={() => props.onDeleteJudge(index)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          --Delete
                        </AtomButton>
                      </ConfirmActionButton>
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
                                judgeOptions={judgeOptions()}
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
                        title={`--Edit judge`}
                        trigger={<span>--Edit</span>}
                      />
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
