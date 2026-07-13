import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  Index,
  Show,
  Suspense,
} from "solid-js";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { useApiEvent } from "@/services/secured/event-crud/eventCrud";
import { useApiStage } from "@/services/secured/stage-crud/stageCrud";
import type {
  CreateEventRequestDTO,
  EventDetailResponseDTO,
  EventEditorDraft,
  UpdateEventRequestDTO,
} from "@/services/secured/event-crud/eventCrud.types";
import {
  SCORE_CALCULATION,
  toEventExerciseRequest,
} from "@/services/secured/event-crud/eventCrud.types";
import {
  canDeleteEvent,
  canEditEvent,
  toEventEditorDraft,
} from "@/utils/event";
import { canDeleteStage, canEditStage } from "@/utils/stage";
import {
  dayBefore,
  formatDateLabel,
  parseDateInputValue,
  toDateInputValue,
} from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import eyeIcon from "@/assets/miscelaneous/eye.svg";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import Card from "@lib/components/molecules/card/Card";
import EventEditorForm from "@/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventEditorForm";
import { EMPTY_FEDERATION_CONFIGURATION } from "@/services/secured/configurations/configurations";
import {
  StageEditorModel,
  UpdateStageRequestDTO,
} from "@/services/secured/stage-crud/stageCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { generateEntityId } from "@/utils/id/generateEntityId";
import "./styles.css";

export const Route = createFileRoute("/my/competitions/$id/stages/$stageId/")({
  component: CompetitionStageDetailRoute,
});

function CompetitionStageDetailRoute() {
  return (
    <Suspense fallback={<StageDetailSkeleton />}>
      <CompetitionStageDetailPage />
    </Suspense>
  );
}

