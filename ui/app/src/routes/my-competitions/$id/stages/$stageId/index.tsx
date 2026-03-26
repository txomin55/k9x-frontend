import { createFileRoute, useParams } from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import {
  type ApiStage,
  useApiStage,
} from "@/services/api/stage_api_crud/stageApiCrud";

const EDIT_DEBOUNCE_MS = 400;

export const Route = createFileRoute("/my-competitions/$id/stages/$stageId/")({
  component: CompetitionStageDetailPage,
});

function CompetitionStageDetailPage() {
  const params = useParams({ from: "/my-competitions/$id/stages/$stageId/" });
  const { updateApiStage, getStage } = useApiStage();

  const stage = getStage(params().id, params().stageId);

  return (
    <div class="competition-stage-detail">
      <Suspense fallback={<span>--Loading stage detail</span>}>
        <Show when={stage()} fallback={<p>--Stage not found.</p>}>
          {(stageData) => (
            <CompetitionStageDetailContent
              onUpdate={updateApiStage}
              stage={stageData}
            />
          )}
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionStageDetailContent(props: {
  onUpdate: (stage: ApiStage) => void;
  stage: Accessor<ApiStage>;
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [draftStage, setDraftStage] = createSignal(props.stage());
  const [lastQueuedDraftKey, setLastQueuedDraftKey] = createSignal<
    string | null
  >(null);

  const draftKey = (stage: ApiStage) =>
    JSON.stringify({
      dateFrom: stage.dateFrom,
      dateTo: stage.dateTo,
      name: stage.name,
    });

  createEffect(() => {
    const externalStage = props.stage();
    const externalStageKey = draftKey(externalStage);

    if (isEditing() && lastQueuedDraftKey() !== externalStageKey) {
      return;
    }

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

  return (
    <div class="competition-stage-detail__content">
      <header>
        <button
          type="button"
          aria-label="--Edit stage"
          onClick={() => setIsEditing((current) => !current)}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{draftStage().name}</h1>
              <p>--Competition ID: {draftStage().competitionId}</p>
              <p>--Discipline: {draftStage().discipline}</p>
              <p>--Federation: {draftStage().federation}</p>
              <p>{`${formatDateLabel(toDateInputValue(draftStage().dateFrom))} - ${formatDateLabel(toDateInputValue(draftStage().dateTo))}`}</p>
            </>
          }
        >
          <div>
            <p>--Editing mode active.</p>
            <label for="stage-title">--Title</label>
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
        <Show
          when={draftStage().events.length > 0}
          fallback={<p>--No events.</p>}
        >
          <For each={draftStage().events}>
            {(event) => (
              <article class="competition-stage-detail__event">
                <h3>{event.name}</h3>
                <p>--Status: {event.status}</p>
                <p>--Discipline: {event.discipline}</p>

                <section>
                  <h4>--Configuration</h4>
                  <p>--Name: {event.configuration.name}</p>
                  <p>--Version: {event.configuration.version}</p>
                  <p>--Federation: {event.configuration.federation}</p>
                </section>

                <section>
                  <h4>--Judges</h4>
                  <Show
                    when={event.judges.length > 0}
                    fallback={<p>--No judges.</p>}
                  >
                    <For each={event.judges}>
                      {(judge) => (
                        <div class="competition-stage-detail__judge">
                          <p>--Name: {judge.name}</p>
                          <p>--Email: {judge.collectorEmail}</p>
                        </div>
                      )}
                    </For>
                  </Show>
                </section>

                <section>
                  <h4>--Exercises</h4>
                  <Show
                    when={event.exercises.length > 0}
                    fallback={<p>--No exercises.</p>}
                  >
                    <For each={event.exercises}>
                      {(exercise) => (
                        <div class="competition-stage-detail__exercise">
                          <p>--Order: {exercise.order}</p>
                          <p>--Text: {exercise.text}</p>
                        </div>
                      )}
                    </For>
                  </Show>
                </section>

                <section>
                  <h4>--Competitors</h4>
                  <Show
                    when={event.competitors.length > 0}
                    fallback={<p>--No competitors.</p>}
                  >
                    <For each={event.competitors}>
                      {(competitor) => (
                        <div class="competition-stage-detail__competitor">
                          <p>--Name: {competitor.name}</p>
                          <p>--Owner: {competitor.owner}</p>
                          <p>--Identity: {competitor.identity}</p>
                          <p>--Final score: {competitor.finalScore}</p>

                          <section>
                            <h5>--Scores</h5>
                            <Show
                              when={competitor.scores.length > 0}
                              fallback={<p>--No scores.</p>}
                            >
                              <For each={competitor.scores}>
                                {(score) => (
                                  <div class="competition-stage-detail__score">
                                    <p>--Exercise ID: {score.exerciseId}</p>
                                    <p>--Score: {score.score}</p>
                                  </div>
                                )}
                              </For>
                            </Show>
                          </section>
                        </div>
                      )}
                    </For>
                  </Show>
                </section>
              </article>
            )}
          </For>
        </Show>
      </section>
    </div>
  );
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
