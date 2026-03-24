import { useCompetitions } from "@/services/fetch_competitions/fetchCompetitions";
import { For, Suspense } from "solid-js";
import CompetitionCard from "@/components/routes/my-competitions/competition-card/CompetitionCard";

export default function MyCompetitionsRoute() {
  const fetchedCompetitions = useCompetitions({
    staleTime: 30 * 1000,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
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
    </div>
  );
}
