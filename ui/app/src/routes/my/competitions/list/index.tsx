import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, Suspense } from "solid-js";
import CompetitionCard from "@/components/routes/my/competitions/list/competition-card/CompetitionCard";
import { useCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my/competitions/list/")({
  component: MyCompetitionsIndexPage,
});

function MyCompetitionsIndexPage() {
  const navigate = useNavigate();
  const i18n = useI18n();
  const fetchedCompetitions = useCompetitions({
    refetchOnMount: false,
    gcTime: 2 * 60 * 1000,
  });

  return (
    <div class="my-competitions">
      <h1>{i18n.t("MY.COMPETITIONS.LIST.MY_COMPETITIONS")}</h1>
      <Suspense fallback={<span>{i18n.t("MY.COMPETITIONS.LIST.LOADING_COMPETITIONS")}</span>}>
        <For each={fetchedCompetitions.data}>
          {(competition) => (
            <CompetitionCard
              id={competition.id}
              status={competition.status}
              name={competition.name}
              description={competition.description}
              country={competition.country}
              address={competition?.address}
            />
          )}
        </For>
      </Suspense>
      <FloatingToggleCircle
        onClick={() =>
          navigate({
            to: "/my/competitions/$id",
            params: { id: "new" },
          })
        }
        nonToggledText="+"
      />
    </div>
  );
}
