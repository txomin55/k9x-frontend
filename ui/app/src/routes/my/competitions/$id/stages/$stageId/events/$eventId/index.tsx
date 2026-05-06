import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import EventCompetitorsSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/competitor/EventCompetitorsSection";
import EventExercisesSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/exercises/EventExercisesSection";
import EventJudgesSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/judges/EventJudgesSection";
import { useApiEvent } from "@/services/secured/event-crud/eventCrud";
import type {
  EventCompetitor,
  EventCompetitorDetail,
  EventDetail,
  EventEditorDraft,
  EventExerciseDetail,
  EventJudgeDetail,
  UpdateEventRequest,
} from "@/services/secured/event-crud/eventCrud.types";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { toEventEditorDraft } from "@/utils/event";
import { getEventDisciplineLabel } from "@/components/common/event-discipline-field/EventDisciplineField";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import EventConfigurationSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/configuration/EventConfigurationSection";
import { useConfigurations } from "@/services/secured/configurations/configurations";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute(
  "/my/competitions/$id/stages/$stageId/events/$eventId/",
)({
  component: CompetitionEventDetailPage,
  staticData: {
    breadcrumb: (match) => {
      const competition = getCachedCompetitions()?.find(
        (entry) => entry.id === match.params.id,
      );
      const stage = competition?.stages?.find(
        (entry) => entry.id === match.params.stageId,
      );
      const event = stage?.events?.find(
        (entry) => entry.id === match.params.eventId,
      );

      return event?.name;
    },
  },
});

