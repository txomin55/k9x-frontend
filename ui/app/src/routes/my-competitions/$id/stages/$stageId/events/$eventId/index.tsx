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
  Index,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import type {
  EventResponse,
  UpdateApiEvent,
} from "@/services/api/event_api_crud/eventApiCrud";
import { useApiEvent } from "@/services/api/event_api_crud/eventApiCrud";
import type {
  EventCompetitorsWeb,
  EventExercisesWeb,
  StageJudgesWeb,
} from "@/services/api/competition_crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
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
  const [editingCompetitorIndex, setEditingCompetitorIndex] = createSignal<
    number | null
  >(null);
  const [competitorDialogDraft, setCompetitorDialogDraft] =
    createSignal<EventCompetitorsWeb | null>(null);
  const [editingJudgeIndex, setEditingJudgeIndex] = createSignal<number | null>(
    null,
  );
  const [judgeDialogDraft, setJudgeDialogDraft] =
    createSignal<StageJudgesWeb | null>(null);
  const [editingExerciseIndex, setEditingExerciseIndex] = createSignal<
    number | null
  >(null);
  const [exerciseDialogDraft, setExerciseDialogDraft] =
    createSignal<EventExercisesWeb | null>(null);

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

  createEffect(() => {
    if (isEditing()) return;

    setEditingCompetitorIndex(null);
    setCompetitorDialogDraft(null);
    setEditingJudgeIndex(null);
    setJudgeDialogDraft(null);
    setEditingExerciseIndex(null);
    setExerciseDialogDraft(null);
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
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            gap: "1rem",
          }}
        >
          <h2>--Judges</h2>
          <Show when={isEditing()}>
            <button
              aria-label="--Add judge"
              onClick={() =>
                setDraftEvent((current) => ({
                  ...current,
                  judges: [...current.judges, createDefaultJudge()],
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </Show>
        </div>
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
            <Index each={draftEvent().judges}>
              {(judge, index) => (
                <article style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      "justify-content": "space-between",
                    }}
                  >
                    <strong>{judge().name || "--No name"}</strong>
                    <Show when={isEditing()}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                        }}
                      >
                        <AtomDialog
                          closeButtonText="Close dialog"
                          content={
                            <Show when={judgeDialogDraft()}>
                              {(draft) => (
                                <div
                                  style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                  }}
                                >
                                  <label for={`judge-dialog-name-${index}`}>
                                    --Name
                                  </label>
                                  <input
                                    id={`judge-dialog-name-${index}`}
                                    onInput={(event) =>
                                      setJudgeDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              name: event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="text"
                                    value={draft().name}
                                  />
                                  <label for={`judge-dialog-email-${index}`}>
                                    --Email
                                  </label>
                                  <input
                                    id={`judge-dialog-email-${index}`}
                                    onInput={(event) =>
                                      setJudgeDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              collectorEmail:
                                                event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="email"
                                    value={draft().collectorEmail}
                                  />
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.75rem",
                                      "justify-content": "flex-end",
                                    }}
                                  >
                                    <AtomButton onClick={closeJudgeEditor}>
                                      --Cancel
                                    </AtomButton>
                                    <AtomButton
                                      onClick={() => {
                                        const draft = judgeDialogDraft();

                                        if (!draft) return;

                                        setDraftEvent((current) => ({
                                          ...current,
                                          judges: current.judges.map(
                                            (entry, judgeIndex) =>
                                              judgeIndex === index
                                                ? draft
                                                : entry,
                                          ),
                                        }));
                                        closeJudgeEditor();
                                      }}
                                    >
                                      --Save
                                    </AtomButton>
                                  </div>
                                </div>
                              )}
                            </Show>
                          }
                          onOpenChange={(isOpen) => {
                            if (isOpen) {
                              setEditingJudgeIndex(index);
                              setJudgeDialogDraft(judge());
                              return;
                            }

                            if (editingJudgeIndex() === index) {
                              closeJudgeEditor();
                            }
                          }}
                          open={editingJudgeIndex() === index}
                          title={`--Edit ${judge().name || "judge"}`}
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
                                {`--Edit ${judge().name || "judge"}`}
                              </span>
                            </span>
                          }
                        />
                        <button
                          aria-label={`--Delete ${judge().name || "judge"}`}
                          onClick={() => {
                            if (editingJudgeIndex() === index) {
                              closeJudgeEditor();
                            }

                            setDraftEvent((current) => ({
                              ...current,
                              judges: current.judges.filter(
                                (_, judgeIndex) => judgeIndex !== index,
                              ),
                            }));
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
                    </Show>
                  </div>
                  <p>{`--Email: ${judge().collectorEmail || "--No email"}`}</p>
                </article>
              )}
            </Index>
          </div>
        </Show>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            gap: "1rem",
          }}
        >
          <h2>--Exercises</h2>
          <Show when={isEditing()}>
            <button
              aria-label="--Add exercise"
              onClick={() =>
                setDraftEvent((current) => ({
                  ...current,
                  exercises: [...current.exercises, createDefaultExercise()],
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </Show>
        </div>
        <Show
          when={draftEvent().exercises.length > 0}
          fallback={<p>--No exercises.</p>}
        >
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
            }}
          >
            <Index each={draftEvent().exercises}>
              {(exercise, index) => (
                <article style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      "justify-content": "space-between",
                    }}
                  >
                    <strong>{`--#${exercise().order}`}</strong>
                    <Show when={isEditing()}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                        }}
                      >
                        <AtomDialog
                          closeButtonText="Close dialog"
                          content={
                            <Show when={exerciseDialogDraft()}>
                              {(draft) => (
                                <div
                                  style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                  }}
                                >
                                  <label
                                    for={`exercise-dialog-order-${draft().id}`}
                                  >
                                    --Order
                                  </label>
                                  <input
                                    id={`exercise-dialog-order-${draft().id}`}
                                    onInput={(event) =>
                                      setExerciseDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              order:
                                                Number(
                                                  event.currentTarget.value,
                                                ) || 0,
                                            }
                                          : current,
                                      )
                                    }
                                    type="number"
                                    value={String(draft().order)}
                                  />
                                  <label
                                    for={`exercise-dialog-text-${draft().id}`}
                                  >
                                    --Text
                                  </label>
                                  <input
                                    id={`exercise-dialog-text-${draft().id}`}
                                    onInput={(event) =>
                                      setExerciseDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              text: event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="text"
                                    value={draft().text}
                                  />
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.75rem",
                                      "justify-content": "flex-end",
                                    }}
                                  >
                                    <AtomButton onClick={closeExerciseEditor}>
                                      --Cancel
                                    </AtomButton>
                                    <AtomButton
                                      onClick={() => {
                                        const draft = exerciseDialogDraft();

                                        if (!draft) return;

                                        setDraftEvent((current) => ({
                                          ...current,
                                          exercises: current.exercises.map(
                                            (entry, exerciseIndex) =>
                                              exerciseIndex === index
                                                ? draft
                                                : entry,
                                          ),
                                        }));
                                        closeExerciseEditor();
                                      }}
                                    >
                                      --Save
                                    </AtomButton>
                                  </div>
                                </div>
                              )}
                            </Show>
                          }
                          onOpenChange={(isOpen) => {
                            if (isOpen) {
                              setEditingExerciseIndex(index);
                              setExerciseDialogDraft(exercise());
                              return;
                            }

                            if (editingExerciseIndex() === index) {
                              closeExerciseEditor();
                            }
                          }}
                          open={editingExerciseIndex() === index}
                          title={`--Edit exercise ${exercise().order}`}
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
                                {`--Edit exercise ${exercise().order}`}
                              </span>
                            </span>
                          }
                        />
                        <button
                          aria-label={`--Delete exercise ${exercise().order}`}
                          onClick={() => {
                            if (editingExerciseIndex() === index) {
                              closeExerciseEditor();
                            }

                            setDraftEvent((current) => ({
                              ...current,
                              exercises: current.exercises.filter(
                                (_, exerciseIndex) => exerciseIndex !== index,
                              ),
                            }));
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
                    </Show>
                  </div>
                  <p>{exercise().text || "--No text"}</p>
                </article>
              )}
            </Index>
          </div>
        </Show>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            gap: "1rem",
          }}
        >
          <h2>--Competitors</h2>
          <Show when={isEditing()}>
            <button
              aria-label="--Add competitor"
              onClick={() =>
                setDraftEvent((current) => ({
                  ...current,
                  competitors: [
                    ...current.competitors,
                    createDefaultCompetitor(),
                  ],
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </Show>
        </div>
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
            <Index each={draftEvent().competitors}>
              {(competitor, index) => (
                <article style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      "justify-content": "space-between",
                    }}
                  >
                    <strong>{competitor().name || "--No name"}</strong>
                    <Show when={isEditing()}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                        }}
                      >
                        <AtomDialog
                          closeButtonText="Close dialog"
                          content={
                            <Show when={competitorDialogDraft()}>
                              {(draft) => (
                                <div
                                  style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                  }}
                                >
                                  <label
                                    for={`competitor-dialog-name-${draft().id}`}
                                  >
                                    --Name
                                  </label>
                                  <input
                                    id={`competitor-dialog-name-${draft().id}`}
                                    onInput={(event) =>
                                      setCompetitorDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              name: event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="text"
                                    value={draft().name}
                                  />
                                  <label
                                    for={`competitor-dialog-owner-${draft().id}`}
                                  >
                                    --Owner
                                  </label>
                                  <input
                                    id={`competitor-dialog-owner-${draft().id}`}
                                    onInput={(event) =>
                                      setCompetitorDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              owner: event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="text"
                                    value={draft().owner}
                                  />
                                  <label
                                    for={`competitor-dialog-identity-${draft().id}`}
                                  >
                                    --Identity
                                  </label>
                                  <input
                                    id={`competitor-dialog-identity-${draft().id}`}
                                    onInput={(event) =>
                                      setCompetitorDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              identity:
                                                event.currentTarget.value,
                                            }
                                          : current,
                                      )
                                    }
                                    type="text"
                                    value={draft().identity}
                                  />
                                  <label
                                    for={`competitor-dialog-score-${draft().id}`}
                                  >
                                    --Final score
                                  </label>
                                  <input
                                    id={`competitor-dialog-score-${draft().id}`}
                                    onInput={(event) =>
                                      setCompetitorDialogDraft((current) =>
                                        current
                                          ? {
                                              ...current,
                                              finalScore:
                                                Number(
                                                  event.currentTarget.value,
                                                ) || 0,
                                            }
                                          : current,
                                      )
                                    }
                                    type="number"
                                    value={String(draft().finalScore)}
                                  />
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.75rem",
                                      "justify-content": "flex-end",
                                    }}
                                  >
                                    <AtomButton onClick={closeCompetitorEditor}>
                                      --Cancel
                                    </AtomButton>
                                    <AtomButton
                                      onClick={() => {
                                        const draft = competitorDialogDraft();

                                        if (!draft) return;

                                        setDraftEvent((current) => ({
                                          ...current,
                                          competitors: current.competitors.map(
                                            (entry, competitorIndex) =>
                                              competitorIndex === index
                                                ? draft
                                                : entry,
                                          ),
                                        }));
                                        closeCompetitorEditor();
                                      }}
                                    >
                                      --Save
                                    </AtomButton>
                                  </div>
                                </div>
                              )}
                            </Show>
                          }
                          onOpenChange={(isOpen) => {
                            if (isOpen) {
                              setEditingCompetitorIndex(index);
                              setCompetitorDialogDraft(competitor());
                              return;
                            }

                            if (editingCompetitorIndex() === index) {
                              closeCompetitorEditor();
                            }
                          }}
                          open={editingCompetitorIndex() === index}
                          title={`--Edit ${competitor().name || "competitor"}`}
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
                                {`--Edit ${competitor().name || "competitor"}`}
                              </span>
                            </span>
                          }
                        />
                        <button
                          aria-label={`--Delete ${competitor().name || "competitor"}`}
                          onClick={() => {
                            if (editingCompetitorIndex() === index) {
                              closeCompetitorEditor();
                            }

                            setDraftEvent((current) => ({
                              ...current,
                              competitors: current.competitors.filter(
                                (_, competitorIndex) =>
                                  competitorIndex !== index,
                              ),
                            }));
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
                    </Show>
                  </div>
                  <p>{`--Owner: ${competitor().owner}`}</p>
                  <p>{`--Identity: ${competitor().identity}`}</p>
                  <p>{`--Final score: ${competitor().finalScore}`}</p>
                </article>
              )}
            </Index>
          </div>
        </Show>
      </section>

      <Show when={isEditing()}>
        <div
          style={{
            position: "fixed",
            right: "1.5rem",
            bottom: "9.75rem",
            "z-index": "10",
          }}
        >
          <CircleButton onClick={() => setIsEditing(false)}>
            <>
              <span style={visuallyHiddenStyle}>--Close edit</span>
              <span aria-hidden="true">X</span>
            </>
          </CircleButton>
        </div>
        <button onClick={props.onDelete} type="button">
          --Delete event
        </button>
      </Show>
      <Show when={!isEditing()}>
        <div
          style={{
            position: "fixed",
            right: "1.5rem",
            bottom: "1.75rem",
            "z-index": "10",
          }}
        >
          <CircleButton onClick={() => setIsEditing(true)}>
            <>
              <span style={visuallyHiddenStyle}>--Edit event</span>
              <span aria-hidden="true">--edit</span>
            </>
          </CircleButton>
        </div>
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

function createDefaultJudge(): StageJudgesWeb {
  return {
    collectorEmail: "",
    name: "--Default judge",
  };
}

function createDefaultExercise(): EventExercisesWeb {
  return {
    id: globalThis.crypto.randomUUID(),
    order: 0,
    text: "--Default exercise",
  };
}
