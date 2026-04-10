import { createMemo, Index, Show } from "solid-js";
import type { EventExerciseDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ExerciseEditorForm from "./ExerciseEditorForm";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import "./styles.css";

type EventExercisesSectionProps = {
  editingExerciseId: string | null;
  exerciseDialogDraft: EventExerciseDetail | null;
  exercises: EventExerciseDetail[];
  isCreatingExercise: boolean;
  isEditing: boolean;
  onAddExercise: () => void;
  onCloseExerciseEditor: () => void;
  onDeleteExercise: (exerciseId: string) => void;
  onExerciseDraftChange: (
    updater: (
      current: EventExerciseDetail | null,
    ) => EventExerciseDetail | null,
  ) => void;
  onOpenExerciseEditor: (exercise: EventExerciseDetail) => void;
  onSaveExercise: () => void;
};

export default function EventExercisesSection(
  props: EventExercisesSectionProps,
) {
  const getOrderValue = (exercise: EventExerciseDetail) => exercise.order;

  const sortedExercises = createMemo(() =>
    [...props.exercises].toSorted(
      (a, b) => getOrderValue(a) - getOrderValue(b),
    ),
  );
  const exerciseOrderBounds = {
    minValue: 1,
    maxValue: Math.max(1, props.exercises.length),
  };

  return (
    <section class="event-exercises-section">
      <div class="event-exercises-section__header">
        <Show when={props.isEditing}>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <Show when={props.exerciseDialogDraft}>
                {(draft) => (
                  <ExerciseEditorForm
                    draft={draft}
                    onDraftChange={props.onExerciseDraftChange}
                    onCancel={props.onCloseExerciseEditor}
                    onSave={props.onSaveExercise}
                    orderBounds={exerciseOrderBounds}
                  />
                )}
              </Show>
            }
            onOpenChange={(isOpen) => {
              if (isOpen) {
                props.onAddExercise();
              } else {
                props.onCloseExerciseEditor();
              }
            }}
            open={props.isCreatingExercise}
            title="--New exercise"
            trigger={<CircleButton>+</CircleButton>}
          />
        </Show>
      </div>
      <Show when={props.exercises.length > 0} fallback={<p>--No exercises.</p>}>
        <div class="event-exercises-section__exercises">
          <Index each={sortedExercises()}>
            {(exercise) => (
              <Card
                topLeft={`--#${exercise().order}`}
                description={<p>{exercise().text}</p>}
                actions={
                  props.isEditing ? (
                    <div class="event-exercises-section__exercises--actions">
                      <ConfirmActionButton
                        text={exercise().text}
                        onConfirm={() => props.onDeleteExercise(exercise().id)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          --Delete
                        </AtomButton>
                      </ConfirmActionButton>
                      <AtomDialog
                        closeButtonText="--Close dialog"
                        content={
                          <Show when={props.exerciseDialogDraft}>
                            {(draft) => (
                              <ExerciseEditorForm
                                draft={draft}
                                onDraftChange={props.onExerciseDraftChange}
                                onCancel={props.onCloseExerciseEditor}
                                onSave={props.onSaveExercise}
                                orderBounds={exerciseOrderBounds}
                              />
                            )}
                          </Show>
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            props.onOpenExerciseEditor(exercise());
                            return;
                          }

                          if (props.editingExerciseId === exercise().id) {
                            props.onCloseExerciseEditor();
                          }
                        }}
                        open={props.editingExerciseId === exercise().id}
                        title={`--Edit exercise ${exercise().order}`}
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
