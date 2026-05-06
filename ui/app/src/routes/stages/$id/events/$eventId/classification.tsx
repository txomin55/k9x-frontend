import { createFileRoute, useParams } from "@tanstack/solid-router";
import { useEventClassification } from "@/services/fetch-stages/fetchStages";
import { For, Show } from "solid-js";

export const Route = createFileRoute(
  "/stages/$id/events/$eventId/classification",
)({
  component: EventClassificationPage,
});

function EventClassificationPage() {
  const params = useParams({
    from: "/stages/$id/events/$eventId/classification",
  });
  const classificationQuery = useEventClassification(
    params().id,
    params().eventId,
    {
      refetchOnMount: false,
      gcTime: 5 * 60 * 1000,
    },
  );

  return (
    <div>
      <h2>Event classification</h2>
      <Show when={classificationQuery.data} fallback={<span>Loading classification...</span>}>
        {(classification) => (
          <Show when={classification().length > 0} fallback={<span>No classification data available.</span>}>
            <For each={classification()}>
              {(item) => (
                <article>
                  <h3>{item.dog.name}</h3>
                  <p>
                    Owner: {item.owner || "-"} | Team: {item.team || "-"} | Country:{" "}
                    {item.country || "-"}
                  </p>
                  <For each={item.exercises}>
                    {(exerciseEntry) => (
                      <section>
                        <h4>{exerciseEntry.exercise.name}</h4>
                        <For each={exerciseEntry.scores}>
                          {(score) => (
                            <p>
                              {score.judge.name}: {score.value}
                            </p>
                          )}
                        </For>
                      </section>
                    )}
                  </For>
                </article>
              )}
            </For>
          </Show>
        )}
      </Show>
    </div>
  );
}
