import { createEffect, createMemo, createSignal, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { fetchRedCard, registerRedCard } from "@/services/secured/red-card-crud/redCardCrud";
import type { RedCardResponseDTO } from "@/services/secured/red-card-crud/redCardCrud.types";
import type { CompetitorScoresResponseDTO } from "@/services/secured/collection-crud/collectionCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import redCardIcon from "@/assets/red-card.svg";
import "./styles.css";

type RedCardDialogProps = {
  eventId: string;
  competitorId: string;
  competitors: CompetitorScoresResponseDTO[];
  judgesIds: string[];
  canChooseJudge: boolean;
};

export default function RedCardDialog(props: RedCardDialogProps) {
  const i18n = useI18n();
  const [isOpen, setIsOpen] = createSignal(false);
  const [isNoteOpen, setIsNoteOpen] = createSignal(false);
  const [existingRedCard, setExistingRedCard] =
    createSignal<RedCardResponseDTO | null>(null);
  const [selectedJudge, setSelectedJudge] = createSignal<AtomSelectOption>();
  const [selectedExercise, setSelectedExercise] =
    createSignal<AtomSelectOption>();

  const selectedCompetitorScores = createMemo(() =>
    props.competitors.find((c) => c.competitor.dog.id === props.competitorId),
  );

  const judgeOptions = createMemo<AtomSelectOption[]>(() => {
    const scores =
      selectedCompetitorScores()?.exercises[0]?.collectionScores ?? [];

    return scores
      .filter((score) =>
        props.judgesIds.length
          ? props.judgesIds.includes(score.judge.id)
          : true,
      )
      .map((score) => ({ label: score.judge.name, value: score.judge.id }));
  });

  const exerciseOptions = createMemo<AtomSelectOption[]>(
    () =>
      selectedCompetitorScores()
        ?.exercises.toSorted(
          (a, b) => a.exercise.position - b.exercise.position,
        )
        .map((e) => ({ label: e.exercise.name, value: e.exercise.id })) ?? [],
  );

  createEffect(() => {
    props.competitorId;
    setSelectedExercise(undefined);
    setSelectedJudge(undefined);
  });

  createEffect(() => {
    if (!props.canChooseJudge && !selectedJudge()) {
      const lockedJudge = judgeOptions()[0];
      if (lockedJudge) {
        setSelectedJudge(lockedJudge);
      }
    }
  });

  const canSubmit = createMemo(
    () =>
      Boolean(props.competitorId) &&
      Boolean(selectedJudge()) &&
      Boolean(selectedExercise()),
  );

  const handleConfirm = () => {
    const judge = selectedJudge();
    const exercise = selectedExercise();

    if (!props.competitorId || !judge || !exercise) {
      return;
    }

    registerRedCard(props.eventId, {
      dogId: props.competitorId,
      exerciseId: exercise.value,
      judgeId: judge.value,
    });

    setSelectedExercise(undefined);
    setIsOpen(false);
  };

  const handleOpenClick = async () => {
    if (!props.competitorId) {
      return;
    }

    const card = await fetchRedCard(props.eventId, props.competitorId);

    if (!card) {
      setIsOpen(true);
      return;
    }

    setExistingRedCard(card);
    setIsNoteOpen(true);
  };

  return (
    <div classList={{ "red-card-dialog__trigger--hidden": !props.competitorId }}>
      <button
        type="button"
        class="red-card-dialog__trigger"
        title={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.BUTTON")}
        aria-label={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.BUTTON")}
        onClick={handleOpenClick}
      >
        <AtomSvgIcon
          src={redCardIcon}
          alt={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.BUTTON")}
        />
      </button>
      <AtomDialog
        title={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.TITLE")}
        open={isNoteOpen()}
        onOpenChange={setIsNoteOpen}
        content={
          <div class="red-card-dialog__content">
            <div class="red-card-dialog__note">
              <p>{i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.ALREADY_HAS_ONE")}</p>
              <Show when={existingRedCard()}>
                {(card) => (
                  <div class="red-card-dialog__note-item">
                    <p class="text-caption-sm">
                      {i18n.t("MY.COLLECTIONS.DETAIL.EXERCISE")}:{" "}
                      {card().exercise.name}
                    </p>
                    <p class="text-caption-sm">
                      {i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.JUDGE")}:{" "}
                      {card().judge.name}
                    </p>
                  </div>
                )}
              </Show>
            </div>
          </div>
        }
      />
      <AtomDialog
        title={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.TITLE")}
        open={isOpen()}
        onOpenChange={setIsOpen}
        content={
          <div class="red-card-dialog__content">
            <AtomSelect
              label={i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.JUDGE")}
              options={judgeOptions()}
              value={selectedJudge()}
              onChange={setSelectedJudge}
              disabled={!props.canChooseJudge}
            />
            <AtomSelect
              label={i18n.t("MY.COLLECTIONS.DETAIL.EXERCISE")}
              options={exerciseOptions()}
              value={selectedExercise()}
              onChange={setSelectedExercise}
            />
            <div class="red-card-dialog__actions">
              <AtomButton
                type={BUTTON_TYPES.ACCENT}
                onClick={() => setIsOpen(false)}
              >
                {i18n.t("COMMON.CONFIRM_ACTION_BUTTON.CANCEL")}
              </AtomButton>
              <AtomButton
                type={BUTTON_TYPES.DESTRUCTIVE}
                onClick={handleConfirm}
                disabled={!canSubmit()}
              >
                {i18n.t("MY.COLLECTIONS.DETAIL.RED_CARD.CONFIRM")}
              </AtomButton>
            </div>
          </div>
        }
      />
    </div>
  );
}
