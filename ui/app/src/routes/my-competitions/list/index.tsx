import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";
import CompetitionCard from "@/components/routes/my-competitions/competition-card/CompetitionCard";
import { useCompetitions } from "@/services/api/competition_crud/competitionCrud";

export const Route = createFileRoute("/my-competitions/list/")({
  component: MyCompetitionsIndexPage,
});

function MyCompetitionsIndexPage() {
  const navigate = useNavigate();
  const fetchedCompetitions = useCompetitions({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  return (
    <div class="my-competitionss">
      <h1>--My competitions</h1>
      <Suspense fallback={<span>--Loading Competitions</span>}>
        <For each={fetchedCompetitions.data}>
          {(competition) => (
            <CompetitionCard
              id={competition.id}
              status={competition.status}
              name={competition.name}
              description={competition.description}
              country={competition.country}
              stages={competition.stages}
              address={competition?.location?.address}
            />
          )}
        </For>
      </Suspense>
      <div
        style={{
          position: "fixed",
          right: "var(--unit-2)",
          bottom: "var(--unit-2)",
        }}
      >
        <CircleButton
          onClick={() =>
            navigate({
              to: "/my-competitions/$id",
              params: { id: "new" },
            })
          }
        >
          +
        </CircleButton>
      </div>
    </div>
  );
}
