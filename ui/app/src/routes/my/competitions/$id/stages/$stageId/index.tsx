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
  Show,
  Suspense,
} from "solid-js";
import { useApiEvent } from "@/services/secured/event-crud/eventCrud";
import { useApiStage } from "@/services/secured/stage-crud/stageCrud";
import type {
  CreateEventRequest,
  EventDetail,
  EventEditorDraft,
  UpdateEventRequest,
} from "@/services/secured/event-crud/eventCrud.types";
import { toEventEditorDraft } from "@/utils/event";
import {
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
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import Card from "@lib/components/molecules/card/Card";
import { getEventDisciplineLabel } from "@/components/common/event-discipline-field/EventDisciplineField";
import EventEditorForm from "@/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventEditorForm";
import { EMPTY_FEDERATION_CONFIGURATION } from "@/services/secured/configurations/configurations";
import "./styles.css";
import {
  StageEditorModel,
  UpdateStageRequest,
} from "@/services/secured/stage-crud/stageCrud.types";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/competitions/$id/stages/$stageId/")({
  component: CompetitionStageDetailPage,
});

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
      <Suspense fallback={<span>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.LOADING_STAGE_DETAIL")}</span>}>
        <Show when={props.stage()} fallback={<p>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.STAGE_NOT_FOUND")}</p>}>
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
        federation: EMPTY_FEDERATION_CONFIGURATION,
        id: globalThis.crypto.randomUUID(),
        name: "",
      },
      discipline: {
        id: draft.disciplineId,
        name: "",
      },
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
          <p>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDITING_MODE_ACTIVE")}</p>
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.TITLE")}
            value={title()}
            onBlur={commitStageEdits}
            onChange={setTitle}
          />
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
        </Show>
      </header>

      <section class="stage-detail__content">
        <div class="stage-detail__content--events">
          <h2>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EVENTS")}</h2>
          <Show when={isEditing()}>
            <AtomDialog
              closeButtonText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.CLOSE_DIALOG")}
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
                  subHeader={<p>{`${i18n.t("MY.COMPETITIONS.STAGE_DETAIL.STATUS")}: ${event().status}`}</p>}
                  content={
                    <div class="aaaaa">
                      <p>{`${i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DISCIPLINE")}: ${getEventDisciplineLabel(event().discipline.id)}`}</p>
                      <p>{`${i18n.t("MY.COMPETITIONS.STAGE_DETAIL.PARTICIPANTS")}: ${event().competitors.length}`}</p>
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
                            {i18n.t("MY.COMPETITIONS.STAGE_DETAIL.DELETE")}
                          </AtomButton>
                        </ConfirmActionButton>
                        <AtomDialog
                          closeButtonText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.CLOSE_DIALOG")}
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
                          trigger={<span>{i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDIT")}</span>}
                        />
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
      <FloatingToggleCircle
        onClick={() => setIsEditing((current) => !current)}
        toggled={isEditing()}
        nonToggledText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.EDIT")}
        toggledText={i18n.t("MY.COMPETITIONS.STAGE_DETAIL.VIEW")}
      />
      <Show when={isEditing()}>
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
