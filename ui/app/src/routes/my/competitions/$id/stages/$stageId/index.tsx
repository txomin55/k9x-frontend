import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import { type Accessor, createEffect, createSignal, Index, Show, Suspense } from "solid-js";
import { useApiEvent } from "@/services/api/event-api-crud/eventApiCrud";
import {
  type StageEditorModel,
  type UpdateStageRequest,
  useApiStage
} from "@/services/api/stage-api-crud/stageApiCrud";
import type {
  CreateEventRequest,
  EventDetail,
  EventEditorDraft,
  UpdateEventRequest
} from "@/services/api/competition-crud/competitionCrud.types";
import { toEventEditorDraft } from "@/utils/event";
import { parseDateInputValue, toDateInputValue } from "@/utils/stage";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import Card from "@lib/components/molecules/card/Card";
import {
  getEventDisciplineLabel
} from "@/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventDisciplineField";
import EventEditorForm from "@/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventEditorForm";
import "./styles.css";

export const Route = createFileRoute("/my/competitions/$id/stages/$stageId/")({
  component: CompetitionStageDetailPage,
});

function CompetitionStageDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/my/competitions/$id/stages/$stageId/" });
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
  const handleCreateEvent = (event: CreateEventRequest) =>
    createApiEvent(event, { competitionId: params().id });
  const handleDeleteStage = (stageId: string) =>
    deleteApiStage(stageId, params().id);
  const handleDeleteEvent = (eventId: string, stageId: string) =>
    deleteApiEvent(eventId, stageId, {
      competitionId: params().id,
    });
  const handleUpdateEvent = (
    stageId: string,
    eventId: string,
    event: UpdateEventRequest,
  ) => updateApiEvent(stageId, eventId, event, { competitionId: params().id });

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
      to: "/my/competitions/$id/stages/$stageId",
    });
  });

  return params().stageId === "new" ? (
    <span>--Creating stage</span>
  ) : (
    <CompetitionStageDetailContentContainer
      competitionId={params().id}
      createDefaultEvent={createDefaultApiEvent}
      onCreateEvent={handleCreateEvent}
      onDeleteStage={handleDeleteStage}
      onDeleteEvent={handleDeleteEvent}
      onUpdateStage={updateApiStage}
      onUpdateEvent={handleUpdateEvent}
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
  onUpdateEvent: (
    stageId: string,
    eventId: string,
    event: UpdateEventRequest,
  ) => void;
  onUpdateStage: (
    competitionId: string,
    stageId: string,
    stage: UpdateStageRequest,
  ) => void;
  stage: Accessor<StageEditorModel | undefined>;
  stageId: string;
}) {
  const navigate = useNavigate();
  const handleDelete = () => {
    props.onDeleteStage(props.stageId);
    void navigate({
      params: { id: props.competitionId },
      to: "/my/competitions/$id",
    });
  };
  const handleDeleteEvent = (eventId: string) =>
    props.onDeleteEvent(eventId, props.stageId);
  const stageAccessor = () => props.stage()!;

  return (
    <div class="stage-detail">
      <Suspense fallback={<span>--Loading stage detail</span>}>
        <Show when={props.stage()} fallback={<p>--Stage not found.</p>}>
          <CompetitionStageDetailBody
            createDefaultEvent={props.createDefaultEvent}
            onCreateEvent={props.onCreateEvent}
            onDelete={handleDelete}
            onDeleteEvent={handleDeleteEvent}
            onUpdateEvent={props.onUpdateEvent}
            onUpdateStage={props.onUpdateStage}
            stage={stageAccessor}
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
  onUpdateEvent: (
    stageId: string,
    eventId: string,
    event: UpdateEventRequest,
  ) => void;
  onUpdateStage: (
    competitionId: string,
    stageId: string,
    stage: UpdateStageRequest,
  ) => void;
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
    createSignal<EventEditorDraft | null>(null);

  createEffect(() => {
    if (isEditing()) return;
    const stage = props.stage();

    setTitle(stage.name);
    setDateFrom(toDateInputValue(stage.dateFrom));
    setDateTo(toDateInputValue(stage.dateTo));
  });

  createEffect(() => {
    if (isEditing()) return;

    closeEventEditor();
  });

  const openEventEditor = (event: EventDetail) => {
    setIsCreatingEvent(false);
    setEditingEventId(event.id);
    setEventDialogDraft(toEventEditorDraft(event));
  };

  const openNewEventEditor = () => {
    const draft = props.createDefaultEvent(props.stage().id);

    setIsCreatingEvent(true);
    setEditingEventId(draft.id ?? null);
    setEventDialogDraft({
      competitors: [],
      configuration: {
        federation: undefined,
        id: globalThis.crypto.randomUUID(),
        name: "",
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
  const commitStageEdits = () => {
    if (!isEditing()) return;

    const stage = props.stage();
    const nextStage: UpdateStageRequest = {
      dateFrom: parseDateInputValue(dateFrom(), stage.dateFrom),
      dateTo: parseDateInputValue(dateTo(), stage.dateTo),
      name: title(),
    };
    const hasChanges =
      nextStage.name !== stage.name ||
      nextStage.dateFrom !== stage.dateFrom ||
      nextStage.dateTo !== stage.dateTo;

    if (!hasChanges) return;

    props.onUpdateStage(stage.competitionId, stage.id, nextStage);
  };
  const handleCreateDialogOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      openNewEventEditor();
    } else {
      closeEventEditor();
    }
  };
  const createNavigateToEvent = (event: Accessor<EventDetail>) => () =>
    void navigate({
      params: {
        eventId: event().id,
        id: props.stage().competitionId,
        stageId: props.stage().id,
      },
      to: "/my/competitions/$id/stages/$stageId/events/$eventId",
    });
  const createEditDialogOpenChange =
    (event: Accessor<EventDetail>) => (isOpen: boolean) => {
      if (isOpen) {
        openEventEditor(event());
        return;
      }

      if (editingEventId() === event().id) {
        closeEventEditor();
      }
    };
  const deleteEventClick = (event: Accessor<EventDetail>) => () => {
    if (editingEventId() === event().id) {
      closeEventEditor();
    }

    props.onDeleteEvent(event().id);
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
      closeEventEditor();
      return;
    }

    props.onUpdateEvent(draft.stageId, draft.id, {
      competitors: draft.competitors.map((competitor) => ({
        country: competitor.country,
        dogId: competitor.dogId,
        identity: competitor.identity,
        order: competitor.order,
        owner: competitor.owner,
        team: competitor.team,
      })),
      configurationId: draft.configuration.id,
      exercises: draft.exercises,
      judges: draft.judges,
      name: draft.name,
    });

    closeEventEditor();
  };

  const formatDateLabel = (value: string) => {
    if (!value) return "--No date";

    return value;
  };

  return (
    <div class="stage-detail">
      <header class="stage-detail__header">
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{props.stage().name}</h1>
              <p>{`${formatDateLabel(toDateInputValue(props.stage().dateFrom))} - ${formatDateLabel(toDateInputValue(props.stage().dateTo))}`}</p>
            </>
          }
        >
          <p>--Editing mode active.</p>
          <AtomInput
            label="--Title"
            value={title()}
            onBlur={commitStageEdits}
            onChange={setTitle}
          />
          <AtomInput
            label="--Date from"
            type="date"
            value={dateFrom()}
            onBlur={commitStageEdits}
            onChange={setDateFrom}
          />
          <AtomInput
            label="--Date to"
            type="date"
            value={dateTo()}
            onBlur={commitStageEdits}
            onChange={setDateTo}
          />
        </Show>
      </header>

      <section class="stage-detail__content">
        <div class="stage-detail__content--events">
          <h2>--Events</h2>
          <Show when={isEditing()}>
            <AtomDialog
              closeButtonText="--Close dialog"
              content={
                <Show when={eventDialogDraft()}>
                  {(draft) => (
                    <EventEditorForm
                      draft={draft()}
                      onCancel={closeEventEditor}
                      onChange={setEventDialogDraft}
                      onSave={saveEventEditor}
                      isCreate
                    />
                  )}
                </Show>
              }
              onOpenChange={handleCreateDialogOpenChange}
              open={isCreatingEvent()}
              title="--New event"
              trigger={<CircleButton>+</CircleButton>}
            />
          </Show>
        </div>
        <Show
          when={props.stage().events.length > 0}
          fallback={<p>--No events.</p>}
        >
          <div class="stage-detail__content--event">
            <Index each={props.stage().events}>
              {(event) => (
                <Card
                  topLeft={event().name}
                  subHeader={<p>{`--Status: ${event().status}`}</p>}
                  content={
                    <div class="aaaaa">
                      <p>{`--Discipline: ${getEventDisciplineLabel(event().discipline)}`}</p>
                      <p>{`--Participants: ${event().competitors.length}`}</p>
                    </div>
                  }
                  actions={
                    isEditing() ? (
                      <div class="stage-detail__content--event-actions">
                        <ConfirmActionButton
                          text={event().name}
                          onConfirm={deleteEventClick(event)}
                        >
                          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                            --Delete
                          </AtomButton>
                        </ConfirmActionButton>
                        <AtomDialog
                          closeButtonText="--Close dialog"
                          content={
                            <Show when={eventDialogDraft()}>
                              {(draft) => (
                                <EventEditorForm
                                  draft={draft()}
                                  onCancel={closeEventEditor}
                                  onChange={setEventDialogDraft}
                                  onSave={saveEventEditor}
                                />
                              )}
                            </Show>
                          }
                          onOpenChange={createEditDialogOpenChange(event)}
                          open={editingEventId() === event().id}
                          title={`--Edit ${event().name}`}
                          trigger={<span>--Edit</span>}
                        />
                      </div>
                    ) : (
                      <AtomButton
                        type={BUTTON_TYPES.ACCENT}
                        onClick={createNavigateToEvent(event)}
                      >
                        --+Info
                      </AtomButton>
                    )
                  }
                />
              )}
            </Index>
          </div>
        </Show>
      </section>
      <FloatingToggleCircle
        onClick={() => setIsEditing((current) => !current)}
        toggled={isEditing()}
        nonToggledText="--Edit"
        toggledText="--Save"
      />
      <Show when={isEditing()}>
        <ConfirmActionButton
          text={props.stage().name}
          onConfirm={props.onDelete}
        >
          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
            --Delete stage
          </AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
