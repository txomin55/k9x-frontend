import { useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show } from "solid-js";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import NameFilter from "@/components/common/name-filter/NameFilter";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useRankingClassification } from "@/services/fetch-rankings/fetchRankings";
import type {
  RankingClassificationCellResponseDTO,
  RankingClassificationEventResponseDTO,
  RankingClassificationGroupResponseDTO,
} from "@/services/fetch-rankings/fetchRankings.types";
import RankingResultsSkeleton from "./RankingResultsSkeleton";
import "./styles.css";

export interface RankingResultsProps {
  /**
   * Ranking to show. Fixed for the lifetime of the component: the query args are captured on mount, so a
   * different ranking means a different instance.
   */
  rankingId: string;
}

const formatScore = (score: number) => Math.round(score * 100) / 100;

export default function RankingResults(props: RankingResultsProps) {
  const i18n = useI18n();
  const navigate = useNavigate();
  // No refetchOnMount opt-out: the component is mounted fresh by the viewer dialog, so opening it always
  // reads the results again.
  const resultsQuery = useRankingClassification(props.rankingId);
  const [openGroupIds, setOpenGroupIds] = createSignal<string[]>([]);
  const [nameFilter, setNameFilter] = createSignal("");

  const results = () => resultsQuery.data ?? null;
  const events = createMemo(() => results()?.events ?? []);
  const allGroups = createMemo(() => results()?.groups ?? []);

  /**
   * The filter matches the criterion only (team, country, or the competitor itself under individual
   * grouping); groups are always shown whole. Positions and totals stay the real ones from the backend:
   * filtering never recomputes the ranking.
   */
  const groups = createMemo(() => {
    if (!nameFilter().trim()) {
      return allGroups();
    }
    const matches = buildNameMatcher(nameFilter());

    return allGroups().filter((group) => matches(group.name));
  });

  const isOpen = (groupId: string) => openGroupIds().includes(groupId);

  const toggleGroup = (groupId: string, open: boolean) => {
    setOpenGroupIds((current) =>
      open
        ? current.includes(groupId)
          ? current
          : [...current, groupId]
        : current.filter((id) => id !== groupId),
    );
  };

  /**
   * A score opens that event's classification with the competitor preselected. The public classification page
   * reads its filter from the `competitors` search param, keyed by dog identification.
   */
  const openClassification = (
    event: RankingClassificationEventResponseDTO,
    memberId: string,
  ) => {
    void navigate({
      to: "/stages/$id/events/$eventId/classification",
      params: { id: event.stageId, eventId: event.id },
      search: { competitors: memberId },
    });
  };

  const cellFor = (
    cells: RankingClassificationCellResponseDTO[],
    eventId: string,
  ) => cells.find((cell) => cell.eventId === eventId) ?? null;

  const groupTrigger = (group: RankingClassificationGroupResponseDTO) => (
    <span class="ranking-results__summary">
      <span class="ranking-results__position">
        {group.position}
        <Show when={group.tied}>
          <span
            class="ranking-results__tied"
            title={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.TIED")}
          >
            =
          </span>
        </Show>
      </span>
      <span class="ranking-results__criterion">{group.name}</span>
      <span class="ranking-results__total">{formatScore(group.total)}</span>
    </span>
  );

  const groupMatrix = (group: RankingClassificationGroupResponseDTO) => (
    // Scrolls on its own so a ranking with many events never makes the page scroll sideways. The event count
    // feeds the mobile min-width of the table, which CSS cannot derive on its own.
    <div
      class="ranking-results__matrix"
      style={{ "--ranking-events": events().length }}
    >
      <table>
        <thead>
          <tr>
            <th>{i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.COMPETITOR")}</th>
            <For each={events()}>{(event) => <th>{event.name}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={group.members}>
            {(member) => (
              <tr>
                <th scope="row">{member.name}</th>
                <For each={events()}>
                  {(event) => {
                    const cell = () => cellFor(member.cells, event.id);
                    const score = () => cell()?.score ?? null;
                    const counts = () => cell()?.counts === true;
                    return (
                      <td>
                        <button
                          type="button"
                          class="ranking-results__cell"
                          classList={{
                            "is-counted": counts(),
                            // A discarded score is red; no score at all is simply absent, so it stays grey.
                            "is-excluded": !counts() && score() !== null,
                            "is-empty": score() === null,
                          }}
                          // A score that does not count is still a real result, so it stays clickable; only a
                          // cell with no score at all has no classification to open.
                          disabled={score() === null}
                          title={
                            !counts() && score() !== null
                              ? i18n.t(
                                  "MY.COMPETITIONS.RANKINGS_SECTION.NOT_COUNTED",
                                )
                              : undefined
                          }
                          onClick={() => openClassification(event, member.id)}
                        >
                          {score() === null ? "—" : formatScore(score()!)}
                        </button>
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );

  return (
    // The placeholder brings its own section: it stands in for the whole block, not for its contents.
    <Show when={!resultsQuery.isPending} fallback={<RankingResultsSkeleton />}>
      <section class="ranking-results">
        <Show
          when={allGroups().length > 0}
          fallback={
            <p class="ranking-results__empty">
              {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.NO_RESULTS")}
            </p>
          }
        >
          <h3 class="ranking-results__title">
            {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.RESULTS")}
          </h3>
          <div class="ranking-results__filter">
            <NameFilter
              label={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.CRITERION")}
              value={nameFilter()}
              onChange={setNameFilter}
            />
          </div>
          <Show
            when={groups().length}
            fallback={
              <p class="ranking-results__empty">
                {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.NO_MATCHES")}
              </p>
            }
          >
            <div class="ranking-results__header">
              <span>{i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.POSITION")}</span>
              <span>
                {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.CRITERION")}
              </span>
              <span>{i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.TOTAL")}</span>
            </div>
            <ul class="ranking-results__groups">
              <For each={groups()}>
                {(group) => (
                  <li class="ranking-results__group">
                    <AtomCollapsible
                      open={isOpen(group.id)}
                      onOpenChange={(open) => toggleGroup(group.id, open)}
                      trigger={groupTrigger(group)}
                      content={groupMatrix(group)}
                    />
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </Show>
      </section>
    </Show>
  );
}
