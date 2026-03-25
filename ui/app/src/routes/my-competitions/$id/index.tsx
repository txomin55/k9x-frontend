import { createFileRoute, useParams } from "@tanstack/solid-router";
import { createMemo, For, Show, Suspense } from "solid-js";
import { useCompetition } from "@/services/fetch_competition/fetchCompetitions";

export const Route = createFileRoute("/my-competitions/$id/")({
  component: CompetitionDetailPage,
});

function CompetitionDetailPage() {
  const params = useParams({ from: "/my-competitions/$id/" });
  const fetchedCompetition = useCompetition(params().id, {
    staleTime: 30 * 1000,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const competition = createMemo(() => fetchedCompetition.data);

  return (
    <div class="competition-detail">
      <Suspense fallback={<span>--Loading competition</span>}>
        <Show when={competition()} fallback={<p>--Competition not found.</p>}>
          {(competition) => (
            <div class="competition-detail__content">
              <div class="competition-detail__content--header">
                <h1>{competition().name}</h1>
                <span>{competition().status}</span>
              </div>
              <p>{competition().description}</p>
              <Show when={competition().location?.address}>
                <p>{competition().location?.address}</p>
              </Show>
              <div class="competition-detail__content--stages">
                <For each={competition().stages ?? []}>
                  {(stage) => (
                    <div class="competition-detail__content--stage">
                      <strong>{stage.name}</strong>
                      <p>
                        {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                      </p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