function StageDetailSkeleton() {
  const i18n = useI18n();

  return (
    <div class="stage-detail">
      <div class="page stage-detail">
        <header class="stage-detail__header">
          <div class="stage-detail__header--info">
            <AtomSkeleton
              variant="rectangular"
              width="6rem"
              height="var(--unit-5)"
              radius="var(--radius-full)"
            />
            <AtomSkeleton width="12rem" />
          </div>
        </header>

        <section class="stage-detail__content">
          <div class="stage-detail__content--events">
            <AtomSkeleton width="6rem" height="var(--text-heading-md)" />
          </div>
          <div class="stage-detail__content--event">
            <For each={Array.from({ length: 3 })}>
              {() => (
                <Card
                  topLeft={
                    <AtomSkeleton
                      width="8rem"
                      height="var(--text-heading-xs)"
                    />
                  }
                  content={
                    <div
                      style={{
                        display: "flex",
                        "align-items": "center",
                        gap: "var(--unit-1)",
                      }}
                    >
                      <AtomSkeleton
                        variant="rectangular"
                        width="var(--unit-5)"
                        height="var(--unit-5)"
                        radius="var(--radius-md)"
                      />
                      <AtomSkeleton
                        variant="rectangular"
                        width="5rem"
                        height="var(--unit-5)"
                        radius="var(--radius-full)"
                      />
                    </div>
                  }
                />
              )}
            </For>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompetitionStageDetailPage() {
  const i18n = useI18n();
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
  const handleCreateEvent = (event: CreateEventRequestDTO) =>
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
    event: UpdateEventRequestDTO,
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
    <span>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.CREATING_STAGE")}</span>
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
  createDefaultEvent: (stageId: string) => CreateEventRequestDTO;
  onCreateEvent: (event: CreateEventRequestDTO) => void;
  onDeleteEvent: (eventId: string, stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onUpdateEvent: (
    stageId: string,
    eventId: string,
    event: UpdateEventRequestDTO,
  ) => void;
  onUpdateStage: (
    competitionId: string,
    stageId: string,
    stage: UpdateStageRequestDTO,
  ) => void;
  stage: Accessor<StageEditorModel | undefined>;
  stageId: string;
}) {
  const i18n = useI18n();
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
      <Suspense
        fallback={
          <span>
            {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.LOADING_STAGE_DETAIL")}
          </span>
        }
      >
        <Show
          when={props.stage()}
          fallback={
            <p>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.STAGE_NOT_FOUND")}</p>
          }
        >
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
  createDefaultEvent: (stageId: string) => CreateEventRequestDTO;
  onCreateEvent: (event: CreateEventRequestDTO) => void;
  onDelete: () => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (
    stageId: string,
    eventId: string,
    event: UpdateEventRequestDTO,
  ) => void;
  onUpdateStage: (
    competitionId: string,
    stageId: string,
    stage: UpdateStageRequestDTO,
  ) => void;
  stage: Accessor<StageEditorModel>;
}) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.stage().name);
  const [dateFrom, setDateFrom] = createSignal(
    toDateInputValue(props.stage().dateFrom),
  );
  const [dateTo, setDateTo] = createSignal(
    toDateInputValue(props.stage().dateTo),
  );
  const [eventParam, setEventParam] = useSearchParam("event", "", "push");
  const isCreatingEvent = () => eventParam() === "new";
  const editingEventId = () =>
    eventParam() && eventParam() !== "new" ? eventParam() : null;
  const [eventDialogDraft, setEventDialogDraft] =
    createSignal<EventEditorDraft | null>(null);

  createEffect(() => {
    if (eventParam()) setIsEditing(true);
  });

  createEffect(() => {
    const param = eventParam();
    if (!param || eventDialogDraft()) return;

    if (param === "new") {
      openNewEventEditor();
      return;
    }

    const event = props.stage().events.find((entry) => entry.id === param);
    if (event) openEventEditor(event);
  });

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

  const openEventEditor = (event: EventDetailResponseDTO) => {
    setEventDialogDraft(toEventEditorDraft(event));
    setEventParam(event.id);
  };

  const openNewEventEditor = () => {
    const draft = props.createDefaultEvent(props.stage().id);

    setEventDialogDraft({
      awards: [],
      competitors: [],
      configuration: {
        federation: EMPTY_FEDERATION_CONFIGURATION,
        id: globalThis.crypto.randomUUID(),
        name: "",
      },
      discipline: {
        id: draft.disciplineId,
        name: "",
      },
      enrollmentDeadline: dayBefore(props.stage().dateFrom),
      exercises: [],
      id: draft.id ?? generateEntityId("event"),
      judges: [],
      name: draft.name ?? "",
      scoreCalculation: SCORE_CALCULATION.AVG,
      stageId: draft.stageId,
      status: "",
    });
    setEventParam("new");
  };

  const closeEventEditor = () => {
    setEventDialogDraft(null);
    setEventParam("");
  };
  const commitStageEdits = () => {
    if (!isEditing()) return;

    const stage = props.stage();
    const nextStage: UpdateStageRequestDTO = {
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
  const createNavigateToEvent =
    (event: Accessor<EventDetailResponseDTO>) => () =>
      void navigate({
        params: {
          eventId: event().id,
          id: props.stage().competitionId,
          stageId: props.stage().id,
        },
        to: "/my/competitions/$id/stages/$stageId/events/$eventId",
      });
  const createEditDialogOpenChange =
    (event: Accessor<EventDetailResponseDTO>) => (isOpen: boolean) => {
      if (isOpen) {
        openEventEditor(event());
        return;
      }

      if (editingEventId() === event().id) {
        closeEventEditor();
      }
    };
  const deleteEventClick = (event: Accessor<EventDetailResponseDTO>) => () => {
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
        disciplineId: draft.discipline.id,
        id: draft.id,
        name: draft.name,
        stageId: draft.stageId,
      });
      closeEventEditor();
      return;
    }

    props.onUpdateEvent(draft.stageId, draft.id, {
      competitors: draft.competitors.map((competitor) => ({
        dogId: competitor.dogId,
        position: competitor.position,
        accepted: competitor.accepted,
        bih: competitor.bih,
        reserve: competitor.reserve,
      })),
      configurationId: draft.configuration.id,
      enrollmentDeadline: draft.enrollmentDeadline,
      exercises: draft.exercises.map(toEventExerciseRequest),
      judges: draft.judges,
      name: draft.name,
      scoreCalculation: draft.scoreCalculation,
    });

    closeEventEditor();
  };

  return (
    <div class="page stage-detail">
      <header class="stage-detail__header">
        <Show
          when={isEditing()}
          fallback={
            <div class="stage-detail__header--info">
              <Show when={props.stage()?.status}>
                {(status) => <StatusBadge status={status()} />}
              </Show>
              <span class="text-caption-lg">{`${formatDateLabel(toDateInputValue(props.stage().dateFrom))} - ${formatDateLabel(toDateInputValue(props.stage().dateTo))}`}</span>
            </div>
          }
        >
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.TITLE")}
            value={title()}
            onBlur={commitStageEdits}
            onChange={setTitle}
          />
          <div class="stage-detail__dates">
            <AtomInput
              label={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DATE_FROM")}
              type="date"
              value={dateFrom()}
              onBlur={commitStageEdits}
              onChange={setDateFrom}
            />
            <AtomInput
              label={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DATE_TO")}
              type="date"
              value={dateTo()}
              onBlur={commitStageEdits}
              onChange={setDateTo}
            />
          </div>
        </Show>
      </header>

      <section class="stage-detail__content">
        <div class="stage-detail__content--events">
          <span class="text-heading-md">
            {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EVENTS")}
          </span>
          <Show when={isEditing()}>
            <AtomDialog
              closeButtonText={i18n.t(
                "MY.COMPETITIONS.STAGE_DETAIL.CLOSE_DIALOG",
              )}
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
              title={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.NEW_EVENT")}
              trigger={<CircleButton>+</CircleButton>}
            />
          </Show>
        </div>
        <Show
          when={props.stage().events.length > 0}
          fallback={<p>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.NO_EVENTS")}</p>}
        >
          <div class="stage-detail__content--event">
            <Index each={props.stage().events}>
              {(event) => (
                <Card
                  topLeft={event().name}
                  subHeader={<StatusBadge status={event().status} />}
                  content={
                    <DisciplineIcon disciplineId={event().discipline.id} />
                  }
                  actions={
                    isEditing() ? (
                      <div class="stage-detail__content--event-actions">
                        <Show when={canDeleteEvent(event().status)}>
                          <ConfirmActionButton
                            text={event().name}
                            onConfirm={deleteEventClick(event)}
                          >
                            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                              {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DELETE")}
                            </AtomButton>
                          </ConfirmActionButton>
                        </Show>
                        <Show when={canEditEvent(props.stage().dateTo)}>
                          <AtomDialog
                            closeButtonText={i18n.t(
                              "MY.COMPETITIONS.STAGE_DETAIL.CLOSE_DIALOG",
                            )}
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
                            title={`${i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDIT")} ${event().name}`}
                            trigger={
                              <span>
                                {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDIT")}
                              </span>
                            }
                          />
                        </Show>
                      </div>
                    ) : (
                      <AtomButton
                        type={BUTTON_TYPES.ACCENT}
                        onClick={createNavigateToEvent(event)}
                      >
                        {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.INFO")}
                      </AtomButton>
                    )
                  }
                />
              )}
            </Index>
          </div>
        </Show>
      </section>
      <Show when={canEditStage(props.stage().status)}>
        <FloatingToggleCircle
          onClick={() => setIsEditing((current) => !current)}
          toggled={isEditing()}
          nonToggledText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDIT")}
          toggledText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.VIEW")}
          nonToggledIcon={pencilIcon}
          toggledIcon={eyeIcon}
        />
      </Show>
      <Show when={isEditing() && canDeleteStage(props.stage().status)}>
        <ConfirmActionButton
          text={props.stage().name}
          onConfirm={props.onDelete}
        >
          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
            {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DELETE_STAGE")}
          </AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
