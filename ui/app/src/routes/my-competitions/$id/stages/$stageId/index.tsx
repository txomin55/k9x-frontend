import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import { type Accessor, createEffect, createSignal, Index, onCleanup, Show, Suspense } from "solid-js";
import {
  type CreateEventRequest,
  type EventResponse,
  type UpdateEventRequest,
  useApiEvent
} from "@/services/api/event_api_crud/eventApiCrud";
import { type StageEditorModel, useApiStage } from "@/services/api/stage_api_crud/stageApiCrud";
import { parseDateInputValue, toDateInputValue } from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingCircle from "@/components/floating_circle/FloatingCircle";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";

const EDIT_DEBOUNCE_MS = 400;

export const Route = createFileRoute("/my-competitions/$id/stages/$stageId/")({
  component: CompetitionStageDetailPage,
});

function CompetitionStageDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/my-competitions/$id/stages/$stageId/" });
  const {
    createApiStage,
    createDefaultApiStage,
    deleteApiStage,
    getStage,
    updateApiStage,
  } = useApiStage();
  const {
    createApiEvent,
    createDefaultApiEvent,
    deleteApiEvent,
    updateApiEvent,
  } = useApiEvent();
  let hasCreatedDraftStage = false;

  createEffect(() => {
    if (params().stageId !== "new" || hasCreatedDraftStage) return;

    hasCreatedDraftStage = true;
    const draftStage = createDefaultApiStage(params().id);

    createApiStage(draftStage);
    void navigate({
      params: {
        id: params().id,
        stageId: draftStage.id ?? "",
      },
      replace: true,
      to: "/my-competitions/$id/stages/$stageId",
    });
  });

  return params().stageId === "new" ? (
    <span>--Creating stage</span>
  ) : (
    <CompetitionStageDetailContentContainer
      competitionId={params().id}
      createDefaultEvent={createDefaultApiEvent}
      onCreateEvent={(event) =>
        createApiEvent(event, { competitionId: params().id })
      }
      onDeleteStage={(stageId) => deleteApiStage(stageId, params().id)}
      onDeleteEvent={(eventId, stageId) =>
        deleteApiEvent(eventId, stageId, {
          competitionId: params().id,
        })
      }
      onUpdateStage={updateApiStage}
      onUpdateEvent={(event) =>
        updateApiEvent(event, { competitionId: params().id })
      }
      stageId={params().stageId}
      stage={getStage(params().id, params().stageId)}
    />
  );
}

