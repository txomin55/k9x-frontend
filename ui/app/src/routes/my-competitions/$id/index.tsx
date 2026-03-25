import { createFileRoute, useParams } from "@tanstack/solid-router";
import { createMemo, Match, Show, Suspense, Switch } from "solid-js";
import { useCompetitions } from "@/services/fetch_competitions/fetchCompetitions";

export const Route = createFileRoute("/my-competitions/$id/")({
  component: CompetitionDetailPage,
});

function CompetitionDetailPage() {
  const params = useParams({ from: "/my-competitions/$id/" });
  const fetchedCompetitions = useCompetitions({
    staleTime: 30 * 1000,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const competition = createMemo(() =>
    fetchedCompetitions.data?.find(
      (currentCompetition) => currentCompetition.id === params().id,
    ),
  );

  return (
    <div class="competition-detail">
      <Suspense fallback={<span>--Loading competition</span>}>
        <Switch>
          <Match when={competition()}>
            <div class="competition-detail__header">
              <h1>{competition()!.name}</h1>
              <span>{competition()!.status}</span>
            </div>
            <p>{competition()!.description}</p>
            <Show when={competition()!.location?.address}>
              <p>{competition()!.location?.address}</p>
            </Show>
            <div class="competition-detail__stages">
              {competition()!.stages.map((stage) => (
                <div class="competition-detail__stage">
                  <strong>{stage.name}</strong>
                  <p>
                    {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </Match>
          <Match when={!competition()}>
            <p>--Competition not found.</p>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}
