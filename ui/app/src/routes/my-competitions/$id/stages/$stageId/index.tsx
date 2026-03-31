import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Index,
  onCleanup,
  Show,
  Suspense,
  untrack
} from "solid-js";
import {
  type CreateApiEvent,
  type EventResponse,
  type UpdateApiEvent,
  useApiEvent,
} from "@/services/api/event_api_crud/eventApiCrud";
import { type StageEditorModel, useApiStage } from "@/services/api/stage_api_crud/stageApiCrud";

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
  const [eventDrafts, setEventDrafts] = createSignal<Record<string, EventResponse>>(
    {},
  );
  const [queuedEventKeys, setQueuedEventKeys] = createSignal<
    Record<string, string>
  >({});

  const eventUpdateTimeouts = new Map<
    string,
    ReturnType<typeof globalThis.setTimeout>
  >();

  const draftKey = (stage: StageEditorModel) =>
    JSON.stringify({
      dateFrom: stage.dateFrom,
      dateTo: stage.dateTo,
      name: stage.name,
    });

  const visibleEvents = createMemo(() => {
    if (!isEditing()) return props.stage().events;

    const drafts = eventDrafts();

    return props.stage().events.map((event) => drafts[event.id] ?? event);
  });

  createEffect(() => {
    const externalStage = props.stage();

    if (isEditing()) return;

    setDraftStage(externalStage);
    setLastQueuedDraftKey(null);
  });

  createEffect(() => {
    const externalEvents = props.stage().events;
    const currentDrafts = untrack(eventDrafts);
    const currentQueuedEventKeys = untrack(queuedEventKeys);
    const nextDrafts: Record<string, EventResponse> = {};
    const nextQueuedEventKeys: Record<string, string> = {};

    for (const event of externalEvents) {
      const nextEventKey = getEventDraftKey(event);
      const queuedEventKey = currentQueuedEventKeys[event.id];

      if (
        isEditing() &&
        queuedEventKey &&
        queuedEventKey !== nextEventKey &&
        currentDrafts[event.id]
      ) {
        nextDrafts[event.id] = currentDrafts[event.id];
        nextQueuedEventKeys[event.id] = queuedEventKey;
        continue;
      }

      nextDrafts[event.id] = event;

      if (queuedEventKey && queuedEventKey !== nextEventKey) {
        nextQueuedEventKeys[event.id] = queuedEventKey;
      }
    }

    setEventDrafts(nextDrafts);
    setQueuedEventKeys(nextQueuedEventKeys);
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
    if (!isEditing()) return;

    const drafts = eventDrafts();
    const externalEvents = new Map(
      props.stage().events.map((event) => [event.id, event]),
    );
    const queuedKeys = queuedEventKeys();
    const timeoutIds: Array<ReturnType<typeof globalThis.setTimeout>> = [];

    for (const draftEvent of Object.values(drafts)) {
      const externalEvent = externalEvents.get(draftEvent.id);

      if (!externalEvent) continue;

      const nextEventKey = getEventDraftKey(draftEvent);
      const externalEventKey = getEventDraftKey(externalEvent);

      if (nextEventKey === externalEventKey) continue;
      if (queuedKeys[draftEvent.id] === nextEventKey) continue;

      const existingTimeoutId = eventUpdateTimeouts.get(draftEvent.id);

      if (existingTimeoutId) {
        globalThis.clearTimeout(existingTimeoutId);
      }

      const timeoutId = globalThis.setTimeout(() => {
        setQueuedEventKeys((current) => ({
          ...current,
          [draftEvent.id]: nextEventKey,
        }));
        props.onUpdateEvent(draftEvent);
      }, EDIT_DEBOUNCE_MS);

      eventUpdateTimeouts.set(draftEvent.id, timeoutId);
      timeoutIds.push(timeoutId);
    }

    onCleanup(() => {
      for (const timeoutId of timeoutIds) {
        globalThis.clearTimeout(timeoutId);
      }
    });
  });

  onCleanup(() => {
    for (const timeoutId of eventUpdateTimeouts.values()) {
      globalThis.clearTimeout(timeoutId);
    }
    eventUpdateTimeouts.clear();
  });

  const updateEventDraft = (
    eventId: string,
    updater: (current: EventResponse) => EventResponse,
  ) => {
    setEventDrafts((current) => {
      const currentEvent = current[eventId];

      if (!currentEvent) return current;

      return {
        ...current,
        [eventId]: updater(currentEvent),
      };
    });
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
        <h2>--Events</h2>
        <Show when={visibleEvents().length > 0} fallback={<p>--No events.</p>}>
          <Index each={visibleEvents()}>
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
                    <button
                      aria-label={`--Delete ${event().name}`}
                      onClick={() =>
                        props.onDeleteEvent(event().id)
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
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6v14H5V6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                  <label for={`stage-event-name-${event().id}`}>
                    --Event title
                  </label>
                  <input
                    id={`stage-event-name-${event().id}`}
                    onInput={(stageEvent) =>
                      updateEventDraft(event().id, (current) => ({
                        ...current,
                        name: stageEvent.currentTarget.value,
                      }))
                    }
                    type="text"
                    value={event().name}
                  />
                  <label for={`stage-event-status-${event().id}`}>--Status</label>
                  <input
                    id={`stage-event-status-${event().id}`}
                    onInput={(stageEvent) =>
                      updateEventDraft(event().id, (current) => ({
                        ...current,
                        status: stageEvent.currentTarget.value,
                      }))
                    }
                    type="text"
                    value={event().status}
                  />
                  <label for={`stage-event-discipline-${event().id}`}>
                    --Discipline
                  </label>
                  <input
                    id={`stage-event-discipline-${event().id}`}
                    onInput={(stageEvent) =>
                      updateEventDraft(event().id, (current) => ({
                        ...current,
                        discipline: stageEvent.currentTarget.value,
                      }))
                    }
                    type="text"
                    value={event().discipline}
                  />
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
        <button
          aria-label="--Add event"
          onClick={() =>
            props.onCreateEvent(props.createDefaultEvent(draftStage().id))
          }
          style={{
            ...floatingActionButtonStyle,
            bottom: "5.75rem",
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
            <path d="M12 5v14" />
            <path d="M5 12h14" />
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

function getEventDraftKey(event: EventResponse) {
  return JSON.stringify({
    discipline: event.discipline,
    name: event.name,
    status: event.status,
  });
}

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