function CompetitionStageDetailContentContainer(props: {
  competitionId: string;
  createDefaultEvent: (stageId: string) => CreateEventRequest;
  onCreateEvent: (event: CreateEventRequest) => void;
  onDeleteEvent: (eventId: string, stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onUpdateEvent: (event: UpdateEventRequest) => void;
  onUpdateStage: (stage: StageEditorModel) => void;
  stage: Accessor<StageEditorModel | undefined>;
  stageId: string;
}) {
  const navigate = useNavigate();

  return (
    <div class="competition-stage-detail">
      <Suspense fallback={<span>--Loading stage detail</span>}>
        <Show when={props.stage()} fallback={<p>--Stage not found.</p>}>
          <CompetitionStageDetailBody
            createDefaultEvent={props.createDefaultEvent}
            onCreateEvent={props.onCreateEvent}
            onDelete={() => {
              props.onDeleteStage(props.stageId);
              void navigate({
                params: { id: props.competitionId },
                to: "/my-competitions/$id",
              });
            }}
            onDeleteEvent={(eventId) =>
              props.onDeleteEvent(eventId, props.stageId)
            }
            onUpdateEvent={props.onUpdateEvent}
            onUpdateStage={props.onUpdateStage}
            stage={() => props.stage()!}
          />
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionStageDetailBody(props: {
  createDefaultEvent: (stageId: string) => CreateEventRequest;
  onCreateEvent: (event: CreateEventRequest) => void;
  onDelete: () => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: UpdateEventRequest) => void;
  onUpdateStage: (stage: StageEditorModel) => void;
  stage: Accessor<StageEditorModel>;
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.stage().name);
  const [dateFrom, setDateFrom] = createSignal(
    toDateInputValue(props.stage().dateFrom),
  );
  const [dateTo, setDateTo] = createSignal(
    toDateInputValue(props.stage().dateTo),
  );
  const [isCreatingEvent, setIsCreatingEvent] = createSignal(false);
  const [editingEventId, setEditingEventId] = createSignal<string | null>(null);
  const [eventDialogDraft, setEventDialogDraft] =
    createSignal<EventResponse | null>(null);

  createEffect(() => {
    if (isEditing()) return;
    const stage = props.stage();

    setTitle(stage.name);
    setDateFrom(toDateInputValue(stage.dateFrom));
    setDateTo(toDateInputValue(stage.dateTo));
  });

  createEffect(() => {
    if (!isEditing()) return;

    const stage = props.stage();
    const nextStage: StageEditorModel = {
      competitionId: stage.competitionId,
      dateFrom: parseDateInputValue(dateFrom(), stage.dateFrom),
      dateTo: parseDateInputValue(dateTo(), stage.dateTo),
      events: stage.events,
      id: stage.id,
      name: title(),
    };
    const hasChanges =
      nextStage.name !== stage.name ||
      nextStage.dateFrom !== stage.dateFrom ||
      nextStage.dateTo !== stage.dateTo;

    if (!hasChanges) return;

    const timeoutId = globalThis.setTimeout(() => {
      props.onUpdateStage(nextStage);
    }, EDIT_DEBOUNCE_MS);

    onCleanup(() => globalThis.clearTimeout(timeoutId));
  });

  createEffect(() => {
    if (isEditing()) return;

    closeEventEditor();
  });

  const openEventEditor = (event: EventResponse) => {
    setIsCreatingEvent(false);
    setEditingEventId(event.id);
    setEventDialogDraft(event);
  };

  const openNewEventEditor = () => {
    const draft = props.createDefaultEvent(props.stage().id);

    setIsCreatingEvent(true);
    setEditingEventId(draft.id ?? null);
    setEventDialogDraft({
      competitors: [],
      configuration: {
        federation: "",
        id: globalThis.crypto.randomUUID(),
        name: "",
        version: 0,
      },
      discipline: "",
      exercises: [],
      id: draft.id ?? globalThis.crypto.randomUUID(),
      judges: [],
      name: draft.name ?? "",
      stageId: draft.stageId,
      status: "",
    });
  };

  const closeEventEditor = () => {
    setIsCreatingEvent(false);
    setEditingEventId(null);
    setEventDialogDraft(null);
  };

  const saveEventEditor = () => {
    const draft = eventDialogDraft();

    if (!draft) return;

    if (isCreatingEvent()) {
      props.onCreateEvent({
        id: draft.id,
        name: draft.name,
        stageId: draft.stageId,
      });
    } else {
      props.onUpdateEvent(draft);
    }

    closeEventEditor();
  };

  return (
    <div class="competition-stage-detail__content">
      <header>
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{props.stage().name}</h1>
              <p>--Competition ID: {props.stage().competitionId}</p>
              <p>{`${formatDateLabel(toDateInputValue(props.stage().dateFrom))} - ${formatDateLabel(toDateInputValue(props.stage().dateTo))}`}</p>
            </>
          }
        >
          <div>
            <p>--Editing mode active.</p>
            <AtomInput label="--Title" value={title()} onChange={setTitle} />
            <label for="stage-date-from">--Date from</label>
            <input
              id="stage-date-from"
              type="date"
              value={dateFrom()}
              onInput={(event) => setDateFrom(event.currentTarget.value)}
            />
            <label for="stage-date-to">--Date to</label>
            <input
              id="stage-date-to"
              type="date"
              value={dateTo()}
              onInput={(event) => setDateTo(event.currentTarget.value)}
            />
          </div>
        </Show>
      </header>

      <section>
        <div>
          <h2>--Events</h2>
          <Show when={isEditing()}>
            <CircleButton onClick={openNewEventEditor}>+</CircleButton>
            <AtomDialog
              closeButtonText="--Close dialog"
              content={
                <Show when={eventDialogDraft()}>
                  {(draft) => (
                    <EventDialogContent
                      draft={draft()}
                      onCancel={closeEventEditor}
                      onChange={setEventDialogDraft}
                      onSave={saveEventEditor}
                    />
                  )}
                </Show>
              }
              onOpenChange={(isOpen) => {
                if (!isOpen && isCreatingEvent()) {
                  closeEventEditor();
                }
              }}
              open={isCreatingEvent()}
              title="--New event"
              trigger={<span />}
            />
          </Show>
        </div>
        <Show
          when={props.stage().events.length > 0}
          fallback={<p>--No events.</p>}
        >
          <Index each={props.stage().events}>
            {(event) => (
              <Show
                when={isEditing()}
                fallback={
                  <Card
                    topLeft={event().name || "--No name"}
                    subHeader={
                      <p>{`--Discipline: ${event().discipline || "--No discipline"}`}</p>
                    }
                    content={
                      <p>{`--Participants: ${event().competitors.length}`}</p>
                    }
                    actions={
                      <AtomButton
                        type="accent"
                        onClick={() =>
                          void navigate({
                            params: {
                              eventId: event().id,
                              id: props.stage().competitionId,
                              stageId: props.stage().id,
                            },
                            to: "/my-competitions/$id/stages/$stageId/events/$eventId",
                          })
                        }
                      >
                        --+Info
                      </AtomButton>
                    }
                  />
                }
              >
                <Card
                  topLeft={event().name || "--No name"}
                  subHeader={
                    <p>{`--Status: ${event().status || "--No status"}`}</p>
                  }
                  content={
                    <>
                      <p>{`--Discipline: ${event().discipline || "--No discipline"}`}</p>
                      <p>{`--Participants: ${event().competitors.length}`}</p>
                    </>
                  }
                  actions={
                    <>
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
                          <Show when={eventDialogDraft()}>
                            {(draft) => (
                              <EventDialogContent
                                draft={draft()}
                                onCancel={closeEventEditor}
                                onChange={setEventDialogDraft}
                                onSave={saveEventEditor}
                              />
                            )}
                          </Show>
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            openEventEditor(event());
                            return;
                          }

                          if (editingEventId() === event().id) {
                            closeEventEditor();
                          }
                        }}
                        open={editingEventId() === event().id}
                        title={`--Edit ${event().name || "event"}`}
                        trigger={<span>--Edit</span>}
                      />
                      <CircleButton
                        aria-label={`--Delete ${event().name || "event"}`}
                        onClick={() => {
                          if (editingEventId() === event().id) {
                            closeEventEditor();
                          }

                          props.onDeleteEvent(event().id);
                        }}
                      >
                        -
                      </CircleButton>
                    </>
                  }
                />
              </Show>
            )}
          </Index>
        </Show>
      </section>
      <Show when={isEditing()}>
        <div>
          <FloatingCircle onClick={() => setIsEditing(false)}>
            <>
              <span>--Close edit</span>
              <span aria-hidden="true">X</span>
            </>
          </FloatingCircle>
        </div>
        <AtomButton type="destructive" onClick={props.onDelete}>
          --Delete stage
        </AtomButton>
      </Show>
      <Show when={!isEditing()}>
        <div>
          <FloatingCircle onClick={() => setIsEditing(true)}>
            <>
              <span>--Edit stage</span>
              <span aria-hidden="true">--edit</span>
            </>
          </FloatingCircle>
        </div>
      </Show>
    </div>
  );
}

function EventDialogContent(props: {
  draft: EventResponse;
  onCancel: () => void;
  onChange: (
    updater: (current: EventResponse | null) => EventResponse | null,
  ) => void;
  onSave: () => void;
}) {
  return (
    <div>
      <AtomInput
        label="--Event title"
        value={props.draft.name}
        onChange={(value) =>
          props.onChange((current) =>
            current
              ? {
                  ...current,
                  name: value,
                }
              : current,
          )
        }
      />
      <AtomInput
        label="--Status"
        value={props.draft.status}
        onChange={(value) =>
          props.onChange((current) =>
            current
              ? {
                  ...current,
                  status: value,
                }
              : current,
          )
        }
      />
      <div>
        <AtomButton onClick={props.onCancel}>--Cancel</AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}

function formatDateLabel(value: string) {
  if (!value) return "--No date";

  return value;
}
