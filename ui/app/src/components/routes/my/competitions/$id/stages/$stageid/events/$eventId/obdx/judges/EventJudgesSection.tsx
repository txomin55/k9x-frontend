import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "library/src/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import AtomBadge, {
  BADGE_TYPES,
} from "library/src/components/atoms/badge/AtomBadge";
import Card from "library/src/components/molecules/card/Card";
import CircleButton from "library/src/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import JudgeEditorForm from "./JudgeEditorForm";
import { useJudges } from "@/services/secured/judge-crud/judgeCrud";
import { EventJudgeDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type EventJudgesSectionProps = {
  editingJudgeId: string | null;
  onCommitJudge: () => void;
  isCreatingJudge: boolean;
  isEditing: boolean;
  judgeDialogDraft: EventJudgeDetailResponseDTO | null;
  judges: EventJudgeDetailResponseDTO[];
  onAddJudge: () => void;
  onDeleteJudge: (judgeId: string) => void;
  onJudgeDraftChange: (
    updater: (
      current: EventJudgeDetailResponseDTO | null,
    ) => EventJudgeDetailResponseDTO | null,
  ) => void;
  onOpenJudgeEditor: (judge: EventJudgeDetailResponseDTO) => void;
  onCreateJudge: () => void;
};

export default function EventJudgesSection(props: EventJudgesSectionProps) {
  const i18n = useI18n();
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

  const judgeOptions = createMemo(() => {
    const addedJudgeIds = new Set(
      props.judges
        .filter((judge) => judge.id !== props.editingJudgeId)
        .map((judge) => judge.id),
    );

    return (judgesQuery.data ?? [])
      .filter((judge) => !addedJudgeIds.has(judge.id))
      .map((judge) => ({
        label: judge.name,
        value: judge.id,
      }));
  });

  const getJudgeName = (judgeId: string) =>
    judgeNameById().get(judgeId) ?? judgeId;

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const viewDialogTitle = () => {
    if (props.isCreatingJudge) {
      return i18n.t("MY.COMPETITIONS.EVENT_JUDGES.NEW_JUDGE");
    }

    return i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EDIT_JUDGE");
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
      <Show
        when={props.judges.length > 0}
        fallback={<p>{i18n.t("MY.COMPETITIONS.EVENT_JUDGES.NO_JUDGES")}</p>}
      >
        <div class="event-judges-section__judges">
          <Index each={props.judges}>
            {(judge) => (
              <Card
                topLeft={getJudgeName(judge().id)}
                topRight={
                  <AtomBadge type={BADGE_TYPES.ACCENT}>
                    {`${i18n.t("MY.COMPETITIONS.EVENT_JUDGES.RING")} ${judge().ring}`}
                  </AtomBadge>
                }
                description={
                  <p>{`${i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EMAIL")}: ${judge().collectorEmail}`}</p>
                }
                actions={
                  props.isEditing ? (
                    <div class="event-judges-section__judges--actions">
                      <ConfirmActionButton
                        text={getJudgeName(judge().id)}
                        onConfirm={() => props.onDeleteJudge(judge().id)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          {i18n.t("MY.COMPETITIONS.EVENT_JUDGES.DELETE")}
                        </AtomButton>
                      </ConfirmActionButton>
                      <span
                        onClick={() => {
                          props.onOpenJudgeEditor(judge());
                          setDialogOpen(true);
                        }}
                      >
                        {i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EDIT")}
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
        closeButtonText={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.CLOSE_DIALOG")}
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
