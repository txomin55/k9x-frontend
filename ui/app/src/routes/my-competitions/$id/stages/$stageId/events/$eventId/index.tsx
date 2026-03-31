import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import {
  type Accessor,
  For,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import type {
  EventResponse,
  UpdateApiEvent,
} from "@/services/api/event_api_crud/eventApiCrud";
import { useApiEvent } from "@/services/api/event_api_crud/eventApiCrud";
import type { EventCompetitorsWeb } from "@/services/api/competition_crud/competitionCrudTypes";

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
  const { deleteApiEvent, getEvent, updateApiEvent } = useApiEvent();
  const event = getEvent(params().id, params().stageId, params().eventId);

  return (
    <div class="competition-event-detail">
      <Suspense fallback={<span>--Loading event detail</span>}>
        <Show when={event()} fallback={<p>--Event not found.</p>}>
          <CompetitionEventDetailContent
            event={() => event()!}
            onDelete={() => {
              deleteApiEvent(params().eventId, params().stageId, {
                competitionId: params().id,
              });
              void navigate({
                params: { id: params().id, stageId: params().stageId },
                to: "/my-competitions/$id/stages/$stageId",
              });
            }}
            onUpdate={(event) =>
              updateApiEvent(
                {
                  ...event,
                  stageId: params().stageId,
                },
                { competitionId: params().id },
              )
            }
          />
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionEventDetailContent(props: {
  event: Accessor<EventResponse>;
  onDelete: () => void;
  onUpdate: (event: UpdateApiEvent) => void;
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftEvent, setDraftEvent] = createSignal(props.event());
  const [lastQueuedDraftKey, setLastQueuedDraftKey] = createSignal<
    string | null
  >(null);

  const event = createMemo(() => props.event());

  createEffect(() => {
    const externalEvent = event();

    if (!externalEvent) return;
    if (isEditing()) return;

    setDraftEvent(externalEvent);
    setLastQueuedDraftKey(null);
  });

  createEffect(() => {
    if (!isEditing()) return;

    const externalEvent = event();

    if (!externalEvent) return;

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

  return (
    <div
      class="competition-event-detail__content"
      style={{
        display: "grid",
        gap: "1rem",
        "padding-bottom": "5rem",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "grid",
          gap: "0.5rem",
        }}
      >
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{draftEvent().name}</h1>
              <p>{`--Discipline: ${draftEvent().discipline || "--No discipline"}`}</p>
              <p>{`--Participants: ${draftEvent().competitors.length}`}</p>
              <p>{`--Status: ${draftEvent().status || "--No status"}`}</p>
            </>
          }
        >
          <label for="event-name">--Event title</label>
          <input
            id="event-name"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                name: event.currentTarget.value,
              }))
            }
            type="text"
            value={draftEvent().name}
          />
          <label for="event-discipline">--Discipline</label>
          <input
            id="event-discipline"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                discipline: event.currentTarget.value,
              }))
            }
            type="text"
            value={draftEvent().discipline}
          />
          <label for="event-status">--Status</label>
          <input
            id="event-status"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                status: event.currentTarget.value,
              }))
            }
            type="text"
            value={draftEvent().status}
          />
        </Show>
      </header>

      <section>
        <h2>--Configuration</h2>
        <Show
          when={isEditing()}
          fallback={
            <>
              <p>{`--Name: ${draftEvent().configuration.name || "--No name"}`}</p>
              <p>{`--Version: ${draftEvent().configuration.version}`}</p>
              <p>{`--Federation: ${draftEvent().configuration.federation || "--No federation"}`}</p>
            </>
          }
        >
          <label for="event-configuration-name">--Configuration name</label>
          <input
            id="event-configuration-name"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                configuration: {
                  ...current.configuration,
                  name: event.currentTarget.value,
                },
              }))
            }
            type="text"
            value={draftEvent().configuration.name}
          />
          <label for="event-configuration-version">--Version</label>
          <input
            id="event-configuration-version"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                configuration: {
                  ...current.configuration,
                  version: Number(event.currentTarget.value) || 0,
                },
              }))
            }
            type="number"
            value={String(draftEvent().configuration.version)}
          />
          <label for="event-configuration-federation">--Federation</label>
          <input
            id="event-configuration-federation"
            onInput={(event) =>
              setDraftEvent((current) => ({
                ...current,
                configuration: {
                  ...current.configuration,
                  federation: event.currentTarget.value,
                },
              }))
            }
            type="text"
            value={draftEvent().configuration.federation}
          />
        </Show>
      </section>

      <section>
        <h2>--Judges</h2>
        <Show
          when={draftEvent().judges.length > 0}
          fallback={<p>--No judges.</p>}
        >
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <For each={draftEvent().judges}>
              {(judge) => (
                <article style={cardStyle}>
                  <p>{`--Name: ${judge.name}`}</p>
                  <p>{`--Email: ${judge.collectorEmail}`}</p>
                </article>
              )}
            </For>
          </div>
        </Show>
      </section>

      <section>
        <h2>--Competitors</h2>
        <Show
          when={draftEvent().competitors.length > 0}
          fallback={<p>--No competitors.</p>}
        >
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <For each={draftEvent().competitors}>
              {(competitor, index) => (
                <article style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      "justify-content": "space-between",
                    }}
                  >
                    <strong>{competitor.name || "--No name"}</strong>
                    <Show when={isEditing()}>
                      <button
                        aria-label={`--Delete ${competitor.name || "competitor"}`}
                        onClick={() =>
                          setDraftEvent((current) => ({
                            ...current,
                            competitors: current.competitors.filter(
                              (_, competitorIndex) => competitorIndex !== index(),
                            ),
                          }))
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
                    </Show>
                  </div>
                  <Show
                    when={isEditing()}
                    fallback={
                      <>
                        <p>{`--Owner: ${competitor.owner}`}</p>
                        <p>{`--Identity: ${competitor.identity}`}</p>
                        <p>{`--Final score: ${competitor.finalScore}`}</p>
                      </>
                    }
                  >
                    <label for={`competitor-name-${competitor.id}`}>--Name</label>
                    <input
                      id={`competitor-name-${competitor.id}`}
                      onInput={(event) =>
                        updateCompetitorField(
                          index(),
                          "name",
                          event.currentTarget.value,
                          setDraftEvent,
                        )
                      }
                      type="text"
                      value={competitor.name}
                    />
                    <label for={`competitor-owner-${competitor.id}`}>--Owner</label>
                    <input
                      id={`competitor-owner-${competitor.id}`}
                      onInput={(event) =>
                        updateCompetitorField(
                          index(),
                          "owner",
                          event.currentTarget.value,
                          setDraftEvent,
                        )
                      }
                      type="text"
                      value={competitor.owner}
                    />
                    <label for={`competitor-identity-${competitor.id}`}>
                      --Identity
                    </label>
                    <input
                      id={`competitor-identity-${competitor.id}`}
                      onInput={(event) =>
                        updateCompetitorField(
                          index(),
                          "identity",
                          event.currentTarget.value,
                          setDraftEvent,
                        )
                      }
                      type="text"
                      value={competitor.identity}
                    />
                    <label for={`competitor-score-${competitor.id}`}>
                      --Final score
                    </label>
                    <input
                      id={`competitor-score-${competitor.id}`}
                      onInput={(event) =>
                        updateCompetitorField(
                          index(),
                          "finalScore",
                          Number(event.currentTarget.value) || 0,
                          setDraftEvent,
                        )
                      }
                      type="number"
                      value={String(competitor.finalScore)}
                    />
                  </Show>
                </article>
              )}
            </For>
          </div>
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
          aria-label="--Add competitor"
          onClick={() =>
            setDraftEvent((current) => ({
              ...current,
              competitors: [...current.competitors, createDefaultCompetitor()],
            }))
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
          --Delete event
        </button>
      </Show>
      <Show when={!isEditing()}>
        <button
          aria-label="--Edit event"
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

const cardStyle = {
  border: "1px solid rgba(0, 0, 0, 0.12)",
  "border-radius": "1rem",
  padding: "1rem",
} as const;

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
    competitors: event.competitors,
    configuration: event.configuration,
    discipline: event.discipline,
    name: event.name,
    status: event.status,
  });
}

function createDefaultCompetitor(): EventCompetitorsWeb {
  return {
    finalScore: 0,
    id: globalThis.crypto.randomUUID(),
    identity: "",
    name: "--Default competitor",
    owner: "",
    scores: [],
  };
}

function updateCompetitorField(
  competitorIndex: number,
  field: "name" | "owner" | "identity" | "finalScore",
  value: string | number,
  setDraftEvent: (
    setter: (current: EventResponse) => EventResponse,
  ) => void,
) {
  setDraftEvent((current) => ({
    ...current,
    competitors: current.competitors.map((entry, index) =>
      index === competitorIndex
        ? {
            ...entry,
            [field]: value,
          }
        : entry,
    ),
  }));
}
