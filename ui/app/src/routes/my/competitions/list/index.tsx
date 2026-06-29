import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { For, Show, Suspense } from "solid-js";
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
      <span class="text-heading-lg">
        {i18n.t("MY.COMPETITIONS.LIST.MY_COMPETITIONS")}
      </span>
      <Suspense
        fallback={
          <span>{i18n.t("MY.COMPETITIONS.LIST.LOADING_COMPETITIONS")}</span>
        }
      >
        <Show
          when={fetchedCompetitions.data?.length}
          fallback={
            <span>{i18n.t("MY.COMPETITIONS.LIST.NO_COMPETITIONS")}</span>
          }
        >
          <For each={fetchedCompetitions.data}>
            {(competition) => (
              <CompetitionCard
                id={competition.id}
                status={competition.status}
                name={competition.name}
                description={competition.description}
                country={competition.country}
                stages={competition.stages}
                address={competition?.address}
              />
            )}
          </For>
        </Show>
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
