import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import CompetitorEditorForm from "./CompetitorEditorForm";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useDogs } from "@/services/api/dog-crud/dogCrud";
import type { Dog } from "@/services/api/dog-crud/dogCrud.types";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { EventCompetitorDetail } from "@/services/api/event-crud/eventCrud.types";
import "./styles.css";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  competitors: EventCompetitorDetail[];
  editingCompetitorId: string | null;
  isCreatingCompetitor: boolean;
  isEditing: boolean;
  onAddCompetitor: () => void;
  onCommitCompetitor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onDeleteCompetitor: (competitorId: string) => void;
  onOpenCompetitorEditor: (competitor: EventCompetitorDetail) => void;
  onCreateCompetitor: () => void;
};

export default function EventCompetitorsSection(
  props: EventCompetitorsSectionProps,
) {
  const dogsQuery = useDogs({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });
  const dogOptions = createMemo<AtomSelectOption[]>(() =>
    (dogsQuery.data ?? []).map((dog) => ({
      label: dog.owner ? `${dog.name} (${dog.owner})` : dog.name,
      value: dog.id,
    })),
  );
  const dogsById = createMemo(() => {
    const map = new Map<string, Dog>();
    for (const dog of dogsQuery.data ?? []) {
      map.set(dog.id, dog);
    }
    return map;
  });
  const getDogName = (dogId: string) => dogsById().get(dogId)?.name;

  const getOrderValue = (competitor: EventCompetitorDetail) => competitor.order;

  const sortedCompetitors = createMemo(() =>
    [...props.competitors].toSorted(
      (a, b) => getOrderValue(a) - getOrderValue(b),
    ),
  );
  const competitorOrderBounds = () => ({
    minValue: 1,
    maxValue: Math.max(
      1,
      props.competitors.length + (props.isCreatingCompetitor ? 1 : 0),
    ),
  });

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const viewDialogTitle = () => {
    if (props.isCreatingCompetitor) {
      return "--New competitor";
    }

    return "--Edit competitor";
  };

  return (
    <section class="event-competitors-section">
      <div class="event-competitors-section__header">
        <Show when={props.isEditing}>
          <CircleButton
            onClick={() => {
              props.onAddCompetitor();
              setDialogOpen(true);
            }}
          >
            +
          </CircleButton>
        </Show>
      </div>
      <Show
        when={props.competitors.length > 0}
        fallback={<p>--No competitors.</p>}
      >
        <div class="event-competitors-section__competitors">
          <Index each={sortedCompetitors()}>
            {(competitor) => (
              <Card
                topLeft={competitor().owner}
                content={
                  <div class="event-competitors-section__competitors--competitor">
                    <p>{`--Dog: ${getDogName(competitor().dogId)}`}</p>
                    <p>{`--Identity: ${competitor().identity}`}</p>
                    <p>{`--Team: ${competitor().team}`}</p>
                    <p>{`--Country: ${competitor().country}`}</p>
                  </div>
                }
                actions={
                  props.isEditing ? (
                    <div class="event-competitors-section__competitors--actions">
                      <ConfirmActionButton
                        text={competitor().owner}
                        onConfirm={() =>
                          props.onDeleteCompetitor(competitor().dogId)
                        }
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          --Delete
                        </AtomButton>
                      </ConfirmActionButton>
                      <span
                        onClick={() => {
                          props.onOpenCompetitorEditor(competitor());
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
          <CompetitorEditorForm
            competitorDialogDraft={props.competitorDialogDraft}
            onCloseCompetitorEditor={() => {
              setDialogOpen(false);
            }}
            onCommitCompetitor={props.onCommitCompetitor}
            onCompetitorDraftChange={props.onCompetitorDraftChange}
            onCreateCompetitor={() => {
              props.onCreateCompetitor();
              setDialogOpen(false);
            }}
            orderBounds={competitorOrderBounds()}
            dogOptions={dogOptions()}
            dogsById={dogsById()}
            displaySave={props.isCreatingCompetitor}
          />
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen()}
        title={viewDialogTitle()}
      />
    </section>
  );
}
