import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import EventCompetitorsSection from "@/components/routes/my-competitions/$id/event-detail/EventCompetitorsSection";
import EventExercisesSection from "@/components/routes/my-competitions/$id/event-detail/EventExercisesSection";
import EventJudgesSection from "@/components/routes/my-competitions/$id/event-detail/EventJudgesSection";
import EventOverview from "@/components/routes/my-competitions/$id/event-detail/EventOverview";
import type {
  EventResponse,
  UpdateEventRequest,
} from "@/services/api/event_api_crud/eventApiCrud";
import { useApiEvent } from "@/services/api/event_api_crud/eventApiCrud";
import type {
  PublicEventCompetitor,
  PublicEventExercise,
  PublicStageJudge,
} from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

const EDIT_DEBOUNCE_MS = 400;

export const Route = createFileRoute(
  "/my-competitions/$id/stages/$stageId/events/$eventId/",
)({
  component: CompetitionEventDetailPage,
});

function CompetitionEventDetailPage() {
  const navigate = useNavigate();
  const params = useParams({
    from: "/my-competitions/$id/stages/$stageId/events/$eventId/",
  });
  const {
    createApiEvent,
    createDefaultApiEvent,
    deleteApiEvent,
    getEvent,
    updateApiEvent,
  } = useApiEvent();
  let hasCreatedDraftEvent = false;

  const createDraftEvent = () => {
    const draftEvent = createDefaultApiEvent(params().stageId);

    createApiEvent(draftEvent, { competitionId: params().id });
    void navigate({
      params: {
        eventId: draftEvent.id,
        id: params().id,
        stageId: params().stageId,
      },
      replace: true,
      to: "/my-competitions/$id/stages/$stageId/events/$eventId",
    });
  };

  const handleDeleteEvent = (eventId: string) =>
    deleteApiEvent(eventId, params().stageId, {
      competitionId: params().id,
    });

  const handleUpdateEvent = (event: UpdateEventRequest) =>
    updateApiEvent(
      {
        ...event,
        stageId: params().stageId,
      },
      { competitionId: params().id },
    );

  createEffect(() => {
    if (params().eventId !== "new" || hasCreatedDraftEvent) return;

    hasCreatedDraftEvent = true;
    createDraftEvent();
  });

  return params().eventId === "new" ? (
    <span>--Creating event</span>
  ) : (
    <CompetitionEventDetailContentContainer
      competitionId={params().id}
      event={getEvent(params().id, params().stageId, params().eventId)}
      eventId={params().eventId}
      onDeleteEvent={handleDeleteEvent}
      onUpdate={handleUpdateEvent}
      stageId={params().stageId}
    />
  );
}