function CompetitionEventDetailPage() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const params = useParams({
    from: "/my/competitions/$id/stages/$stageId/events/$eventId/",
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
      to: "/my/competitions/$id/stages/$stageId/events/$eventId",
    });
  };

  const handleDeleteEvent = (eventId: string) =>
    deleteApiEvent(eventId, params().stageId, {
      competitionId: params().id,
    });

  const handleUpdateEvent = (eventId: string, event: UpdateEventRequest) =>
    updateApiEvent(params().stageId, eventId, event, {
      competitionId: params().id,
    });

  createEffect(() => {
    if (params().eventId !== "new" || hasCreatedDraftEvent) return;

    hasCreatedDraftEvent = true;
    createDraftEvent();
  });

  return params().eventId === "new" ? (
    <span>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.CREATING_EVENT")}</span>
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
  event: Accessor<EventDetail | undefined>;
  eventId: string;
  onDeleteEvent: (eventId: string) => void;
  onUpdate: (eventId: string, event: UpdateEventRequest) => void;
  stageId: string;
}) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const [resolvedEvent, setResolvedEvent] = createSignal<
    EventDetail | undefined
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
      to: "/my/competitions/$id/stages/$stageId",
    });
  };

  return (
    <div class="competition-event-detail">
      <Suspense
        fallback={
          <span>
            {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.LOADING_EVENT_DETAIL")}
          </span>
        }
      >
        <Show
          when={resolvedEvent()}
          fallback={
            <p>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EVENT_NOT_FOUND")}</p>
          }
        >
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
  event: Accessor<EventDetail>;
  onDelete: () => void;
  onUpdate: (eventId: string, event: UpdateEventRequest) => void;
}) {
  const i18n = useI18n();
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftEvent, setDraftEvent] = createSignal<EventEditorDraft>(
    toEventEditorDraft(props.event()),
  );
  const [name, setName] = createSignal(props.event().name);
  const [isCreatingCompetitor, setIsCreatingCompetitor] = createSignal(false);
  const [editingCompetitorId, setEditingCompetitorId] = createSignal<
    string | null
  >(null);
  const [competitorDialogDraft, setCompetitorDialogDraft] =
    createSignal<EventCompetitorDetail | null>(null);
  const [isCreatingJudge, setIsCreatingJudge] = createSignal(false);
  const [editingJudgeId, setEditingJudgeId] = createSignal<string | null>(null);
  const [judgeDialogDraft, setJudgeDialogDraft] =
    createSignal<EventJudgeDetail | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = createSignal(false);
  const [editingExerciseId, setEditingExerciseId] = createSignal<string | null>(
    null,
  );
  const [exerciseDialogDraft, setExerciseDialogDraft] =
    createSignal<EventExerciseDetail | null>(null);
  const configurations = useConfigurations({
    staleTime: Number.POSITIVE_INFINITY,
  });

  const TABS = {
    JUDGES: "JUDGES",
    EXERCISES: "EXERCISES",
    COMPETITORS: "COMPETITORS",
  };

  const exerciseSelectOptions = createMemo<AtomSelectOption[]>(() => {
    const configurationExercises =
      configurations.data
        ?.find((entry) => entry.disciplineId === draftEvent().discipline.id)
        ?.federations.find(
          (entry) =>
            entry.info.id === draftEvent().configuration.federation?.id,
        )
        ?.configurations.find(
          (entry) => entry.id === draftEvent().configuration.id,
        )?.exercises ?? [];

    return configurationExercises.map((exercise) => ({
      label: exercise.name,
      value: exercise.id,
    }));
  });

  const closeJudgeEditor = () => {
    setIsCreatingJudge(false);
    setEditingJudgeId(null);
    setJudgeDialogDraft(null);
  };

  const closeExerciseEditor = () => {
    setIsCreatingExercise(false);
    setEditingExerciseId(null);
    setExerciseDialogDraft(null);
  };

  const getEventDraftKey = (event: EventEditorDraft | EventDetail) => {
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

  const createDefaultCompetitor = (order: number): EventCompetitorDetail => {
    return {
      order,
      dogId: globalThis.crypto.randomUUID(),
      identity: "",
      name: "",
      owner: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DEFAULT_COMPETITOR"),
      team: "",
      country: "",
      breed: "",
      status: "",
    };
  };

  const clampOrder = (order: number, total: number) => {
    return Math.min(Math.max(order, 1), Math.max(total, 1));
  };

  const reorderItems = <T, TId extends string>(
    items: T[],
    updatedItem: T,
    getId: (item: T) => TId,
    setOrder: (item: T, order: number) => T,
    requestedOrder: number,
  ): T[] => {
    const itemId = getId(updatedItem);
    const existingIndex = items.findIndex((entry) => getId(entry) === itemId);
    const itemsWithoutUpdated =
      existingIndex >= 0
        ? items.filter((entry) => getId(entry) !== itemId)
        : items;
    const normalizedOrder = clampOrder(
      requestedOrder,
      itemsWithoutUpdated.length + 1,
    );
    const insertionIndex = normalizedOrder - 1;
    const nextItems = [...itemsWithoutUpdated];

    nextItems.splice(insertionIndex, 0, setOrder(updatedItem, normalizedOrder));

    return nextItems.map((entry, index) => setOrder(entry, index + 1));
  };

  const reorderCompetitors = (
    competitors: EventCompetitorDetail[],
    order: number,
    updatedCompetitor: EventCompetitorDetail,
  ): EventCompetitorDetail[] => {
    return reorderItems(
      competitors,
      updatedCompetitor,
      (entry) => entry.dogId,
      (entry, nextOrder) => ({
        ...entry,
        order: nextOrder,
      }),
      order,
    );
  };

  const reorderExercises = (
    exercises: EventExerciseDetail[],
    order: number,
    updatedExercise: EventExerciseDetail,
  ): EventExerciseDetail[] => {
    return reorderItems(
      exercises,
      updatedExercise,
      (entry) => entry.id,
      (entry, nextOrder) => ({
        ...entry,
        order: nextOrder,
      }),
      order,
    );
  };

  const mapCompetitorForUpdate = (
    competitor: EventCompetitorDetail,
  ): EventCompetitor => {
    return {
      dogId: competitor.dogId,
      identity: competitor.identity,
      owner: competitor.owner,
      team: competitor.team,
      country: competitor.country,
      order: competitor.order,
    };
  };

  const createDefaultJudge = (): EventJudgeDetail => ({
    collectorEmail: "",
    id: globalThis.crypto.randomUUID(),
  });

  const createDefaultExercise = (order: number): EventExerciseDetail => {
    return {
      id: globalThis.crypto.randomUUID(),
      order,
      name: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DEFAULT_EXERCISE"),
      tags: [],
    };
  };

  const buildUpdatePayload = (
    event: EventEditorDraft,
    eventName: string,
  ): UpdateEventRequest => ({
    competitors: event.competitors.map((competitor) =>
      mapCompetitorForUpdate(competitor),
    ),
    configurationId: event.configuration.id,
    exercises: event.exercises,
    judges: event.judges,
    name: eventName,
  });

  const persistEventEdits = (
    nextDraftEvent: EventEditorDraft,
    nextName = name(),
  ) => {
    if (!isEditing()) return;

    const externalEvent = props.event();
    const nextEvent: EventEditorDraft = {
      ...nextDraftEvent,
      name: nextName,
    };

    if (getEventDraftKey(nextEvent) === getEventDraftKey(externalEvent)) return;

    props.onUpdate(nextEvent.id, buildUpdatePayload(nextEvent, nextName));
  };

  const updateDraftEvent = (
    updater: (current: EventEditorDraft) => EventEditorDraft,
    options?: { persist?: boolean; nextName?: string },
  ) => {
    let nextDraftEvent = draftEvent();

    setDraftEvent((current) => {
      nextDraftEvent = updater(current);
      return nextDraftEvent;
    });

    if (options?.persist) {
      persistEventEdits(nextDraftEvent, options.nextName);
    }

    return nextDraftEvent;
  };

  const commitEventNameEdits = () => {
    persistEventEdits(draftEvent(), name());
  };

  const createJudge = () => {
    const draft = judgeDialogDraft();

    if (!draft) return;

    updateDraftEvent(
      (current) => ({
        ...current,
        judges: [...current.judges, draft],
      }),
      {
        persist: true,
      },
    );
  };

  const saveJudgeEditor = () => {
    if (isCreatingJudge()) {
      return;
    }

    const draft = judgeDialogDraft();

    if (!draft) return;

    const currentEditingJudgeId = editingJudgeId();

    if (!currentEditingJudgeId) return;

    setEditingJudgeId(draft.id);

    updateDraftEvent(
      (current) => ({
        ...current,
        judges: current.judges.map((entry) =>
          entry.id === currentEditingJudgeId ? draft : entry,
        ),
      }),
      {
        persist: true,
      },
    );
  };

  const createExercise = () => {
    const draft = exerciseDialogDraft();

    if (!draft) return;

    const normalizedDraft = {
      ...draft,
      order: clampOrder(
        draft.order,
        draftEvent().exercises.length + (isCreatingExercise() ? 1 : 0),
      ),
    };

    updateDraftEvent(
      (current) => ({
        ...current,
        exercises: reorderExercises(
          current.exercises,
          normalizedDraft.order,
          normalizedDraft,
        ),
      }),
      {
        persist: true,
      },
    );
  };

  const saveExerciseEditor = () => {
    if (isCreatingExercise()) {
      return;
    }

    const draft = exerciseDialogDraft();

    if (!draft) return;

    const normalizedDraft = {
      ...draft,
      order: clampOrder(
        draft.order,
        draftEvent().exercises.length + (isCreatingExercise() ? 1 : 0),
      ),
    };

    const currentEditingExerciseId = editingExerciseId();

    if (!currentEditingExerciseId) return;

    updateDraftEvent(
      (current) => {
        const previousExercise = current.exercises.find(
          (entry) => entry.id === currentEditingExerciseId,
        );
        const orderChanged =
          previousExercise && previousExercise.order !== normalizedDraft.order;

        const hasConflict = current.exercises.some(
          (entry) =>
            entry.id !== currentEditingExerciseId &&
            entry.order === normalizedDraft.order,
        );
        const shouldReorder = orderChanged || hasConflict;

        const nextExercises = shouldReorder
          ? reorderExercises(
              current.exercises,
              normalizedDraft.order,
              normalizedDraft,
            )
          : current.exercises.map((entry) =>
              entry.id === currentEditingExerciseId ? normalizedDraft : entry,
            );

        return {
          ...current,
          exercises: nextExercises,
        };
      },
      {
        persist: true,
      },
    );
  };

  const createCompetitor = () => {
    const draft = competitorDialogDraft();

    if (!draft) return;

    const normalizedDraft = {
      ...draft,
      order: clampOrder(
        draft.order,
        draftEvent().competitors.length + (isCreatingCompetitor() ? 1 : 0),
      ),
    };

    updateDraftEvent(
      (current) => ({
        ...current,
        competitors: reorderCompetitors(
          current.competitors,
          normalizedDraft.order,
          normalizedDraft,
        ),
      }),
      {
        persist: true,
      },
    );
  };
  const saveCompetitorEditor = () => {
    if (!isCreatingCompetitor()) {
      const draft = competitorDialogDraft();

      if (!draft) return;

      const normalizedDraft = {
        ...draft,
        order: clampOrder(
          draft.order,
          draftEvent().competitors.length + (isCreatingCompetitor() ? 1 : 0),
        ),
      };

      const currentEditingCompetitorId = editingCompetitorId();

      if (!currentEditingCompetitorId) return;

      setEditingCompetitorId(normalizedDraft.dogId);

      updateDraftEvent(
        (current) => {
          const previousCompetitor = current.competitors.find(
            (entry) => entry.dogId === currentEditingCompetitorId,
          );
          const orderChanged =
            previousCompetitor &&
            previousCompetitor.order !== normalizedDraft.order;
          const hasConflict = current.competitors.some(
            (entry) =>
              entry.dogId !== currentEditingCompetitorId &&
              entry.order === normalizedDraft.order,
          );
          const shouldReorder = orderChanged || hasConflict;

          const nextCompetitors = shouldReorder
            ? reorderCompetitors(
                current.competitors,
                normalizedDraft.order,
                normalizedDraft,
              )
            : current.competitors.map((entry) =>
                entry.dogId === currentEditingCompetitorId
                  ? normalizedDraft
                  : entry,
              );

          return {
            ...current,
            competitors: nextCompetitors,
          };
        },
        {
          persist: true,
        },
      );
    }
  };

  const handleAddJudge = () => {
    const draft = createDefaultJudge();

    setIsCreatingJudge(true);
    setEditingJudgeId(null);
    setJudgeDialogDraft({ ...draft });
  };

  const handleDeleteJudge = (judgeIdToDelete: string) => {
    if (editingJudgeId() === judgeIdToDelete) {
      closeJudgeEditor();
    }

    updateDraftEvent(
      (current) => ({
        ...current,
        judges: current.judges.filter((entry) => entry.id !== judgeIdToDelete),
      }),
      {
        persist: true,
      },
    );
  };

  const handleOpenJudgeEditor = (judge: EventJudgeDetail) => {
    setIsCreatingJudge(false);
    setEditingJudgeId(judge.id);
    setJudgeDialogDraft({ ...judge });
  };

  const handleAddExercise = () => {
    const draft = createDefaultExercise(draftEvent().exercises.length + 1);

    setIsCreatingExercise(true);
    setEditingExerciseId(draft.id);
    setExerciseDialogDraft({ ...draft });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (editingExerciseId() === exerciseId) {
      closeExerciseEditor();
    }

    updateDraftEvent(
      (current) => ({
        ...current,
        exercises: current.exercises.filter((entry) => entry.id !== exerciseId),
      }),
      {
        persist: true,
      },
    );
  };

  const handleOpenExerciseEditor = (exercise: EventExerciseDetail) => {
    setIsCreatingExercise(false);
    setEditingExerciseId(exercise.id);
    setExerciseDialogDraft({ ...exercise });
  };

  const handleAddCompetitor = () => {
    const draft = createDefaultCompetitor(draftEvent().competitors.length + 1);

    setIsCreatingCompetitor(true);
    setEditingCompetitorId(draft.dogId);
    setCompetitorDialogDraft({
      ...draft,
    });
  };

  const handleDeleteCompetitor = (dogId: string) => {
    updateDraftEvent(
      (current) => ({
        ...current,
        competitors: current.competitors.filter(
          (entry) => entry.dogId !== dogId,
        ),
      }),
      {
        persist: true,
      },
    );
  };

  const handleOpenCompetitorEditor = (competitor: EventCompetitorDetail) => {
    setIsCreatingCompetitor(false);
    setEditingCompetitorId(competitor.dogId);
    setCompetitorDialogDraft({
      ...competitor,
    });
  };

  const toggleEditingMode = () => {
    setIsEditing((current) => !current);
  };

  const eventTabsTitles = [
    {
      value: TABS.JUDGES,
      content: <span>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.JUDGES")}</span>,
    },
    {
      value: TABS.EXERCISES,
      content: <span>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EXERCISES")}</span>,
    },
    {
      value: TABS.COMPETITORS,
      content: (
        <span>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.COMPETITORS")}</span>
      ),
    },
  ];

  const eventTabsContents = () => [
    {
      value: TABS.JUDGES,
      content: (
        <EventJudgesSection
          editingJudgeId={editingJudgeId()}
          isCreatingJudge={isCreatingJudge()}
          isEditing={isEditing()}
          judgeDialogDraft={judgeDialogDraft()}
          judges={draftEvent().judges}
          onAddJudge={handleAddJudge}
          onDeleteJudge={handleDeleteJudge}
          onJudgeDraftChange={setJudgeDialogDraft}
          onOpenJudgeEditor={handleOpenJudgeEditor}
          onCreateJudge={createJudge}
          onCommitJudge={saveJudgeEditor}
        />
      ),
    },
    {
      value: TABS.EXERCISES,
      content: (
        <EventExercisesSection
          editingExerciseId={editingExerciseId()}
          exerciseDialogDraft={exerciseDialogDraft()}
          exercises={draftEvent().exercises}
          exerciseCandidatesOptions={exerciseSelectOptions()}
          isCreatingExercise={isCreatingExercise()}
          isEditing={isEditing()}
          onAddExercise={handleAddExercise}
          onDeleteExercise={handleDeleteExercise}
          onExerciseDraftChange={setExerciseDialogDraft}
          onOpenExerciseEditor={handleOpenExerciseEditor}
          onCreateExercise={createExercise}
          onCommitExercise={saveExerciseEditor}
        />
      ),
    },
    {
      value: TABS.COMPETITORS,
      content: (
        <EventCompetitorsSection
          competitorDialogDraft={competitorDialogDraft()}
          competitors={draftEvent().competitors}
          editingCompetitorId={editingCompetitorId()}
          isCreatingCompetitor={isCreatingCompetitor()}
          isEditing={isEditing()}
          onAddCompetitor={handleAddCompetitor}
          onCompetitorDraftChange={setCompetitorDialogDraft}
          onDeleteCompetitor={handleDeleteCompetitor}
          onOpenCompetitorEditor={handleOpenCompetitorEditor}
          onCreateCompetitor={createCompetitor}
          onCommitCompetitor={saveCompetitorEditor}
        />
      ),
    },
  ];

  createEffect(() => {
    if (isEditing()) return;

    const event = props.event();

    setDraftEvent(toEventEditorDraft(event));
    setName(event.name);
  });

  createEffect(() => {
    if (isEditing()) return;

    closeJudgeEditor();
    closeExerciseEditor();
  });

  return (
    <div class="competition-event-detail__content">
      <header>
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{props.event().name}</h1>
              <p>{`${i18n.t("MY.COMPETITIONS.EVENT_DETAIL.STATUS")}: ${props.event().status}`}</p>
              <p>{`${i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DISCIPLINE")}: ${getEventDisciplineLabel(props.event().discipline.id)}`}</p>
              <p>{`${i18n.t("MY.COMPETITIONS.EVENT_DETAIL.PARTICIPANTS")}: ${props.event().competitors.length}`}</p>
            </>
          }
        >
          <div>
            <AtomInput
              label={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EVENT_TITLE")}
              onBlur={commitEventNameEdits}
              value={name()}
              onChange={setName}
            />
            <p>{`${i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DISCIPLINE")}: ${getEventDisciplineLabel(props.event().discipline.id)}`}</p>
            <p>{`${i18n.t("MY.COMPETITIONS.EVENT_DETAIL.PARTICIPANTS")}: ${props.event().competitors.length}`}</p>
          </div>
        </Show>
      </header>

      <EventConfigurationSection
        draft={draftEvent()}
        event={props.event()}
        isEditing={isEditing()}
        onDraftChange={(updater) =>
          updateDraftEvent((current) => updater(current), {
            persist: true,
          })
        }
      />

      <AtomTabs
        defaultValue={TABS.JUDGES}
        options={eventTabsTitles}
        contents={eventTabsContents()}
      />

      <FloatingToggleCircle
        onClick={() => toggleEditingMode()}
        toggled={isEditing()}
        nonToggledText={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EDIT")}
        toggledText={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.VIEW")}
      />
      <Show when={isEditing()}>
        <ConfirmActionButton text={name()} onConfirm={props.onDelete}>
          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
            {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DELETE_EVENT")}
          </AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
