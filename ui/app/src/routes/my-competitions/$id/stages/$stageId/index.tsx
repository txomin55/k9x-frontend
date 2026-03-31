import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  Index,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import {
  type CreateApiEvent,
  type EventResponse,
  type UpdateApiEvent,
  useApiEvent
} from "@/services/api/event_api_crud/eventApiCrud";
import { type StageEditorModel, useApiStage } from "@/services/api/stage_api_crud/stageApiCrud";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";

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
      params: { id: params().id, stageId: draftStage.id ?? "" },
      replace: true,
      to: "/my-competitions/$id/stages/$stageId",
    });
  });

  const stage = getStage(params().id, params().stageId);

  return (
    <div class="competition-stage-detail">
      <Suspense fallback={<span>--Loading stage detail</span>}>
        <Show
          when={params().stageId !== "new"}
          fallback={<span>--Creating stage</span>}
        >
          <Show when={stage()} fallback={<p>--Stage not found.</p>}>
            <CompetitionStageDetailContent
              createDefaultEvent={createDefaultApiEvent}
              onCreateEvent={(event) =>
                createApiEvent(
                  {
                    ...event,
                    stageId: params().stageId,
                  },
                  { competitionId: params().id },
                )
              }
              onDelete={() => {
                deleteApiStage(params().stageId, params().id);
                void navigate({
                  params: { id: params().id },
                  to: "/my-competitions/$id",
                });
              }}
              onDeleteEvent={(eventId) =>
                deleteApiEvent(eventId, params().stageId, {
                  competitionId: params().id,
                })
              }
              onUpdate={updateApiStage}
              onUpdateEvent={(event) =>
                updateApiEvent(
                  {
                    ...event,
                    stageId: params().stageId,
                  },
                  { competitionId: params().id },
                )
              }
              stage={() => stage()!}
            />
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionStageDetailContent(props: {
  createDefaultEvent: (stageId: string) => CreateApiEvent;
  onCreateEvent: (event: CreateApiEvent) => void;
  onDelete: () => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdate: (stage: StageEditorModel) => void;
  onUpdateEvent: (event: UpdateApiEvent) => void;
  stage: Accessor<StageEditorModel>;
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftStage, setDraftStage] = createSignal(props.stage());
  const [lastQueuedDraftKey, setLastQueuedDraftKey] = createSignal<
    string | null
  >(null);
  const [editingEventId, setEditingEventId] = createSignal<string | null>(null);
  const [eventDialogDraft, setEventDialogDraft] = createSignal<EventResponse | null>(
    null,
  );

  const draftKey = (stage: StageEditorModel) =>
    JSON.stringify({
      dateFrom: stage.dateFrom,
      dateTo: stage.dateTo,
      name: stage.name,
    });

  createEffect(() => {
    const externalStage = props.stage();

    if (isEditing()) return;

    setDraftStage(externalStage);
    setLastQueuedDraftKey(null);
  });

  createEffect(() => {
    if (!isEditing()) return;

    const nextStage = draftStage();
    const nextDraftKey = draftKey(nextStage);
    const currentStageKey = draftKey(props.stage());
    const hasChanges = nextDraftKey !== currentStageKey;

    if (!hasChanges) return;
    if (lastQueuedDraftKey() === nextDraftKey) return;

    const timeoutId = globalThis.setTimeout(() => {
      setLastQueuedDraftKey(nextDraftKey);
      props.onUpdate(nextStage);
    }, EDIT_DEBOUNCE_MS);

    onCleanup(() => globalThis.clearTimeout(timeoutId));
  });

  createEffect(() => {
    if (isEditing()) return;

    setEditingEventId(null);
    setEventDialogDraft(null);
  });

  const openEventEditor = (event: EventResponse) => {
    setEditingEventId(event.id);
    setEventDialogDraft(event);
  };

  const closeEventEditor = () => {
    setEditingEventId(null);
    setEventDialogDraft(null);
  };

  const saveEventEditor = () => {
    const draft = eventDialogDraft();

    if (!draft) return;

    props.onUpdateEvent(draft);
    closeEventEditor();
  };

  return (
    <div
      class="competition-stage-detail__content"
      style={{
        display: "grid",
        gap: "1.25rem",
        "padding-bottom": "5rem",
        position: "relative",
      }}
    >
      <header>
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{draftStage().name}</h1>
              <p>--Competition ID: {draftStage().competitionId}</p>
              <p>{`${formatDateLabel(toDateInputValue(draftStage().dateFrom))} - ${formatDateLabel(toDateInputValue(draftStage().dateTo))}`}</p>
            </>
          }
        >
          <div>
            <p>--Editing mode active.</p>
            <label for="stage-title">--Title</label>
            <p>txomin {draftStage().name}</p>
            <input
              id="stage-title"
              type="text"
              value={draftStage().name}
              onInput={(event) =>
                setDraftStage((current) => ({
                  ...current,
                  name: event.currentTarget.value,
                }))
              }
            />
            <label for="stage-date-from">--Date from</label>
            <input
              id="stage-date-from"
              type="date"
              value={toDateInputValue(draftStage().dateFrom)}
              onInput={(event) =>
                setDraftStage((current) => ({
                  ...current,
                  dateFrom: parseDateInputValue(
                    event.currentTarget.value,
                    current.dateFrom,
                  ),
                }))
              }
            />
            <label for="stage-date-to">--Date to</label>
            <input
              id="stage-date-to"
              type="date"
              value={toDateInputValue(draftStage().dateTo)}
              onInput={(event) =>
                setDraftStage((current) => ({
                  ...current,
                  dateTo: parseDateInputValue(
                    event.currentTarget.value,
                    current.dateTo,
                  ),
                }))
              }
            />
          </div>
        </Show>
      </header>

      <section>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            gap: "1rem",
          }}
        >
          <h2>--Events</h2>
          <Show when={isEditing()}>
            <button
              aria-label="--Add event"
              onClick={() =>
                props.onCreateEvent(props.createDefaultEvent(draftStage().id))
              }
              style={iconButtonStyle}
              type="button"
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </Show>
        </div>
        <Show when={props.stage().events.length > 0} fallback={<p>--No events.</p>}>
          <Index each={props.stage().events}>
            {(event) => (
              <Show
                when={isEditing()}
                fallback={
                  <Link
                    class="competition-stage-detail__event"
                    params={{
                      eventId: event().id,
                      id: draftStage().competitionId,
                      stageId: draftStage().id,
                    }}
                    style={{
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      "border-radius": "1rem",
                      color: "inherit",
                      display: "grid",
                      gap: "0.5rem",
                      padding: "1rem",
                      "text-decoration": "none",
                    }}
                    to="/my-competitions/$id/stages/$stageId/events/$eventId"
                  >
                    <strong>{event().name || "--No name"}</strong>
                    <p>{`--Discipline: ${event().discipline || "--No discipline"}`}</p>
                    <p>{`--Participants: ${event().competitors.length}`}</p>
                  </Link>
                }
              >
                <article
                  class="competition-stage-detail__event"
                  style={{
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    "border-radius": "1rem",
                    display: "grid",
                    gap: "0.75rem",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      "justify-content": "space-between",
                    }}
                  >
                    <h3>{event().name}</h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                      }}
                    >
                      <AtomDialog
                        closeButtonText="Close dialog"
                        content={
                          <Show when={eventDialogDraft()}>
                            {(draft) => (
                              <div
                                style={{
                                  display: "grid",
                                  gap: "0.75rem",
                                }}
                              >
                                <label for={`event-dialog-name-${draft().id}`}>
                                  --Event title
                                </label>
                                <input
                                  id={`event-dialog-name-${draft().id}`}
                                  onInput={(stageEvent) =>
                                    setEventDialogDraft((current) =>
                                      current
                                        ? {
                                            ...current,
                                            name: stageEvent.currentTarget.value,
                                          }
                                        : current,
                                    )
                                  }
                                  type="text"
                                  value={draft().name}
                                />
                                <label for={`event-dialog-status-${draft().id}`}>
                                  --Status
                                </label>
                                <input
                                  id={`event-dialog-status-${draft().id}`}
                                  onInput={(stageEvent) =>
                                    setEventDialogDraft((current) =>
                                      current
                                        ? {
                                            ...current,
                                            status: stageEvent.currentTarget.value,
                                          }
                                        : current,
                                    )
                                  }
                                  type="text"
                                  value={draft().status}
                                />
                                <label for={`event-dialog-discipline-${draft().id}`}>
                                  --Discipline
                                </label>
                                <input
                                  id={`event-dialog-discipline-${draft().id}`}
                                  onInput={(stageEvent) =>
                                    setEventDialogDraft((current) =>
                                      current
                                        ? {
                                            ...current,
                                            discipline: stageEvent.currentTarget.value,
                                          }
                                        : current,
                                    )
                                  }
                                  type="text"
                                  value={draft().discipline}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0.75rem",
                                    "justify-content": "flex-end",
                                  }}
                                >
                                  <AtomButton onClick={closeEventEditor}>
                                    --Cancel
                                  </AtomButton>
                                  <AtomButton onClick={saveEventEditor}>
                                    --Save
                                  </AtomButton>
                                </div>
                              </div>
                            )}
                          </Show>
                        }
                        modal
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
                        trigger={
                          <span style={iconButtonStyle}>
                            <svg
                              aria-hidden="true"
                              fill="none"
                              height="16"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                              width="16"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            <span style={visuallyHiddenStyle}>
                              {`--Edit ${event().name || "event"}`}
                            </span>
                          </span>
                        }
                      />
                      <button
                        aria-label={`--Delete ${event().name}`}
                        onClick={() => {
                          if (editingEventId() === event().id) {
                            closeEventEditor();
                          }

                          props.onDeleteEvent(event().id);
                        }}
                        style={iconButtonStyle}
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          fill="none"
                          height="16"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          viewBox="0 0 24 24"
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6v14H5V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p>{`--Status: ${event().status || "--No status"}`}</p>
                  <p>{`--Discipline: ${event().discipline || "--No discipline"}`}</p>
                  <p>{`--Participants: ${event().competitors.length}`}</p>
                </article>
              </Show>
            )}
          </Index>
        </Show>
      </section>
      <Show when={isEditing()}>
        <button
          aria-label="--Close edit"
          onClick={() => setIsEditing(false)}
          style={{
            ...floatingActionButtonStyle,
            bottom: "9.75rem",
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <button onClick={props.onDelete} type="button">
          --Delete stage
        </button>
      </Show>
      <Show when={!isEditing()}>
        <button
          aria-label="--Edit stage"
          onClick={() => setIsEditing(true)}
          style={{
            ...floatingActionButtonStyle,
            bottom: "1.75rem",
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </Show>
    </div>
  );
}

const iconButtonStyle = {
  "align-items": "center",
  background: "white",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  "border-radius": "999px",
  cursor: "pointer",
  display: "inline-flex",
  height: "2.5rem",
  "justify-content": "center",
  width: "2.5rem",
} as const;

const floatingActionButtonStyle = {
  ...iconButtonStyle,
  "box-shadow": "0 0.75rem 1.75rem rgba(0, 0, 0, 0.15)",
  height: "3.5rem",
  position: "fixed",
  right: "1.5rem",
  width: "3.5rem",
  "z-index": "10",
} as const;

const visuallyHiddenStyle = {
  border: "0",
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
} as const;

function toDateInputValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function formatDateLabel(value: string) {
  return value ? new Date(value).toDateString() : "";
}

function parseDateInputValue(value: string, fallback: number) {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00`).getTime();
}
