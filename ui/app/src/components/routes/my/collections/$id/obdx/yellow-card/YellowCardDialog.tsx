import { createEffect, createMemo, createSignal } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { registerYellowCard } from "@/services/secured/yellow-card-crud/yellowCardCrud";
import type { CompetitorScoresResponseDTO } from "@/services/secured/collection-crud/collectionCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type YellowCardDialogProps = {
  eventId: string;
  competitors: CompetitorScoresResponseDTO[];
  judgesIds: string[];
  canChooseJudge: boolean;
};

export default function YellowCardDialog(props: YellowCardDialogProps) {
  const i18n = useI18n();
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedCompetitor, setSelectedCompetitor] =
    createSignal<AtomSelectOption>();
  const [selectedJudge, setSelectedJudge] = createSignal<AtomSelectOption>();
  const [selectedExercise, setSelectedExercise] =
    createSignal<AtomSelectOption>();

  const competitorOptions = createMemo<AtomSelectOption[]>(() =>
    props.competitors
      .toSorted(
        (a, b) => (a.competitor.position ?? 0) - (b.competitor.position ?? 0),
      )
      .map((c) => ({
        label: c.competitor.handler,
        value: c.competitor.dog.id ?? "",
      })),
  );

  const judgeOptions = createMemo<AtomSelectOption[]>(() => {
    const scores = props.competitors[0]?.exercises[0]?.collectionScores ?? [];

    return scores
      .filter((score) =>
        props.judgesIds.length
          ? props.judgesIds.includes(score.judge.id)
          : true,
      )
      .map((score) => ({ label: score.judge.name, value: score.judge.id }));
  });

  const exerciseOptions = createMemo<AtomSelectOption[]>(() => {
    const competitor = props.competitors.find(
      (c) => c.competitor.dog.id === selectedCompetitor()?.value,
    );

    return (
      competitor?.exercises
        .toSorted((a, b) => a.exercise.position - b.exercise.position)
        .map((e) => ({ label: e.exercise.name, value: e.exercise.id })) ?? []
    );
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
      Boolean(selectedCompetitor()) &&
      Boolean(selectedJudge()) &&
      Boolean(selectedExercise()),
  );

  const handleCompetitorChange = (option: AtomSelectOption) => {
    setSelectedCompetitor(option);
    setSelectedExercise(undefined);
  };

  const handleConfirm = () => {
    const competitor = selectedCompetitor();
    const judge = selectedJudge();
    const exercise = selectedExercise();

    if (!competitor || !judge || !exercise) {
      return;
    }

    registerYellowCard(props.eventId, {
      dogId: competitor.value,
      exerciseId: exercise.value,
      judgeId: judge.value,
    });

    setSelectedCompetitor(undefined);
    setSelectedExercise(undefined);
    setIsOpen(false);
  };

  return (
    <AtomDialog
      title={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.TITLE")}
      open={isOpen()}
      onOpenChange={setIsOpen}
      trigger={
        <AtomButton type={BUTTON_TYPES.WARNING}>
          {i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.BUTTON")}
        </AtomButton>
      }
      content={
        <div class="yellow-card-dialog__content">
          <AtomSelect
            label={i18n.t("MY.COLLECTIONS.DETAIL.COMPETITORS")}
            options={competitorOptions()}
            value={selectedCompetitor()}
            onChange={handleCompetitorChange}
          />
          <AtomSelect
            label={i18n.t("MY.COLLECTIONS.DETAIL.YELLOW_CARD.JUDGE")}
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
  );
}
