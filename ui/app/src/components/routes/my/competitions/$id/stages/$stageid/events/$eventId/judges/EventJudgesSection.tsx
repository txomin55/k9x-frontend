import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import JudgeEditorForm from "./JudgeEditorForm";
import { useJudges } from "@/services/api/judge-crud/judgeCrud";
import { EventJudgeDetail } from "@/services/api/event-crud/eventCrud.types";
import "./styles.css";

type EventJudgesSectionProps = {
  editingJudgeId: string | null;
  onCommitJudge: () => void;
  isCreatingJudge: boolean;
  isEditing: boolean;
  judgeDialogDraft: EventJudgeDetail | null;
  judges: EventJudgeDetail[];
  onAddJudge: () => void;
  onDeleteJudge: (judgeId: string) => void;
  onJudgeDraftChange: (
    updater: (current: EventJudgeDetail | null) => EventJudgeDetail | null,
  ) => void;
  onOpenJudgeEditor: (judge: EventJudgeDetail) => void;
  onCreateJudge: () => void;
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

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const viewDialogTitle = () => {
    if (props.isCreatingJudge) {
      return "--New judge";
    }

    return "--Edit judge";
  };

  return (
    <section class="event-judges-section">
      <div class="event-judges-section__header">
        <Show when={props.isEditing}>
          <CircleButton
            onClick={() => {
              props.onAddJudge();
              setDialogOpen(true);
            }}
          >
            +
          </CircleButton>
        </Show>
      </div>
      <Show when={props.judges.length > 0} fallback={<p>--No judges.</p>}>
        <div class="event-judges-section__judges">
          <Index each={props.judges}>
            {(judge) => (
              <Card
                topLeft={getJudgeName(judge().id)}
                description={<p>{`--Email: ${judge().collectorEmail}`}</p>}
                actions={
                  props.isEditing ? (
                    <div class="event-judges-section__judges--actions">
                      <ConfirmActionButton
                        text={getJudgeName(judge().id)}
                        onConfirm={() => props.onDeleteJudge(judge().id)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          --Delete
                        </AtomButton>
                      </ConfirmActionButton>
                      <span
                        onClick={() => {
                          props.onOpenJudgeEditor(judge());
                          setDialogOpen(true);
                        }}
                      >
                        --Edit
                      </span>
                    </div>
                  ) : undefined
                }
              />
            )}
          </Index>
        </div>
      </Show>
      <AtomDialog
        closeButtonText="--Close dialog"
        content={
          <Show when={props.judgeDialogDraft}>
            {(draft) => (
              <JudgeEditorForm
                draft={draft}
                onCommit={props.onCommitJudge}
                onDraftChange={props.onJudgeDraftChange}
                onCancel={() => {
                  setDialogOpen(false);
                }}
                onCreate={() => {
                  props.onCreateJudge();
                  setDialogOpen(false);
                }}
                judgeOptions={judgeOptions()}
                displaySave={props.isCreatingJudge}
              />
            )}
          </Show>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen()}
        title={viewDialogTitle()}
      />
    </section>
  );
}
