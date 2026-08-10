import { useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show } from "solid-js";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { useI18n } from "@/stores/i18n/i18n";
import { useRankingClassification } from "@/services/fetch-rankings/fetchRankings";
import type {
  RankingClassificationCellResponseDTO,
  RankingClassificationEventResponseDTO,
  RankingClassificationGroupResponseDTO,
} from "@/services/fetch-rankings/fetchRankings.types";
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
  const resultsQuery = useRankingClassification(props.rankingId, {
    refetchOnMount: false,
  });
  const [openGroupIds, setOpenGroupIds] = createSignal<string[]>([]);

  const results = () => resultsQuery.data ?? null;
  const events = createMemo(() => results()?.events ?? []);
  const groups = createMemo(() => results()?.groups ?? []);

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
    // Scrolls on its own so a ranking with many events never makes the page scroll sideways.
    <div class="ranking-results__matrix">
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
                <th scope="row">
                  {/* Inner span because max-width does not apply to table cells in auto layout, which is
                      what the mobile matrix uses; without it long dog names spill over the scores. */}
                  <span class="ranking-results__competitor" title={member.name}>
                    {member.name}
                  </span>
                </th>
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
                            "is-excluded": !counts(),
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
    <section class="ranking-results">
      <Show
        when={!resultsQuery.isPending}
        fallback={
          <div class="ranking-results__loading">
            <AtomSkeleton height="var(--unit-4)" />
            <AtomSkeleton height="var(--unit-4)" />
            <AtomSkeleton height="var(--unit-4)" />
          </div>
        }
      >
        <Show
          when={groups().length > 0}
          fallback={
            <p class="ranking-results__empty">
              {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.NO_RESULTS")}
            </p>
          }
        >
          <h3 class="ranking-results__title">
            {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.RESULTS")}
          </h3>
          <div class="ranking-results__header">
            <span>{i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.POSITION")}</span>
            <span>{i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.CRITERION")}</span>
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
  );
}