function CompetitionEventDetailContentContainer(props: {
  competitionId: string;
  event: Accessor<EventResponse | undefined>;
  eventId: string;
  onDeleteEvent: (eventId: string) => void;
  onUpdate: (event: UpdateEventRequest) => void;
  stageId: string;
}) {
  const navigate = useNavigate();
  const eventAccessor = () => props.event()!;

  const handleDelete = () => {
    props.onDeleteEvent(props.eventId);
    void navigate({
      params: { id: props.competitionId, stageId: props.stageId },
      to: "/my-competitions/$id/stages/$stageId",
    });
  };

  return (
    <div class="competition-event-detail">
      <Suspense fallback={<span>--Loading event detail</span>}>
        <Show when={props.event()} fallback={<p>--Event not found.</p>}>
          <CompetitionEventDetailBody
            event={eventAccessor}
            onDelete={handleDelete}
            onUpdate={props.onUpdate}
          />
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionEventDetailBody(props: {
  event: Accessor<EventResponse>;
  onDelete: () => void;
  onUpdate: (event: UpdateEventRequest) => void;
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftEvent, setDraftEvent] = createSignal(props.event());
  const [lastQueuedDraftKey, setLastQueuedDraftKey] = createSignal<
    string | null
  >(null);
  const [editingCompetitorIndex, setEditingCompetitorIndex] = createSignal<
    number | null
  >(null);
  const [competitorDialogDraft, setCompetitorDialogDraft] =
    createSignal<PublicEventCompetitor | null>(null);
  const [editingJudgeIndex, setEditingJudgeIndex] = createSignal<number | null>(
    null,
  );
  const [judgeDialogDraft, setJudgeDialogDraft] =
    createSignal<PublicStageJudge | null>(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = createSignal<
    number | null
  >(null);
  const [exerciseDialogDraft, setExerciseDialogDraft] =
    createSignal<PublicEventExercise | null>(null);

  createEffect(() => {
    if (isEditing()) return;

    setDraftEvent(props.event());
    setLastQueuedDraftKey(null);
  });

  createEffect(() => {
    if (!isEditing()) return;

    const externalEvent = props.event();
    const nextEvent = draftEvent();
    const nextDraftKey = getEventDraftKey(nextEvent);
    const currentEventKey = getEventDraftKey(externalEvent);

    if (nextDraftKey === currentEventKey) return;
    if (lastQueuedDraftKey() === nextDraftKey) return;

    const timeoutId = globalThis.setTimeout(() => {
      setLastQueuedDraftKey(nextDraftKey);
      props.onUpdate(nextEvent);
    }, EDIT_DEBOUNCE_MS);

    onCleanup(() => globalThis.clearTimeout(timeoutId));
  });

  createEffect(() => {
    if (isEditing()) return;

    closeCompetitorEditor();
    closeJudgeEditor();
    closeExerciseEditor();
  });

  const closeCompetitorEditor = () => {
    setEditingCompetitorIndex(null);
    setCompetitorDialogDraft(null);
  };

  const closeJudgeEditor = () => {
    setEditingJudgeIndex(null);
    setJudgeDialogDraft(null);
  };

  const closeExerciseEditor = () => {
    setEditingExerciseIndex(null);
    setExerciseDialogDraft(null);
  };

  const saveJudgeEditor = (index: number) => {
    const draft = judgeDialogDraft();

    if (!draft) return;

    setDraftEvent((current) => ({
      ...current,
      judges: current.judges.map((entry, judgeIndex) =>
        judgeIndex === index ? draft : entry,
      ),
    }));
    closeJudgeEditor();
  };

  const saveExerciseEditor = (index: number) => {
    const draft = exerciseDialogDraft();

    if (!draft) return;

    setDraftEvent((current) => ({
      ...current,
      exercises: current.exercises.map((entry, exerciseIndex) =>
        exerciseIndex === index ? draft : entry,
      ),
    }));
    closeExerciseEditor();
  };

  const saveCompetitorEditor = (index: number) => {
    const draft = competitorDialogDraft();

    if (!draft) return;

    setDraftEvent((current) => ({
      ...current,
      competitors: current.competitors.map((entry, competitorIndex) =>
        competitorIndex === index ? draft : entry,
      ),
    }));
    closeCompetitorEditor();
  };

  const handleConfigurationFederationChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      configuration: {
        ...current.configuration,
        federation: value,
      },
    }));

  const handleConfigurationNameChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      configuration: {
        ...current.configuration,
        name: value,
      },
    }));

  const handleConfigurationVersionChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      configuration: {
        ...current.configuration,
        version: Number(value) || 0,
      },
    }));

  const handleDisciplineChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      discipline: value,
    }));

  const handleNameChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      name: value,
    }));

  const handleStatusChange = (value: string) =>
    setDraftEvent((current) => ({
      ...current,
      status: value,
    }));

  const handleAddJudge = () =>
    setDraftEvent((current) => ({
      ...current,
      judges: [...current.judges, createDefaultJudge()],
    }));

  const handleDeleteJudge = (index: number) => {
    if (editingJudgeIndex() === index) {
      closeJudgeEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      judges: current.judges.filter((_, judgeIndex) => judgeIndex !== index),
    }));
  };

  const handleOpenJudgeEditor = (index: number, judge: PublicStageJudge) => {
    setEditingJudgeIndex(index);
    setJudgeDialogDraft(judge);
  };

  const handleAddExercise = () =>
    setDraftEvent((current) => ({
      ...current,
      exercises: [...current.exercises, createDefaultExercise()],
    }));

  const handleDeleteExercise = (index: number) => {
    if (editingExerciseIndex() === index) {
      closeExerciseEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      exercises: current.exercises.filter(
        (_, exerciseIndex) => exerciseIndex !== index,
      ),
    }));
  };

  const handleOpenExerciseEditor = (
    index: number,
    exercise: PublicEventExercise,
  ) => {
    setEditingExerciseIndex(index);
    setExerciseDialogDraft(exercise);
  };

  const handleAddCompetitor = () =>
    setDraftEvent((current) => ({
      ...current,
      competitors: [...current.competitors, createDefaultCompetitor()],
    }));

  const handleDeleteCompetitor = (index: number) => {
    if (editingCompetitorIndex() === index) {
      closeCompetitorEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      competitors: current.competitors.filter(
        (_, competitorIndex) => competitorIndex !== index,
      ),
    }));
  };

  const handleOpenCompetitorEditor = (
    index: number,
    competitor: PublicEventCompetitor,
  ) => {
    setEditingCompetitorIndex(index);
    setCompetitorDialogDraft(competitor);
  };

  const handleCloseEdit = () => setIsEditing(false);
  const handleOpenEdit = () => setIsEditing(true);

  return (
    <div class="competition-event-detail__content">
      <EventOverview
        draftEvent={draftEvent()}
        isEditing={isEditing()}
        onConfigurationFederationChange={handleConfigurationFederationChange}
        onConfigurationNameChange={handleConfigurationNameChange}
        onConfigurationVersionChange={handleConfigurationVersionChange}
        onDisciplineChange={handleDisciplineChange}
        onNameChange={handleNameChange}
        onStatusChange={handleStatusChange}
      />

      <EventJudgesSection
        editingJudgeIndex={editingJudgeIndex()}
        isEditing={isEditing()}
        judgeDialogDraft={judgeDialogDraft()}
        judges={draftEvent().judges}
        onAddJudge={handleAddJudge}
        onCloseJudgeEditor={closeJudgeEditor}
        onDeleteJudge={handleDeleteJudge}
        onJudgeDraftChange={setJudgeDialogDraft}
        onOpenJudgeEditor={handleOpenJudgeEditor}
        onSaveJudge={saveJudgeEditor}
      />

      <EventExercisesSection
        editingExerciseIndex={editingExerciseIndex()}
        exerciseDialogDraft={exerciseDialogDraft()}
        exercises={draftEvent().exercises}
        isEditing={isEditing()}
        onAddExercise={handleAddExercise}
        onCloseExerciseEditor={closeExerciseEditor}
        onDeleteExercise={handleDeleteExercise}
        onExerciseDraftChange={setExerciseDialogDraft}
        onOpenExerciseEditor={handleOpenExerciseEditor}
        onSaveExercise={saveExerciseEditor}
      />

      <EventCompetitorsSection
        competitorDialogDraft={competitorDialogDraft()}
        competitors={draftEvent().competitors}
        editingCompetitorIndex={editingCompetitorIndex()}
        isEditing={isEditing()}
        onAddCompetitor={handleAddCompetitor}
        onCloseCompetitorEditor={closeCompetitorEditor}
        onCompetitorDraftChange={setCompetitorDialogDraft}
        onDeleteCompetitor={handleDeleteCompetitor}
        onOpenCompetitorEditor={handleOpenCompetitorEditor}
        onSaveCompetitor={saveCompetitorEditor}
      />

      <Show when={isEditing()}>
        <CircleButton onClick={handleCloseEdit}>
          <>
            <span>--Close edit</span>
            <span aria-hidden="true">X</span>
          </>
        </CircleButton>
        <AtomButton type="destructive" onClick={props.onDelete}>
          --Delete event
        </AtomButton>
      </Show>
      <Show when={!isEditing()}>
        <CircleButton onClick={handleOpenEdit}>
          <>
            <span>--Edit event</span>
            <span aria-hidden="true">--edit</span>
          </>
        </CircleButton>
      </Show>
    </div>
  );
}

function getEventDraftKey(event: EventResponse) {
  return JSON.stringify({
    competitors: event.competitors,
    configuration: event.configuration,
    discipline: event.discipline,
    name: event.name,
    status: event.status,
  });
}

function createDefaultCompetitor(): PublicEventCompetitor {
  return {
    finalScore: 0,
    id: globalThis.crypto.randomUUID(),
    identity: "",
    name: "--Default competitor",
    owner: "",
    scores: [],
  };
}

function createDefaultJudge(): PublicStageJudge {
  return {
    collectorEmail: "",
    name: "--Default judge",
  };
}

function createDefaultExercise(): PublicEventExercise {
  return {
    id: globalThis.crypto.randomUUID(),
    order: 0,
    text: "--Default exercise",
  };
}
