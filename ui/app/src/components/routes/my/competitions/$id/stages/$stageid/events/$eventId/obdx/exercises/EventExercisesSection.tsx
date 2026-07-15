import { createMemo, createSignal, For, Index, Show } from "solid-js";
import AtomDialog from "library/src/components/atoms/dialog/AtomDialog";
import Card from "library/src/components/molecules/card/Card";
import CircleButton from "library/src/components/molecules/circle-button/CircleButton";
import ExerciseEditorForm from "./ExerciseEditorForm";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { ColumnDef } from "@lib/components/atoms/table/AtomTable.types";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import AtomBadge from "library/src/components/atoms/badge/AtomBadge";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import {
  EventExerciseDetailResponseDTO,
  EventJudgeDetailResponseDTO
} from "@/services/secured/event-crud/eventCrud.types";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import { useI18n } from "@/stores/i18n/i18n";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

type EventExercisesSectionProps = {
  onCommitExercise: () => void;
  editingExerciseId: string | null;
  eventJudges: EventJudgeDetailResponseDTO[];
  exerciseDialogDraft: EventExerciseDetailResponseDTO | null;
  exercises: EventExerciseDetailResponseDTO[];
  exerciseCandidatesOptions: AtomSelectOption[];
  isCreatingExercise: boolean;
  isEditing: boolean;
  onAddExercise: () => void;
  onDeleteExercise: (exerciseId: string) => void;
  onExerciseDraftChange: (
    updater: (
      current: EventExerciseDetailResponseDTO | null,
    ) => EventExerciseDetailResponseDTO | null,
  ) => void;
  onOpenExerciseEditor: (exercise: EventExerciseDetailResponseDTO) => void;
  onCreateExercise: () => void;
};

export default function EventExercisesSection(
  props: EventExercisesSectionProps,
) {
  const i18n = useI18n();
  const getOrderValue = (exercise: EventExerciseDetailResponseDTO) =>
    exercise.position;
  const getExerciseName = (exercise: EventExerciseDetailResponseDTO) => {
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
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const tableFill = useViewportFillHeight();

  const openExerciseEditor = (exercise: EventExerciseDetailResponseDTO) => {
    props.onOpenExerciseEditor(exercise);
    setDialogOpen(true);
  };

  const viewDialogTitle = () => {
    if (props.isCreatingExercise) {
      return i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.NEW_EXERCISE");
    }

    return i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EDIT_EXERCISE");
  };

  const columns = createMemo<ColumnDef<EventExerciseDetailResponseDTO, any>[]>(
    () => {
      const cols: ColumnDef<EventExerciseDetailResponseDTO, any>[] = [
        {
          id: "position",
          accessorFn: (exercise) => exercise.position,
          header: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.POSITION"),
          cell: (info) => `#${info.row.original.position}`,
        },
        {
          id: "name",
          accessorFn: (exercise) => getExerciseName(exercise),
          header: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.NAME"),
          cell: (info) => getExerciseName(info.row.original),
        },
        {
          id: "tags",
          header: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.TAGS"),
          enableSorting: false,
          cell: (info) => (
            <div class="event-exercises-section__tags">
              <For each={info.row.original.tags}>
                {(tag) => (
                  <AtomBadge textValue={tag} colorByLabel>
                    {tag}
                  </AtomBadge>
                )}
              </For>
            </div>
          ),
        },
        {
          id: "judges",
          accessorFn: (exercise) =>
            exercise.judges.map((judge) => judge.name).join(", "),
          header: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.JUDGES"),
          enableSorting: false,
          cell: (info) =>
            info.row.original.judges.map((judge) => judge.name).join(", "),
        },
      ];

      if (props.isEditing) {
        cols.push({
          id: "actions",
          header: () => null,
          enableSorting: false,
          cell: (info) => (
            <div class="list-table__actions">
              <ConfirmActionButton
                text={getExerciseName(info.row.original)}
                onConfirm={() => props.onDeleteExercise(info.row.original.id)}
              >
                <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                  <AtomSvgIcon
                    src={trashIcon}
                    alt={i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.DELETE")}
                    tinted
                  />
                </AtomButton>
              </ConfirmActionButton>
              <AtomButton
                type={BUTTON_TYPES.ACCENT}
                onClick={() => openExerciseEditor(info.row.original)}
              >
                <AtomSvgIcon
                  src={pencilIcon}
                  alt={i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EDIT")}
                  tinted
                />
              </AtomButton>
            </div>
          ),
        });
      }

      return cols;
    },
  );

  const listContent = () => (
    <div class="event-exercises-section__exercises">
      <Index each={sortedExercises()}>
        {(exercise) => (
          <Card
            topLeft={`#${exercise().position}`}
            description={
              <div>
                <p>{getExerciseName(exercise())}</p>
                <Index each={exercise().tags}>
                  {(tag) => (
                    <AtomBadge textValue={tag()} colorByLabel>
                      {tag()}
                    </AtomBadge>
                  )}
                </Index>
                <p>
                  {exercise()
                    .judges.map((judge) => judge.name)
                    .join(", ")}
                </p>
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
                  <span onClick={() => openExerciseEditor(exercise())}>
                    {i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EDIT")}
                  </span>
                </div>
              ) : undefined
            }
          />
        )}
      </Index>
    </div>
  );

  const tableContent = () => (
    <div
      class="event-exercises-section__table"
      ref={tableFill.ref}
      style={{ "--table-max-height": `${tableFill.height()}px` }}
    >
      <AtomTable<EventExerciseDetailResponseDTO>
        data={sortedExercises()}
        columns={columns()}
        getRowId={(row) => row.id}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.TABLE"),
      content: tableContent,
    },
  ]);

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
      <Show
        when={props.exercises.length > 0}
        fallback={
          <p>{i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.NO_EXERCISES")}</p>
        }
      >
        <AtomSegmentedControl
          title={i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.EXERCISES_BY")}
          control={view()}
          onControlChange={setView}
          controls={controls()}
        />
      </Show>
      <AtomDialog
        closeButtonText={i18n.t("MY.COMPETITIONS.EVENT_EXERCISES.CLOSE_DIALOG")}
        content={
          <Show when={props.exerciseDialogDraft}>
            {(draft) => (
              <ExerciseEditorForm
                draft={draft}
                eventJudges={props.eventJudges}
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
