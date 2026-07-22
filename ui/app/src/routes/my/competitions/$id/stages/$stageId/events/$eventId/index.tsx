import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import EventDetailSkeleton from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/EventDetailSkeleton";
import EventCompetitorsSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/competitor/EventCompetitorsSection";
import EventExercisesSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/exercises/EventExercisesSection";
import EventJudgesSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/judges/EventJudgesSection";
import {
  prefetchEventById,
  updateApiEventNotCompeting,
  useApiEvent,
} from "@/services/secured/event-crud/eventCrud";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { useApiStage } from "@/services/secured/stage-crud/stageCrud";
import type {
  EventCompetitorDetail,
  EventCompetitorRequestDTO,
  EventDetailResponseDTO,
  EventEditorDraft,
  EventExerciseDetailResponseDTO,
  EventJudgeDetailResponseDTO,
  UpdateEventRequestDTO,
} from "@/services/secured/event-crud/eventCrud.types";
import {
  SCORE_CALCULATION,
  toEventExerciseRequest,
} from "@/services/secured/event-crud/eventCrud.types";
import { getCachedCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import {
  canDeleteEvent,
  canEditEvent,
  canManageEvent,
  COMPETITOR_STATUS,
  toEventEditorDraft,
} from "@/utils/event";
import { parseDateInputValue, toDateInputValue } from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingEditMenu from "@/components/common/floating-edit-menu/FloatingEditMenu";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import EventConfigurationSection from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/EventConfigurationSection";
import ObdxCompetitionEventDetailBodyWrapper from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/ObdxCompetitionEventDetailBodyWrapper";
import { useConfigurations } from "@/services/secured/configurations/configurations";
import { useAwards } from "@/services/secured/award-crud/awardCrud";
import AtomSelect, { type AtomSelectOption } from "@lib/components/atoms/select/AtomSelect";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "@lib/components/atoms/combobox/AtomCombobox";
import { useI18n } from "@/stores/i18n/i18n";
import { generateEntityId } from "@/utils/id/generateEntityId";
import "./styles.css";

const TABS = {
  JUDGES: "JUDGES",
  EXERCISES: "EXERCISES",
  COMPETITORS: "COMPETITORS",
} as const;

function CompetitionObdxEventDetailBody(props: {
  event: Accessor<EventDetailResponseDTO>;
  onDelete: () => void;
  onUpdate: (eventId: string, event: UpdateEventRequestDTO) => void;
  stageDateFrom?: number;
}) {
  const i18n = useI18n();
  const params = useParams({
    from: "/my/competitions/$id/stages/$stageId/events/$eventId/",
  });
  const search = useSearch({
    from: "/my/competitions/$id/stages/$stageId/events/$eventId/",
  });
  const navigate = useNavigate();
  const currentTab = () => search().tab ?? TABS.JUDGES;
  const handleTabChange = (tab: string) =>
    void navigate({
      to: "/my/competitions/$id/stages/$stageId/events/$eventId",
      params: params(),
      search: (prev) => ({ ...prev, tab }),
      replace: true,
    });
  const [isEditing, setIsEditing] = createSignal(false);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [draftEvent, setDraftEvent] = createSignal<EventEditorDraft>(
    toEventEditorDraft(props.event(), props.stageDateFrom),
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
    createSignal<EventJudgeDetailResponseDTO | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = createSignal(false);
  const [editingExerciseId, setEditingExerciseId] = createSignal<string | null>(
    null,
  );
  const [exerciseDialogDraft, setExerciseDialogDraft] =
    createSignal<EventExerciseDetailResponseDTO | null>(null);
  const configurations = useConfigurations(draftEvent().discipline.id, {
    gcTime: 2 * 60 * 1000,
  });
  const awardsQuery = useAwards(draftEvent().discipline.id, {
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  const awardOptions = createMemo<AtomComboboxOption[]>(() =>
    (awardsQuery.data ?? []).map(({ id, name }) => ({
      label: name,
      value: id,
    })),
  );

  const selectedAwardOptions = createMemo<AtomComboboxOption[]>(() => {
    const selectedIds = new Set(draftEvent().awards.map((award) => award.id));
    return awardOptions().filter((option) => selectedIds.has(option.value));
  });

  const hasConfiguration = createMemo(() =>
    Boolean(draftEvent().configuration.id),
  );

  const canEditConfiguration = createMemo(
    () => isEditing() && canEditEvent(props.event().status),
  );

  const canEditDetails = createMemo(
    () =>
      isEditing() && hasConfiguration() && canEditEvent(props.event().status),
  );

  const canManageCompetitors = createMemo(
    () =>
      isEditing() && hasConfiguration() && canManageEvent(props.event().status),
  );

  const MID_AVG_MIN_JUDGES = 4;

  const hasEnoughJudgesForMidAvg = createMemo(
    () => draftEvent().judges.length >= MID_AVG_MIN_JUDGES,
  );

  const scoreCalculationOptions = createMemo<AtomSelectOption[]>(() => [
    {
      label: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION_AVG"),
      value: SCORE_CALCULATION.AVG,
    },
    {
      label: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION_MID_AVG"),
      value: SCORE_CALCULATION.MID_AVG,
      disabled: !hasEnoughJudgesForMidAvg(),
    },
  ]);

  const selectedScoreCalculationOption = createMemo<AtomSelectOption | null>(
    () =>
      scoreCalculationOptions().find(
        (option) => option.value === draftEvent().scoreCalculation,
      ) ?? null,
  );

  const configurationExercises = createMemo(
    () =>
      configurations.data?.obdx?.federations
        ?.find(
          (entry) =>
            entry.info.id === draftEvent().configuration.federation?.id,
        )
        ?.configurations.find(
          (entry) => entry.id === draftEvent().configuration.id,
        )?.exercises ?? [],
  );

  const exerciseCatalogOptions = createMemo<AtomSelectOption[]>(() =>
    configurationExercises().map((exercise) => ({
      label: exercise.name,
      value: exercise.id,
    })),
  );

  const exerciseSelectOptions = createMemo<AtomSelectOption[]>(() => {
    const addedExerciseIds = new Set(
      draftEvent()
        .exercises.filter((exercise) => exercise.id !== editingExerciseId())
        .map((exercise) => exercise.id),
    );

    return configurationExercises()
      .filter((exercise) => !addedExerciseIds.has(exercise.id))
      .map((exercise) => ({
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

  const getEventDraftKey = (
    event: EventEditorDraft | EventDetailResponseDTO,
  ) => {
    return JSON.stringify({
      awards: event.awards.map((award) => award.id),
      competitors: event.competitors.map((competitor) => ({
        dogId: competitor.dogId,
        position: competitor.position,
        competitorNumber: competitor.competitorNumber,
        accepted: competitor.accepted,
        bih: competitor.bih,
        reserve: competitor.reserve,
      })),
      configuration: event.configuration,
      discipline: event.discipline,
      enrollmentDeadline: event.enrollmentDeadline,
      exercises: event.exercises,
      judges: event.judges,
      name: event.name,
      scoreCalculation: event.scoreCalculation,
      status: event.status,
    });
  };

  const createDefaultCompetitor = (
    order: number,
    dogId: string,
  ): EventCompetitorDetail => {
    return {
      position: order,
      competitorNumber: order,
      accepted: true,
      dogId,
      identity: "",
      name: "",
      owner: "",
      handler: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DEFAULT_COMPETITOR"),
      team: "",
      country: "",
      breed: "",
      status: "",
      notCompeting: false,
      bih: false,
      reserve: false,
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
        position: nextOrder,
      }),
      order,
    );
  };

  const reorderExercises = (
    exercises: EventExerciseDetailResponseDTO[],
    order: number,
    updatedExercise: EventExerciseDetailResponseDTO,
  ): EventExerciseDetailResponseDTO[] => {
    return reorderItems(
      exercises,
      updatedExercise,
      (entry) => entry.id,
      (entry, nextOrder) => ({
        ...entry,
        position: nextOrder,
      }),
      order,
    );
  };

  const mapCompetitorForUpdate = (
    competitor: EventCompetitorDetail,
  ): EventCompetitorRequestDTO => {
    return {
      dogId: competitor.dogId,
      position: competitor.position,
      competitorNumber: competitor.competitorNumber,
      accepted: competitor.accepted,
      bih: competitor.bih,
      reserve: competitor.reserve,
    };
  };

  const createDefaultJudge = (): EventJudgeDetailResponseDTO => ({
    collectorEmail: "",
    name: "",
    id: generateEntityId("judge"),
  });

  const createDefaultExercise = (
    order: number,
    judges: EventJudgeDetailResponseDTO[],
  ): EventExerciseDetailResponseDTO => {
    return {
      id: globalThis.crypto.randomUUID(),
      position: order,
      name: i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DEFAULT_EXERCISE"),
      tags: [],
      judges: judges.map(({ id, name }) => ({ id, name })),
    };
  };

  const buildUpdatePayload = (
    event: EventEditorDraft,
    eventName: string,
  ): UpdateEventRequestDTO => ({
    awards: event.awards.map((award) => award.id),
    competitors: event.competitors.map((competitor) =>
      mapCompetitorForUpdate(competitor),
    ),
    configurationId: event.configuration.id,
    enrollmentDeadline: event.enrollmentDeadline,
    exercises: event.exercises.map(toEventExerciseRequest),
    judges: event.judges.map((judge) => ({
      collectorEmail: judge.collectorEmail,
      id: judge.id,
    })),
    name: eventName,
    scoreCalculation: event.scoreCalculation,
  });

  const persistEventEdits = (
    nextDraftEvent: EventEditorDraft,
    nextName = name(),
  ) => {
    if (!isEditing()) return;
    if (!nextDraftEvent.configuration.id) return;

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

  const addJudgeToExercises = (
    exercises: EventExerciseDetailResponseDTO[],
    judge: EventJudgeDetailResponseDTO,
  ): EventExerciseDetailResponseDTO[] =>
    exercises.map((exercise) => ({
      ...exercise,
      judges: [...exercise.judges, { id: judge.id, name: judge.name }],
    }));

  const removeJudgeFromExercises = (
    exercises: EventExerciseDetailResponseDTO[],
    judgeId: string,
  ): EventExerciseDetailResponseDTO[] =>
    exercises.map((exercise) => ({
      ...exercise,
      judges: exercise.judges.filter((entry) => entry.id !== judgeId),
    }));

  const renameJudgeInExercises = (
    exercises: EventExerciseDetailResponseDTO[],
    judgeId: string,
    name: string,
  ): EventExerciseDetailResponseDTO[] =>
    exercises.map((exercise) => ({
      ...exercise,
      judges: exercise.judges.map((entry) =>
        entry.id === judgeId ? { ...entry, name } : entry,
      ),
    }));

  const createJudge = () => {
    const draft = judgeDialogDraft();

    if (!draft) return;

    updateDraftEvent(
      (current) => ({
        ...current,
        judges: [...current.judges, draft],
        exercises: addJudgeToExercises(current.exercises, draft),
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
        exercises: renameJudgeInExercises(
          current.exercises,
          currentEditingJudgeId,
          draft.name,
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
      position: clampOrder(
        draft.position,
        draftEvent().exercises.length + (isCreatingExercise() ? 1 : 0),
      ),
    };

    updateDraftEvent(
      (current) => ({
        ...current,
        exercises: reorderExercises(
          current.exercises,
          normalizedDraft.position,
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
      position: clampOrder(
        draft.position,
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
          previousExercise &&
          previousExercise.position !== normalizedDraft.position;

        const hasConflict = current.exercises.some(
          (entry) =>
            entry.id !== currentEditingExerciseId &&
            entry.position === normalizedDraft.position,
        );
        const shouldReorder = orderChanged || hasConflict;

        const nextExercises = shouldReorder
          ? reorderExercises(
              current.exercises,
              normalizedDraft.position,
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

    if (!draft || !draft.dogId) return;

    const normalizedDraft = {
      ...draft,
      position: clampOrder(
        draft.position,
        draftEvent().competitors.length + (isCreatingCompetitor() ? 1 : 0),
      ),
    };

    updateDraftEvent(
      (current) => ({
        ...current,
        competitors: reorderCompetitors(
          current.competitors,
          normalizedDraft.position,
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

      if (!draft || !draft.dogId) return;

      const normalizedDraft = {
        ...draft,
        position: clampOrder(
          draft.position,
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
            previousCompetitor.position !== normalizedDraft.position;
          const hasConflict = current.competitors.some(
            (entry) =>
              entry.dogId !== currentEditingCompetitorId &&
              entry.position === normalizedDraft.position,
          );
          const shouldReorder = orderChanged || hasConflict;

          const nextCompetitors = shouldReorder
            ? reorderCompetitors(
                current.competitors,
                normalizedDraft.position,
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
        exercises: removeJudgeFromExercises(current.exercises, judgeIdToDelete),
      }),
      {
        persist: true,
      },
    );
  };

  const handleOpenJudgeEditor = (judge: EventJudgeDetailResponseDTO) => {
    setIsCreatingJudge(false);
    setEditingJudgeId(judge.id);
    setJudgeDialogDraft({ ...judge });
  };

  const handleAddExercise = () => {
    const draft = createDefaultExercise(
      draftEvent().exercises.length + 1,
      draftEvent().judges,
    );

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

  const handleOpenExerciseEditor = (
    exercise: EventExerciseDetailResponseDTO,
  ) => {
    setIsCreatingExercise(false);
    setEditingExerciseId(exercise.id);
    setExerciseDialogDraft({ ...exercise });
  };

  const handleAddCompetitor = () => {
    const draft = createDefaultCompetitor(
      draftEvent().competitors.length + 1,
      "",
    );

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

  const handleAcceptCompetitor = (dogId: string) => {
    if (!hasConfiguration()) return;

    const nextDraftEvent = updateDraftEvent((current) => ({
      ...current,
      competitors: current.competitors.map((entry) =>
        entry.dogId === dogId
          ? { ...entry, accepted: true, status: COMPETITOR_STATUS.ENROLLED }
          : entry,
      ),
    }));

    props.onUpdate(
      nextDraftEvent.id,
      buildUpdatePayload(nextDraftEvent, name()),
    );
  };

  const handleMarkCompetitorNotCompeting = (dogId: string) => {
    if (!hasConfiguration()) return;

    const nextDraftEvent = updateDraftEvent((current) => ({
      ...current,
      competitors: current.competitors.map((entry) =>
        entry.dogId === dogId ? { ...entry, notCompeting: true } : entry,
      ),
    }));

    updateApiEventNotCompeting(nextDraftEvent.id, {
      dogId,
      notCompeting: true,
    });
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

  const eventTabsTitles = createMemo(() => [
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
        <span>
          {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.COMPETITORS")} (
          {props.event().competitors.length})
        </span>
      ),
    },
  ]);

  const eventTabsContents = () => [
    {
      value: TABS.JUDGES,
      content: (
        <EventJudgesSection
          editingJudgeId={editingJudgeId()}
          isCreatingJudge={isCreatingJudge()}
          isEditing={canEditDetails()}
          menuOpen={menuOpen()}
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
          eventJudges={draftEvent().judges}
          exerciseDialogDraft={exerciseDialogDraft()}
          exercises={draftEvent().exercises}
          exerciseCandidatesOptions={exerciseSelectOptions()}
          exerciseCatalogOptions={exerciseCatalogOptions()}
          isCreatingExercise={isCreatingExercise()}
          isEditing={canEditDetails()}
          menuOpen={menuOpen()}
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
          eventStatus={props.event().status}
          editingCompetitorId={editingCompetitorId()}
          isCreatingCompetitor={isCreatingCompetitor()}
          isEditing={canManageCompetitors()}
          menuOpen={menuOpen()}
          onAddCompetitor={handleAddCompetitor}
          onCompetitorDraftChange={setCompetitorDialogDraft}
          onDeleteCompetitor={handleDeleteCompetitor}
          onOpenCompetitorEditor={handleOpenCompetitorEditor}
          onCreateCompetitor={createCompetitor}
          onCommitCompetitor={saveCompetitorEditor}
          onAcceptCompetitor={handleAcceptCompetitor}
          onMarkCompetitorNotCompeting={handleMarkCompetitorNotCompeting}
        />
      ),
    },
  ];

  createEffect(() => {
    if (isEditing()) return;

    const event = props.event();

    setDraftEvent(toEventEditorDraft(event, props.stageDateFrom));
    setName(event.name);
  });

  createEffect(() => {
    if (isEditing()) return;

    closeJudgeEditor();
    closeExerciseEditor();
  });

  return (
    <div class="page competition-event-detail__content">
      <header>
        <Show
          when={canEditDetails()}
          fallback={
            <div class="competition-event-detail__content--header">
              <div class="competition-event-detail__content--header-title">
                <StatusBadge status={props.event().status} />
              </div>
              <DisciplineIcon disciplineId={props.event().discipline.id} />
            </div>
          }
        >
          <div>
            <AtomInput
              label={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EVENT_TITLE")}
              onBlur={commitEventNameEdits}
              value={name()}
              onChange={setName}
            />
          </div>
        </Show>
      </header>

      <EventConfigurationSection
        draft={draftEvent()}
        event={props.event()}
        isEditing={canEditConfiguration()}
        onDraftChange={(updater) =>
          updateDraftEvent((current) => updater(current), {
            persist: true,
          })
        }
      />

      <AtomInput
        label={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.ENROLLMENT_DEADLINE")}
        type="date"
        disabled={!canEditDetails()}
        value={toDateInputValue(draftEvent().enrollmentDeadline)}
        onChange={(value) =>
          updateDraftEvent(
            (current) => ({
              ...current,
              enrollmentDeadline: parseDateInputValue(
                value,
                current.enrollmentDeadline,
              ),
            }),
            { persist: true },
          )
        }
      />

      <Show
        when={canEditDetails()}
        fallback={
          <div class="competition-event-detail__content--calculation">
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION")}
            </span>
            <span class="text-caption-lg">
              {selectedScoreCalculationOption()?.label}
            </span>
          </div>
        }
      >
        <AtomSelect
          label={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION")}
          placeholder={i18n.t(
            "MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION_PLACEHOLDER",
          )}
          description={
            !hasEnoughJudgesForMidAvg()
              ? i18n.t(
                  "MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION_MID_AVG_DISABLED_HELP",
                )
              : undefined
          }
          options={scoreCalculationOptions()}
          value={selectedScoreCalculationOption()}
          onChange={(option) =>
            option &&
            updateDraftEvent(
              (current) => ({
                ...current,
                scoreCalculation: option.value,
              }),
              { persist: true },
            )
          }
        />
      </Show>

      <Show
        when={canEditDetails()}
        fallback={
          <div class="competition-event-detail__content--calculation">
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.AWARDS")}
            </span>
            <span class="text-caption-lg">
              {draftEvent()
                .awards.map((award) => award.name)
                .join(", ") || "-"}
            </span>
          </div>
        }
      >
        <AtomCombobox
          multiple
          label={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.AWARDS")}
          placeholder={i18n.t(
            "MY.COMPETITIONS.EVENT_DETAIL.AWARDS_PLACEHOLDER",
          )}
          options={awardOptions()}
          value={selectedAwardOptions()}
          onChange={(options) =>
            updateDraftEvent(
              (current) => ({
                ...current,
                awards: options.map((option) => ({
                  id: option.value,
                  name: option.label,
                })),
              }),
              { persist: true },
            )
          }
        />
      </Show>

      <AtomTabs
        defaultValue={TABS.JUDGES}
        value={currentTab()}
        onChange={handleTabChange}
        options={eventTabsTitles()}
        contents={eventTabsContents()}
      />

      <Show when={canManageEvent(props.event().status)}>
        <Show
          when={
            isEditing() && menuOpen() && canDeleteEvent(props.event().status)
          }
        >
          <div class="floating-action floating-action--level-3">
            <ConfirmActionButton text={name()} onConfirm={props.onDelete}>
              <span class="floating-action__label">
                {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DELETE_EVENT")}
              </span>
              <span class="floating-action__circle floating-action__circle--danger">
                <AtomSvgIcon
                  src={trashIcon}
                  alt={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.DELETE_EVENT")}
                  tinted
                />
              </span>
            </ConfirmActionButton>
          </div>
        </Show>
        <FloatingEditMenu
          editing={isEditing()}
          menuOpen={menuOpen()}
          onMenuToggle={() => setMenuOpen((current) => !current)}
          onEditToggle={() => toggleEditingMode()}
          configLabel={i18n.t("COMMON.FLOATING_MENU.OPTIONS")}
          editLabel={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EDIT")}
          viewLabel={i18n.t("MY.COMPETITIONS.EVENT_DETAIL.VIEW")}
        />
      </Show>
    </div>
  );
}

function CompetitionEventDetailRoute() {
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <CompetitionEventDetailPage />
    </Suspense>
  );
}

export interface CompetitionEventDetailSearch {
  tab?: string;
  unverified?: boolean;
}

export const Route = createFileRoute(
  "/my/competitions/$id/stages/$stageId/events/$eventId/",
)({
  component: CompetitionEventDetailRoute,
  validateSearch: (
    search: Record<string, unknown>,
  ): CompetitionEventDetailSearch => {
    const result: CompetitionEventDetailSearch = {};

    if (
      typeof search.tab === "string" &&
      (Object.values(TABS) as string[]).includes(search.tab)
    ) {
      result.tab = search.tab;
    }

    if (search.unverified === true || search.unverified === "true") {
      result.unverified = true;
    }

    return result;
  },
  loader: ({ params }) => {
    if (params.eventId !== "new" && !isOffline()) {
      void prefetchEventById(params.eventId);
    }
  },
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
    breadcrumbInfo: CompetitionEventDetailBreadcrumbInfo,
  },
});

function CompetitionEventDetailBreadcrumbInfo() {
  const i18n = useI18n();

  return <p>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.BREADCRUMB_INFO")}</p>;
}

function CompetitionEventDetailPage() {
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
  const { getStage } = useApiStage();
  const stage = getStage(params().id, params().stageId);
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

  const handleUpdateEvent = (eventId: string, event: UpdateEventRequestDTO) =>
    updateApiEvent(params().stageId, eventId, event, {
      competitionId: params().id,
    });

  const getStageDateFrom = () => stage()?.dateFrom;

  createEffect(() => {
    if (params().eventId !== "new" || hasCreatedDraftEvent) return;

    hasCreatedDraftEvent = true;
    createDraftEvent();
  });

  return params().eventId === "new" ? (
    <EventDetailSkeleton />
  ) : (
    <ObdxCompetitionEventDetailBodyWrapper
      competitionId={params().id}
      event={getEvent(params().id, params().stageId, params().eventId)}
      eventId={params().eventId}
      onDeleteEvent={handleDeleteEvent}
      onUpdate={handleUpdateEvent}
      stageId={params().stageId}
    >
      {({ event, onDelete, onUpdate }) => (
        <CompetitionObdxEventDetailBody
          event={event}
          onDelete={onDelete}
          onUpdate={onUpdate}
          stageDateFrom={getStageDateFrom()}
        />
      )}
    </ObdxCompetitionEventDetailBodyWrapper>
  );
}
