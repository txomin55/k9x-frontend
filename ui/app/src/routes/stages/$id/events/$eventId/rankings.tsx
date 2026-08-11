import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import { createFileRoute, useParams } from "@tanstack/solid-router";
import i18nGlobal from "i18next";
import { createEffect, createMemo, Show, Suspense } from "solid-js";
import Page from "@/components/common/page/Page";
import PageSeo from "@/components/common/page-seo/PageSeo";
import RankingResults from "@/components/routes/my/competitions/$id/rankings-section/RankingResults";
import {
  getCachedEventRankingName,
  useEventRankings,
} from "@/services/fetch-rankings/fetchRankings";
import { useI18n } from "@/stores/i18n/i18n";
import { useSearchParam } from "@/utils/search-params/useSearchParam";

export const Route = createFileRoute("/stages/$id/events/$eventId/rankings")({
  component: EventRankingsPage,
  staticData: {
    // The stage > event trail is dropped: this page stands on its own, so the crumb is just "Rankings" plus
    // the ranking picked in the selector.
    breadcrumbRoot: true,
    breadcrumb: (match) => {
      const crumbs = [
        { label: i18nGlobal.t("STAGES.EVENT_RANKINGS.BREADCRUMB") },
      ];
      const params = match.params as { id: string; eventId: string };
      const rankingId = (match.search as { ranking?: string }).ranking;
      const name = rankingId
        ? getCachedEventRankingName(params.id, params.eventId, rankingId)
        : undefined;
      return name ? [...crumbs, { label: name }] : crumbs;
    },
  },
});

function EventRankingsPage() {
  const i18n = useI18n();
  const params = useParams({ from: "/stages/$id/events/$eventId/rankings" });
  const rankingsQuery = useEventRankings(params().id, params().eventId);
  const [selected, setSelected] = useSearchParam("ranking", "", "replace");

  /**
   * A ranking that does not belong to a competition arrives without an identifier for an anonymous visitor,
   * so there is nothing to open: those are left out of the combo rather than offered and then failing.
   */
  const options = createMemo<AtomSelectOption[]>(() =>
    (rankingsQuery.data ?? [])
      .filter((ranking) => !!ranking.id)
      .map((ranking) => ({ label: ranking.name, value: ranking.id })),
  );

  // Preselect the first one so the page shows results without an extra click.
  createEffect(() => {
    const available = options();
    if (available.length && !available.some((o) => o.value === selected())) {
      setSelected(available[0].value);
    }
  });

  const selectedOption = () =>
    options().find((option) => option.value === selected()) ?? null;

  return (
    <Page>
      <PageSeo
        title={i18n.t("STAGES.EVENT_RANKINGS.TITLE")}
        description={i18n.t("STAGES.EVENT_RANKINGS.DESCRIPTION")}
      />
      <h1>{i18n.t("STAGES.EVENT_RANKINGS.TITLE")}</h1>
      <Suspense>
        <Show
          when={options().length}
          fallback={<p>{i18n.t("STAGES.EVENT_RANKINGS.NO_RANKINGS")}</p>}
        >
          <AtomSelect
            label={i18n.t("STAGES.EVENT_RANKINGS.RANKING")}
            placeholder={i18n.t("STAGES.EVENT_RANKINGS.SELECT_RANKING")}
            options={options()}
            value={selectedOption()}
            onChange={(option) => setSelected(option?.value ?? "")}
          />
          {/* Keyed on the selection so switching ranking remounts and reads the new results. */}
          <Show when={selected()} keyed>
            {(rankingId) => <RankingResults rankingId={rankingId} />}
          </Show>
        </Show>
      </Suspense>
    </Page>
  );
}
