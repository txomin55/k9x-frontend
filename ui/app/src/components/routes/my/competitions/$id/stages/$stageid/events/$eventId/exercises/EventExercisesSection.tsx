import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ExerciseEditorForm from "./ExerciseEditorForm";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import { EventExerciseDetail } from "@/services/secured/event-crud/eventCrud.types";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type EventExercisesSectionProps = {
  onCommitExercise: () => void;
  editingExerciseId: string | null;
  exerciseDialogDraft: EventExerciseDetail | null;
  exercises: EventExerciseDetail[];
  exerciseCandidatesOptions: AtomSelectOption[];
  isCreatingExercise: boolean;
  isEditing: boolean;
  onAddExercise: () => void;
  onDeleteExercise: (exerciseId: string) => void;
  onExerciseDraftChange: (
    updater: (
      current: EventExerciseDetail | null,
    ) => EventExerciseDetail | null,
  ) => void;
  onOpenExerciseEditor: (exercise: EventExerciseDetail) => void;
  onCreateExercise: () => void;
};

export default function EventExercisesSection(
  props: EventExercisesSectionProps,
) {
  const i18n = useI18n();
  const getOrderValue = (exercise: EventExerciseDetail) => exercise.order;
  const getExerciseName = (exercise: EventExerciseDetail) => {
    if (exercise.name) {
      return exercise.name;
    }

    return (
      props.exerciseCandidatesOptions
        .find((option) => option.value === exercise.id)
        ?.label.replace(/^--/, "") ?? exercise.id
    );
  };

  const sortedExercises = createMemo(() =>
    [...props.exercises].toSorted(
      (a, b) => getOrderValue(a) - getOrderValue(b),
    ),
  );
  const exerciseOrderBounds = () => ({
    minValue: 1,
    maxValue: Math.max(
      1,
      props.exercises.length + (props.isCreatingExercise ? 1 : 0),
    ),
  });

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const viewDialogTitle = () => {
    if (props.isCreatingExercise) {
      return i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.NEW_EXERCISE");
    }

    return i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EDIT_EXERCISE");
  };

  return (
    <section class="event-exercises-section">
      <div class="event-exercises-section__header">
        <Show when={props.isEditing}>
          <CircleButton
            onClick={() => {
              props.onAddExercise();
              setDialogOpen(true);
            }}
          >
            +
          </CircleButton>
        </Show>
      </div>
      <Show when={props.exercises.length > 0} fallback={<p>{i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.NO_EXERCISES")}</p>}>
        <div class="event-exercises-section__exercises">
          <Index each={sortedExercises()}>
            {(exercise) => (
              <Card
                topLeft={`#${exercise().order}`}
                description={
                  <div>
                    <p>{getExerciseName(exercise())}</p>
                    <Index each={exercise().tags}>
                      {(tag) => (
                        <AtomBadge textValue={tag()}>{tag()}</AtomBadge>
                      )}
                    </Index>
                  </div>
                }
                actions={
                  props.isEditing ? (
                    <div class="event-exercises-section__exercises--actions">
                      <ConfirmActionButton
                        text={getExerciseName(exercise())}
                        onConfirm={() => props.onDeleteExercise(exercise().id)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          {i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.DELETE")}
                        </AtomButton>
                      </ConfirmActionButton>
                      <span
                        onClick={() => {
                          props.onOpenExerciseEditor(exercise());
                          setDialogOpen(true);
                        }}
                      >
                        {i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EDIT")}
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
        closeButtonText={i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.CLOSE_DIALOG")}
        content={
          <Show when={props.exerciseDialogDraft}>
            {(draft) => (
              <ExerciseEditorForm
                draft={draft}
                onCommit={props.onCommitExercise}
                onDraftChange={props.onExerciseDraftChange}
                onCancel={() => {
                  setDialogOpen(false);
                }}
                onCreate={() => {
                  props.onCreateExercise();
                  setDialogOpen(false);
                }}
                orderBounds={exerciseOrderBounds()}
                exerciseOptions={props.exerciseCandidatesOptions}
                displaySave={props.isCreatingExercise}
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
