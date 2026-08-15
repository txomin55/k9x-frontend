import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { createFileRoute, useParams } from "@tanstack/solid-router";
import i18nGlobal from "i18next";
import { createEffect, createMemo, Show, Suspense } from "solid-js";
import Page from "@/components/common/page/Page";
import PageSeo from "@/components/common/page-seo/PageSeo";
import RankingResults from "@/components/routes/my/competitions/$id/rankings-section/RankingResults";
import RankingResultsSkeleton from "@/components/routes/my/competitions/$id/rankings-section/RankingResultsSkeleton";
import {
  getCachedEventRankingName,
  useEventRankings,
} from "@/services/fetch-rankings/fetchRankings";
import { useI18n } from "@/stores/i18n/i18n";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";
import eventRankingsSelector from "@/assets/breadcrumb-info/event-rankings-selector.webp";
import eventRankingsLogin from "@/assets/breadcrumb-info/event-rankings-login.webp";
import eventRankingsCriteria from "@/assets/breadcrumb-info/event-rankings-criteria.webp";
import eventRankingsScores from "@/assets/breadcrumb-info/event-rankings-scores.webp";
import "./styles.css";

/** Marks a combo entry whose ranking came back without an identifier, so it cannot be opened as a visitor. */
const LOCKED_VALUE_PREFIX = "login-required:";

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
    breadcrumbInfo: EventRankingsBreadcrumbInfo,
  },
});

function EventRankingsBreadcrumbInfo() {
  return (
    <BreadcrumbInfoSlides
      slides={[
        [{ keys: ["STAGES.EVENT_RANKINGS.BREADCRUMB_INFO"] }],
        [
          {
            keys: ["STAGES.EVENT_RANKINGS.BREADCRUMB_INFO_2"],
            image: eventRankingsSelector,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_RANKINGS.BREADCRUMB_INFO_4"],
            image: eventRankingsCriteria,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_RANKINGS.BREADCRUMB_INFO_5"],
            image: eventRankingsScores,
          },
        ],
        [
          {
            keys: ["STAGES.EVENT_RANKINGS.BREADCRUMB_INFO_3"],
            image: eventRankingsLogin,
          },
        ],
      ]}
    />
  );
}

function EventRankingsPage() {
  const i18n = useI18n();

  return (
    <Page>
      <PageSeo
        title={i18n.t("STAGES.EVENT_RANKINGS.TITLE")}
        description={i18n.t("STAGES.EVENT_RANKINGS.DESCRIPTION")}
      />
      <h1>{i18n.t("STAGES.EVENT_RANKINGS.TITLE")}</h1>
      {/* The query is created and read inside the child, so the wait is caught here and the heading stays. */}
      <Suspense fallback={<EventRankingsSkeleton />}>
        <EventRankingsContent />
      </Suspense>
    </Page>
  );
}

function EventRankingsSkeleton() {
  return (
    <>
      <div class="ranking-skeleton__field">
        <AtomSkeleton width="30%" height="var(--text-caption-md)" />
        <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
      </div>
      <RankingResultsSkeleton />
    </>
  );
}

function EventRankingsContent() {
  const i18n = useI18n();
  const params = useParams({ from: "/stages/$id/events/$eventId/rankings" });
  const rankingsQuery = useEventRankings(params().id, params().eventId);
  const [selected, setSelected] = useSearchParam("ranking", "", "replace");

  /**
   * A ranking that does not belong to a competition arrives without an identifier for an anonymous visitor.
   * It is still offered in the combo, under a placeholder value, so the visitor can see it exists; picking it
   * explains that a session is needed instead of silently hiding it.
   */
  const options = createMemo<AtomSelectOption[]>(() =>
    (rankingsQuery.data ?? []).map((ranking, index) => ({
      label: ranking.name,
      value: ranking.id || `${LOCKED_VALUE_PREFIX}${index}`,
    })),
  );

  const isLocked = (value: string) => value.startsWith(LOCKED_VALUE_PREFIX);

  // Preselect the first readable one so the page shows results without an extra click, falling back to the
  // first locked entry when every ranking needs a session.
  createEffect(() => {
    const available = options();
    if (!available.length || available.some((o) => o.value === selected())) {
      return;
    }
    const readable = available.find((option) => !isLocked(option.value));
    setSelected((readable ?? available[0]).value);
  });

  const selectedOption = () =>
    options().find((option) => option.value === selected()) ?? null;

  return (
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
        {(rankingId) => (
          <Show
            when={!isLocked(rankingId)}
            fallback={
              <div class="event-rankings__banner">
                {i18n.t("STAGES.EVENT_RANKINGS.LOGIN_REQUIRED")}
              </div>
            }
          >
            <RankingResults rankingId={rankingId} />
          </Show>
        )}
      </Show>
    </Show>
  );
}
