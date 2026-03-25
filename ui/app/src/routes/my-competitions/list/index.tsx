import { createFileRoute, Link } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";
import CompetitionCard from "@/components/routes/my-competitions/competition-card/CompetitionCard";
import { useCompetitions } from "@/services/fetch_competitions/fetchCompetitions";

export const Route = createFileRoute("/my-competitions/list/")({
  component: MyCompetitionsIndexPage,
});

function MyCompetitionsIndexPage() {
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
      <Link
        to="/my-competitions/$id"
        params={{ id: "new" }}
        style={{
          position: "fixed",
          right: "24px",
          bottom: "24px",
          width: "56px",
          height: "56px",
          "border-radius": "9999px",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "font-size": "32px",
          "line-height": "1",
          "text-decoration": "none",
          color: "white",
          background: "#111827",
          "box-shadow": "0 12px 32px rgba(0, 0, 0, 0.24)",
          border: "none",
          "z-index": "10",
        }}
      >
        +
      </Link>
    </div>
  );
}
