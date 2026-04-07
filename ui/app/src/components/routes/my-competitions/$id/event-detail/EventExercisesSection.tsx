import { Index, Show } from "solid-js";
import type { PublicEventExercise } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ExerciseEditorForm from "./exercises/ExerciseEditorForm";

type EventExercisesSectionProps = {
  editingExerciseId: string | null;
  exerciseDialogDraft: PublicEventExercise | null;
  exercises: PublicEventExercise[];
  isCreatingExercise: boolean;
  isEditing: boolean;
  onAddExercise: () => void;
  onCloseExerciseEditor: () => void;
  onDeleteExercise: (exerciseId: string) => void;
  onExerciseDraftChange: (
    updater: (
      current: PublicEventExercise | null,
    ) => PublicEventExercise | null,
  ) => void;
  onOpenExerciseEditor: (exercise: PublicEventExercise) => void;
  onSaveExercise: () => void;
};

export default function EventExercisesSection(
  props: EventExercisesSectionProps,
) {
  return (
    <section>
      <div>
        <h2>--Exercises</h2>
        <Show when={props.isEditing}>
          <CircleButton
            aria-label="--Add exercise"
            onClick={props.onAddExercise}
          >
            +
          </CircleButton>
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
                  />
                )}
              </Show>
            }
            onOpenChange={(isOpen) => {
              if (!isOpen && props.isCreatingExercise) {
                props.onCloseExerciseEditor();
              }
            }}
            open={props.isCreatingExercise}
            title="--New exercise"
            trigger={<span />}
          />
        </Show>
      </div>
      <Show when={props.exercises.length > 0} fallback={<p>--No exercises.</p>}>
        <div>
          <Index each={props.exercises}>
            {(exercise) => (
              <Card
                topLeft={`--#${exercise().order}`}
                description={<p>{exercise().text || "--No text"}</p>}
                actions={
                  props.isEditing ? (
                    <>
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
                      <CircleButton
                        onClick={() => props.onDeleteExercise(exercise().id)}
                      >
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
