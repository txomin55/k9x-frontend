import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import EventCompetitorsSection from "@/components/routes/my-competitions/$id/stages/$stageid/events/$eventId/competitor/EventCompetitorsSection";
import EventExercisesSection from "@/components/routes/my-competitions/$id/stages/$stageid/events/$eventId/exercises/EventExercisesSection";
import EventJudgesSection from "@/components/routes/my-competitions/$id/stages/$stageid/events/$eventId/judges/EventJudgesSection";
import type {
  EventResponse,
  UpdateEventRequest,
} from "@/services/api/event-api-crud/eventApiCrud";
import { useApiEvent } from "@/services/api/event-api-crud/eventApiCrud";
import type {
  EventCompetitor,
  PublicEventCompetitor,
  PublicEventExercise,
  PublicStageJudge,
} from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import FloatingToggleCircle from "@/components/floating-toggle-circle/FloatingToggleCircle";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";

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
  const [resolvedEvent, setResolvedEvent] = createSignal<
    EventResponse | undefined
  >(props.event());

  createEffect(() => {
    const currentEvent = props.event();

    if (!currentEvent) return;

    setResolvedEvent(currentEvent);
  });

  const eventAccessor = () => resolvedEvent()!;

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
        <Show when={resolvedEvent()} fallback={<p>--Event not found.</p>}>
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
  const [name, setName] = createSignal(props.event().name);
  const [configurationName, setConfigurationName] = createSignal(
    props.event().configuration.name,
  );
  const [configurationVersion, setConfigurationVersion] = createSignal(
    String(props.event().configuration.version),
  );
  const [configurationFederation, setConfigurationFederation] = createSignal(
    props.event().configuration.federation,
  );
  const [isCreatingCompetitor, setIsCreatingCompetitor] = createSignal(false);
  const [editingCompetitorId, setEditingCompetitorId] = createSignal<
    string | null
  >(null);
  const [competitorDialogDraft, setCompetitorDialogDraft] =
    createSignal<PublicEventCompetitor | null>(null);
  const [isCreatingJudge, setIsCreatingJudge] = createSignal(false);
  const [editingJudgeIndex, setEditingJudgeIndex] = createSignal<number | null>(
    null,
  );
  const [judgeDialogDraft, setJudgeDialogDraft] =
    createSignal<PublicStageJudge | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = createSignal(false);
  const [editingExerciseId, setEditingExerciseId] = createSignal<string | null>(
    null,
  );
  const [exerciseDialogDraft, setExerciseDialogDraft] =
    createSignal<PublicEventExercise | null>(null);

  createEffect(() => {
    if (isEditing()) return;

    const event = props.event();

    setDraftEvent(event);
    setName(event.name);
    setConfigurationName(event.configuration.name);
    setConfigurationVersion(String(event.configuration.version));
    setConfigurationFederation(event.configuration.federation);
  });

  createEffect(() => {
    if (isEditing()) return;

    closeCompetitorEditor();
    closeJudgeEditor();
    closeExerciseEditor();
  });

  const closeCompetitorEditor = () => {
    setIsCreatingCompetitor(false);
    setEditingCompetitorId(null);
    setCompetitorDialogDraft(null);
  };

  const closeJudgeEditor = () => {
    setIsCreatingJudge(false);
    setEditingJudgeIndex(null);
    setJudgeDialogDraft(null);
  };

  const closeExerciseEditor = () => {
    setIsCreatingExercise(false);
    setEditingExerciseId(null);
    setExerciseDialogDraft(null);
  };

  const getEventDraftKey = (event: EventResponse) => {
    return JSON.stringify({
      competitors: event.competitors,
      configuration: event.configuration,
      discipline: event.discipline,
      exercises: event.exercises,
      judges: event.judges,
      name: event.name,
      status: event.status,
    });
  };

  const createDefaultCompetitor = (): PublicEventCompetitor => {
    return {
      finalScore: 0,
      order: 0,
      dogId: globalThis.crypto.randomUUID(),
      identity: "",
      name: "",
      owner: "--Default competitor",
      team: "",
      country: "",
      breed: "",
      scores: [],
    };
  };

  const reorderCompetitors = (
    competitors: PublicEventCompetitor[],
    order: number,
    updatedCompetitor: PublicEventCompetitor,
  ): PublicEventCompetitor[] => {
    return competitors.map((entry) => {
      if (entry.dogId === updatedCompetitor.dogId) {
        return updatedCompetitor;
      }

      if (entry.order >= order) {
        return {
          ...entry,
          order: entry.order + 1,
        };
      }

      return entry;
    });
  };

  const reorderExercises = (
    exercises: PublicEventExercise[],
    order: number,
    updatedExercise: PublicEventExercise,
  ): PublicEventExercise[] => {
    return exercises.map((entry) => {
      if (entry.id === updatedExercise.id) {
        return updatedExercise;
      }

      if (entry.order >= order) {
        return {
          ...entry,
          order: entry.order + 1,
        };
      }

      return entry;
    });
  };

  const mapCompetitorForUpdate = (
    competitor: PublicEventCompetitor,
  ): EventCompetitor => {
    return {
      dogId: competitor.dogId,
      identity: competitor.identity,
      owner: competitor.owner,
      team: competitor.team,
      country: competitor.country,
      order: competitor.order,
      finalScore: competitor.finalScore,
      scores: competitor.scores.map((score) => ({
        exerciseId: score.exerciseId,
        id: score.id,
        score: score.score,
      })),
    };
  };

  const createDefaultJudge = (): PublicStageJudge => {
    return {
      collectorEmail: "",
      name: "--Default judge",
    };
  };

  const createDefaultExercise = (): PublicEventExercise => {
    return {
      id: globalThis.crypto.randomUUID(),
      order: 0,
      text: "--Default exercise",
    };
  };

  const saveJudgeEditor = () => {
    const draft = judgeDialogDraft();

    if (!draft) return;

    if (isCreatingJudge()) {
      setDraftEvent((current) => ({
        ...current,
        judges: [...current.judges, draft],
      }));
    } else {
      const currentEditingJudgeIndex = editingJudgeIndex();

      if (currentEditingJudgeIndex === null) return;

      setDraftEvent((current) => ({
        ...current,
        judges: current.judges.map((entry, judgeIndex) =>
          judgeIndex === currentEditingJudgeIndex ? draft : entry,
        ),
      }));
    }

    closeJudgeEditor();
  };

  const saveExerciseEditor = () => {
    const draft = exerciseDialogDraft();

    if (!draft) return;

    if (isCreatingExercise()) {
      setDraftEvent((current) => ({
        ...current,
        exercises: [...current.exercises, draft],
      }));
    } else {
      const currentEditingExerciseId = editingExerciseId();

      if (!currentEditingExerciseId) return;

      setDraftEvent((current) => {
        const previousExercise = current.exercises.find(
          (entry) => entry.id === currentEditingExerciseId,
        );
        const orderChanged =
          previousExercise && previousExercise.order !== draft.order;

        const hasConflict = current.exercises.some(
          (entry) =>
            entry.id !== currentEditingExerciseId &&
            entry.order === draft.order,
        );
        const shouldReorder = orderChanged || hasConflict;

        const nextExercises = shouldReorder
          ? reorderExercises(current.exercises, draft.order, draft)
          : current.exercises.map((entry) =>
              entry.id === currentEditingExerciseId ? draft : entry,
            );

        return {
          ...current,
          exercises: nextExercises,
        };
      });
    }

    closeExerciseEditor();
  };

  const saveCompetitorEditor = () => {
    const draft = competitorDialogDraft();

    if (!draft) return;

    if (isCreatingCompetitor()) {
      setDraftEvent((current) => ({
        ...current,
        competitors: [...current.competitors, draft],
      }));
    } else {
      const currentEditingCompetitorId = editingCompetitorId();

      if (!currentEditingCompetitorId) return;

      setDraftEvent((current) => {
        const previousCompetitor = current.competitors.find(
          (entry) => entry.dogId === currentEditingCompetitorId,
        );
        const orderChanged =
          previousCompetitor && previousCompetitor.order !== draft.order;
        const hasConflict = current.competitors.some(
          (entry) =>
            entry.dogId !== currentEditingCompetitorId &&
            entry.order === draft.order,
        );
        const shouldReorder = orderChanged || hasConflict;

        const nextCompetitors = shouldReorder
          ? reorderCompetitors(current.competitors, draft.order, draft)
          : current.competitors.map((entry) =>
              entry.dogId === currentEditingCompetitorId ? draft : entry,
            );

        return {
          ...current,
          competitors: nextCompetitors,
        };
      });
    }

    closeCompetitorEditor();
  };

  const handleAddJudge = () => {
    const draft = createDefaultJudge();

    setIsCreatingJudge(true);
    setEditingJudgeIndex(null);
    setJudgeDialogDraft({ ...draft });
  };

  const handleDeleteJudge = (judgeIndexToDelete: number) => {
    if (editingJudgeIndex() === judgeIndexToDelete) {
      closeJudgeEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      judges: current.judges.filter(
        (_, judgeIndex) => judgeIndex !== judgeIndexToDelete,
      ),
    }));
  };

  const handleOpenJudgeEditor = (index: number, judge: PublicStageJudge) => {
    setIsCreatingJudge(false);
    setEditingJudgeIndex(index);
    setJudgeDialogDraft({ ...judge });
  };

  const handleAddExercise = () => {
    const draft = createDefaultExercise();

    setIsCreatingExercise(true);
    setEditingExerciseId(draft.id);
    setExerciseDialogDraft({ ...draft });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (editingExerciseId() === exerciseId) {
      closeExerciseEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      exercises: current.exercises.filter((entry) => entry.id !== exerciseId),
    }));
  };

  const handleOpenExerciseEditor = (exercise: PublicEventExercise) => {
    setIsCreatingExercise(false);
    setEditingExerciseId(exercise.id);
    setExerciseDialogDraft({ ...exercise });
  };

  const handleAddCompetitor = () => {
    const draft = createDefaultCompetitor();

    setIsCreatingCompetitor(true);
    setEditingCompetitorId(draft.dogId);
    setCompetitorDialogDraft({
      ...draft,
      scores: [...draft.scores],
    });
  };

  const handleDeleteCompetitor = (dogId: string) => {
    if (editingCompetitorId() === dogId) {
      closeCompetitorEditor();
    }

    setDraftEvent((current) => ({
      ...current,
      competitors: current.competitors.filter((entry) => entry.dogId !== dogId),
    }));
  };

  const handleOpenCompetitorEditor = (competitor: PublicEventCompetitor) => {
    setIsCreatingCompetitor(false);
    setEditingCompetitorId(competitor.dogId);
    setCompetitorDialogDraft({
      ...competitor,
      scores: [...competitor.scores],
    });
  };

  const commitEventEdits = () => {
    if (!isEditing()) return;

    const externalEvent = props.event();
    const currentDraftEvent = draftEvent();
    const nextEvent: EventResponse = {
      ...currentDraftEvent,
      configuration: {
        ...currentDraftEvent.configuration,
        federation: configurationFederation(),
        name: configurationName(),
        version: Number(configurationVersion()) || 0,
      },
      name: name(),
    };

    if (getEventDraftKey(nextEvent) === getEventDraftKey(externalEvent)) return;

    const updatePayload: UpdateEventRequest = {
      ...nextEvent,
      competitors: nextEvent.competitors.map((competitor) =>
        mapCompetitorForUpdate(competitor),
      ),
    };

    props.onUpdate(updatePayload);
  };

  const toggleEditingMode = () => {
    if (isEditing()) {
      commitEventEdits();
    }

    setIsEditing((current) => !current);
  };

  return (
    <div class="competition-event-detail__content">
      <header>
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{props.event().name}</h1>
              <p>{`--Status: ${props.event().status}`}</p>
              <p>{`--Discipline: ${props.event().discipline}`}</p>
              <p>{`--Participants: ${props.event().competitors.length}`}</p>
            </>
          }
        >
          <div>
            <AtomInput
              label="--Event title"
              onBlur={commitEventEdits}
              value={name()}
              onChange={setName}
            />
            <p>{`--Discipline: ${props.event().discipline}`}</p>
            <p>{`--Participants: ${props.event().competitors.length}`}</p>
          </div>
        </Show>
      </header>

      <section>
        <h2>--Configuration</h2>
        <Show
          when={isEditing()}
          fallback={
            <>
              <p>{`--Name: ${props.event().configuration.name}`}</p>
              <p>{`--Version: ${props.event().configuration.version}`}</p>
              <p>{`--Federation: ${props.event().configuration.federation}`}</p>
            </>
          }
        >
          <div>
            <AtomInput
              label="--Configuration name"
              onBlur={commitEventEdits}
              value={configurationName()}
              onChange={setConfigurationName}
            />
            <AtomNumberInput
              label="--Version"
              onBlur={commitEventEdits}
              value={configurationVersion()}
              onChange={setConfigurationVersion}
            />
            <AtomInput
              label="--Federation"
              onBlur={commitEventEdits}
              value={configurationFederation()}
              onChange={setConfigurationFederation}
            />
          </div>
        </Show>
      </section>

      <EventJudgesSection
        editingJudgeIndex={editingJudgeIndex()}
        isCreatingJudge={isCreatingJudge()}
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
        editingExerciseId={editingExerciseId()}
        exerciseDialogDraft={exerciseDialogDraft()}
        exercises={draftEvent().exercises}
        isCreatingExercise={isCreatingExercise()}
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
        editingCompetitorId={editingCompetitorId()}
        isCreatingCompetitor={isCreatingCompetitor()}
        isEditing={isEditing()}
        onAddCompetitor={handleAddCompetitor}
        onCloseCompetitorEditor={closeCompetitorEditor}
        onCompetitorDraftChange={setCompetitorDialogDraft}
        onDeleteCompetitor={handleDeleteCompetitor}
        onOpenCompetitorEditor={handleOpenCompetitorEditor}
        onSaveCompetitor={saveCompetitorEditor}
      />

      <FloatingToggleCircle
        onClick={() => toggleEditingMode()}
        toggled={isEditing()}
        nonToggledText="--Edit"
        toggledText="X"
      />
      <Show when={isEditing()}>
        <ConfirmActionButton text={name()} onConfirm={props.onDelete}>
          <AtomButton type="destructive">--Delete event</AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
