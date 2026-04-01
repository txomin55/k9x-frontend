import { Index, Show } from "solid-js";
import type { PublicEventExercise } from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

type EventExercisesSectionProps = {
  editingExerciseIndex: number | null;
  exerciseDialogDraft: PublicEventExercise | null;
  exercises: PublicEventExercise[];
  isEditing: boolean;
  onAddExercise: () => void;
  onCloseExerciseEditor: () => void;
  onDeleteExercise: (index: number) => void;
  onExerciseDraftChange: (
    updater: (
      current: PublicEventExercise | null,
    ) => PublicEventExercise | null,
  ) => void;
  onOpenExerciseEditor: (index: number, exercise: PublicEventExercise) => void;
  onSaveExercise: (index: number) => void;
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
        </Show>
      </div>
      <Show when={props.exercises.length > 0} fallback={<p>--No exercises.</p>}>
        <div>
          <Index each={props.exercises}>
            {(exercise, index) => (
              <Card
                topLeft={`--#${exercise().order}`}
                description={<p>{exercise().text || "--No text"}</p>}
                actions={
                  <Show when={props.isEditing}>
                    <>
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
                          <Show when={props.exerciseDialogDraft}>
                            {(draft) => (
                              <div>
                                <AtomNumberInput
                                  label="--Order"
                                  value={draft().order}
                                  onChange={(value) =>
                                    props.onExerciseDraftChange((current) =>
                                      current
                                        ? {
                                            ...current,
                                            order: Number(value) || 0,
                                          }
                                        : current,
                                    )
                                  }
                                />
                                <AtomInput
                                  label="--Text"
                                  value={draft().text}
                                  onChange={(value) =>
                                    props.onExerciseDraftChange((current) =>
                                      current
                                        ? {
                                            ...current,
                                            text: value,
                                          }
                                        : current,
                                    )
                                  }
                                />
                                <div>
                                  <AtomButton
                                    onClick={props.onCloseExerciseEditor}
                                  >
                                    --Cancel
                                  </AtomButton>
                                  <AtomButton
                                    onClick={() => props.onSaveExercise(index)}
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
                            props.onOpenExerciseEditor(index, exercise());
                            return;
                          }

                          if (props.editingExerciseIndex === index) {
                            props.onCloseExerciseEditor();
                          }
                        }}
                        open={props.editingExerciseIndex === index}
                        title={`--Edit exercise ${exercise().order}`}
                        trigger={<span>--Edit</span>}
                      />
                      <CircleButton
                        aria-label={`--Delete exercise ${exercise().order}`}
                        onClick={() => props.onDeleteExercise(index)}
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
