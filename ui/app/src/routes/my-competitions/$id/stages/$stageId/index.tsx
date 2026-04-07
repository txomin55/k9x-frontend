import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  Index,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import {
  type CreateEventRequest,
  type EventResponse,
  type UpdateEventRequest,
  useApiEvent,
} from "@/services/api/event-api-crud/eventApiCrud";
import {
  type StageEditorModel,
  useApiStage,
} from "@/services/api/stage-api-crud/stageApiCrud";
import { parseDateInputValue, toDateInputValue } from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingToggleCircle from "@/components/floating-toggle-circle/FloatingToggleCircle";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";

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
  const handleCreateEvent = (event: CreateEventRequest) =>
    createApiEvent(event, { competitionId: params().id });
  const handleDeleteStage = (stageId: string) =>
    deleteApiStage(stageId, params().id);
  const handleDeleteEvent = (eventId: string, stageId: string) =>
    deleteApiEvent(eventId, stageId, {
      competitionId: params().id,
    });
  const handleUpdateEvent = (event: UpdateEventRequest) =>
    updateApiEvent(event, { competitionId: params().id });

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
  onUpdateEvent: (event: UpdateEventRequest) => void;
  onUpdateStage: (stage: StageEditorModel) => void;
  stage: Accessor<StageEditorModel | undefined>;
  stageId: string;
}) {
  const navigate = useNavigate();
  const handleDelete = () => {
    props.onDeleteStage(props.stageId);
    void navigate({
      params: { id: props.competitionId },
      to: "/my-competitions/$id",
    });
  };
  const handleDeleteEvent = (eventId: string) =>
    props.onDeleteEvent(eventId, props.stageId);
  const stageAccessor = () => props.stage()!;

  return (
    <div class="competition-stage-detail">
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
  const commitStageEdits = () => {
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

    props.onUpdateStage(nextStage);
  };
  const handleDateFromInput: JSX.EventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = (event) => setDateFrom(event.currentTarget.value);
  const handleDateToInput: JSX.EventHandlerUnion<
    HTMLInputElement,
    InputEvent
  > = (event) => setDateTo(event.currentTarget.value);
  const renderEventDialogDraft = (draft: Accessor<EventResponse>) => (
    <EventDialogContent
      draft={draft()}
      onCancel={closeEventEditor}
      onChange={setEventDialogDraft}
      onSave={saveEventEditor}
    />
  );
  const renderEventDialogContent = () => (
    <Show when={eventDialogDraft()}>{renderEventDialogDraft}</Show>
  );
  const handleCreateDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen && isCreatingEvent()) {
      closeEventEditor();
    }
  };
  const createNavigateToEvent = (event: Accessor<EventResponse>) => () =>
    void navigate({
      params: {
        eventId: event().id,
        id: props.stage().competitionId,
        stageId: props.stage().id,
      },
      to: "/my-competitions/$id/stages/$stageId/events/$eventId",
    });
  const createEditDialogOpenChange =
    (event: Accessor<EventResponse>) => (isOpen: boolean) => {
      if (isOpen) {
        openEventEditor(event());
        return;
      }

      if (editingEventId() === event().id) {
        closeEventEditor();
      }
    };
  const createDeleteEventClick = (event: Accessor<EventResponse>) => () => {
    if (editingEventId() === event().id) {
      closeEventEditor();
    }

    props.onDeleteEvent(event().id);
  };
  const renderEvent = (event: Accessor<EventResponse>) => (
    <Show
      when={isEditing()}
      fallback={
        <Card
          topLeft={event().name || "--No name"}
          subHeader={
            <p>{`--Discipline: ${event().discipline || "--No discipline"}`}</p>
          }
          content={<p>{`--Participants: ${event().competitors.length}`}</p>}
          actions={
            <AtomButton type="accent" onClick={createNavigateToEvent(event)}>
              --+Info
            </AtomButton>
          }
        />
      }
    >
      <Card
        topLeft={event().name || "--No name"}
        subHeader={<p>{`--Status: ${event().status || "--No status"}`}</p>}
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
              content={renderEventDialogContent()}
              onOpenChange={createEditDialogOpenChange(event)}
              open={editingEventId() === event().id}
              title={`--Edit ${event().name || "event"}`}
              trigger={<span>--Edit</span>}
            />
            <CircleButton
              aria-label={`--Delete ${event().name || "event"}`}
              onClick={createDeleteEventClick(event)}
            >
              -
            </CircleButton>
          </>
        }
      />
    </Show>
  );

  const saveEventEditor = () => {
    const draft = eventDialogDraft();

    if (!draft) return;

    if (isCreatingEvent()) {
      props.onCreateEvent({
        id: draft.id,
        name: draft.name,
        stageId: draft.stageId,
        discipline: draft.discipline,
      });
    }

    props.onUpdateEvent(draft);

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
            <AtomInput
              label="--Title"
              value={title()}
              onBlur={commitStageEdits}
              onChange={setTitle}
            />
            <label for="stage-date-from">--Date from</label>
            <input
              id="stage-date-from"
              type="date"
              value={dateFrom()}
              onBlur={commitStageEdits}
              onInput={handleDateFromInput}
            />
            <label for="stage-date-to">--Date to</label>
            <input
              id="stage-date-to"
              type="date"
              value={dateTo()}
              onBlur={commitStageEdits}
              onInput={handleDateToInput}
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
              content={renderEventDialogContent()}
              onOpenChange={handleCreateDialogOpenChange}
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
          <Index each={props.stage().events}>{renderEvent}</Index>
        </Show>
      </section>
      <FloatingToggleCircle
        onClick={() => setIsEditing((current) => !current)}
        toggled={isEditing()}
        nonToggledText="--Edit"
        toggledText="X"
      />
      <Show when={isEditing()}>
        <AtomButton type="destructive" onClick={props.onDelete}>
          --Delete stage
        </AtomButton>
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
  const handleNameChange = (value: string) =>
    props.onChange((current) =>
      current
        ? {
            ...current,
            name: value,
          }
        : current,
    );
  const handleDisciplineChange = (value: string) =>
    props.onChange((current) =>
      current
        ? {
            ...current,
            discipline: value,
          }
        : current,
    );

  return (
    <div>
      <AtomInput
        label="--Event title"
        value={props.draft.name}
        onChange={handleNameChange}
      />
      <AtomInput
        label="--Discipline"
        value={props.draft.discipline}
        onChange={handleDisciplineChange}
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
