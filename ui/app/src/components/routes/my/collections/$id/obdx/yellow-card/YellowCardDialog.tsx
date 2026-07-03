import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { fetchYellowCards, registerYellowCard } from "@/services/secured/yellow-card-crud/yellowCardCrud";
import type { YellowCardResponseDTO } from "@/services/secured/yellow-card-crud/yellowCardCrud.types";
import type { CompetitorScoresResponseDTO } from "@/services/secured/collection-crud/collectionCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import yellowCardIcon from "@/assets/yellow-card.svg";
import "./styles.css";

type YellowCardDialogProps = {
  eventId: string;
  competitorId: string;
  competitors: CompetitorScoresResponseDTO[];
  judgesIds: string[];
  canChooseJudge: boolean;
};

export default function YellowCardDialog(props: YellowCardDialogProps) {
  const i18n = useI18n();
  const [isOpen, setIsOpen] = createSignal(false);
  const [isNoteOpen, setIsNoteOpen] = createSignal(false);
  const [existingYellowCards, setExistingYellowCards] = createSignal<
    YellowCardResponseDTO[]
  >([]);
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
    if (isOpen()) {
      setSelectedExercise(undefined);
      setSelectedJudge(undefined);
    }
  });

  createEffect(() => {
    if (!props.canChooseJudge && !selectedJudge()) {
      const lockedJudge = judgeOptions()[0];
      if (lockedJudge) {
        setSelectedJudge(lockedJudge);
      }
    }
  });

  const isDuplicateSelection = createMemo(() => {
    const judge = selectedJudge();
    const exercise = selectedExercise();

    if (!judge || !exercise) {
      return false;
    }

    return existingYellowCards().some(
      (card) =>
        card.judge.id === judge.value && card.exercise.id === exercise.value,
    );
  });

  const canSubmit = createMemo(
    () =>
      Boolean(props.competitorId) &&
      Boolean(selectedJudge()) &&
      Boolean(selectedExercise()) &&
      !isDuplicateSelection(),
  );

  const handleConfirm = () => {
    const judge = selectedJudge();
    const exercise = selectedExercise();

    if (!props.competitorId || !judge || !exercise) {
      return;
    }

    registerYellowCard(props.eventId, {
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

    const cards = await fetchYellowCards(props.eventId, props.competitorId);

    if (cards.length === 0) {
      setIsOpen(true);
      return;
    }

    setExistingYellowCards(cards);
    setIsNoteOpen(true);
  };

  const handleAcceptNote = () => {
    setIsNoteOpen(false);
    setIsOpen(true);
  };

  return (
    <div
      classList={{ "yellow-card-dialog__trigger--hidden": !props.competitorId }}
    >
      <button
        type="button"
        class="yellow-card-dialog__trigger"
        title={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.BUTTON")}
        aria-label={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.BUTTON")}
        onClick={handleOpenClick}
      >
        <AtomSvgIcon
          src={yellowCardIcon}
          alt={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.BUTTON")}
        />
      </button>
      <AtomDialog
        title={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.TITLE")}
        open={isNoteOpen()}
        onOpenChange={setIsNoteOpen}
        content={
          <div class="yellow-card-dialog__content">
            <div class="yellow-card-dialog__note">
              <p>
                {existingYellowCards().length >= 2
                  ? i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.ALREADY_HAS_TWO")
                  : i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.ALREADY_HAS_ONE")}
              </p>
              <For each={existingYellowCards()}>
                {(card) => (
                  <div class="yellow-card-dialog__note-item">
                    <p class="text-caption-sm">
                      {i18n.t("MY.COLLECTIONS.DETAIL.EXERCISE")}:{" "}
                      {card.exercise.name}
                    </p>
                    <p class="text-caption-sm">
                      {i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.JUDGE")}:{" "}
                      {card.judge.name}
                    </p>
                  </div>
                )}
              </For>
            </div>
            <Show when={existingYellowCards().length < 2}>
              <div class="yellow-card-dialog__actions">
                <AtomButton
                  type={BUTTON_TYPES.WARNING}
                  onClick={handleAcceptNote}
                >
                  {i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.ACCEPT")}
                </AtomButton>
              </div>
            </Show>
          </div>
        }
      />
      <AtomDialog
        title={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.TITLE")}
        open={isOpen()}
        onOpenChange={setIsOpen}
        content={
          <div class="yellow-card-dialog__content">
            <AtomSelect
              label={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.JUDGE")}
              placeholder={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.SELECT_JUDGE")}
              options={judgeOptions()}
              value={selectedJudge()}
              onChange={setSelectedJudge}
              disabled={!props.canChooseJudge}
            />
            <AtomSelect
              label={i18n.t("MY.COLLECTIONS.DETAIL.EXERCISE")}
              placeholder={i18n.t("MY.COLLECTIONS.DETAIL.SELECT_EXERCISE")}
              options={exerciseOptions()}
              value={selectedExercise()}
              onChange={setSelectedExercise}
            />
            <Show when={isDuplicateSelection()}>
              <p class="text-caption-sm yellow-card-dialog__duplicate-warning">
                {i18n.t(
                  "MY.COLLECTIONS.DETAIL.YELLOW_CARD.DUPLICATE_SELECTION",
                )}
              </p>
            </Show>
            <div class="yellow-card-dialog__actions">
              <AtomButton
                type={BUTTON_TYPES.ACCENT}
                onClick={() => setIsOpen(false)}
              >
                {i18n.t("COMMON.CONFIRM_ACTION_BUTTON.CANCEL")}
              </AtomButton>
              <AtomButton
                type={BUTTON_TYPES.WARNING}
                onClick={handleConfirm}
                disabled={!canSubmit()}
              >
                {i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.CONFIRM")}
              </AtomButton>
            </div>
          </div>
        }
      />
    </div>
  );
}
