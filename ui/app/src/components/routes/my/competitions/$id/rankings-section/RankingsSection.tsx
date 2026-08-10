import { createMemo, createSignal, Show } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useI18n } from "@/stores/i18n/i18n";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import {
  deleteRanking,
  saveRanking,
  useRanking,
  useRankingIncludeBys,
  useRankingGroupBys,
} from "@/services/secured/ranking-crud/rankingCrud";
import type { RankingResponseDTO } from "@/services/secured/ranking-crud/rankingCrud.types";
import { createDefaultRanking, getRankingId } from "@/utils/ranking";
import plusIcon from "@/assets/miscelaneous/plus.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import RankingConfigurator, {
  type RankingCompetitionOption,
  type RankingConfiguratorChange,
} from "./RankingConfigurator";
import RankingResults from "./RankingResults";
import "./styles.css";

export interface RankingsSectionProps {
  competition: CompetitionResponseDTO | undefined;
  /** Whether the page shows the cog at all, which is what decides this action's stack level. */
  showsEditMenu: boolean;
  menuOpen: boolean;
}

export default function RankingsSection(props: RankingsSectionProps) {
  const i18n = useI18n();
  // A local draft, not a POST: a ranking with no events would be rejected by the backend, so the first
  // save waits until the first event is picked.
  const [draft, setDraft] = createSignal<RankingResponseDTO | null>(null);

  const rankingId = createMemo(() =>
    props.competition ? getRankingId(props.competition.id) : "",
  );
  const rankingQuery = useRanking(rankingId());
  const groupBysQuery = useRankingGroupBys({ refetchOnMount: false });
  const includeBysQuery = useRankingIncludeBys({ refetchOnMount: false });

  const persistedRanking = () => rankingQuery.data ?? null;
  const ranking = () => persistedRanking() ?? draft();
  const hasRanking = () => !!ranking();

  const competitions = createMemo<RankingCompetitionOption[]>(() => {
    const competition = props.competition;

    if (!competition) return [];

    // Only the current competition today, but the configurator takes a list so it can be fed more later.
    return [
      {
        id: competition.id,
        name: competition.name,
        stages: (competition.stages ?? []).map((stage) => ({
          id: stage.id,
          name: stage.name,
          events: (stage.events ?? []).map((event) => ({
            id: event.id,
            name: event.name,
          })),
        })),
      },
    ];
  });

  const startDraft = () => {
    const competition = props.competition;

    if (!competition) return;

    const defaults = createDefaultRanking(
      competition.id,
      i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.DEFAULT_NAME"),
    );

    setDraft({
      rankingId: defaults.rankingId,
      name: defaults.name,
      events: [],
      groupBy: defaults.groupBy,
      includeBy: defaults.includeBy,
      includedCount: defaults.includedCount,
      includeReserves: defaults.includeReserves,
    });
  };

  const discardRanking = () => {
    setDraft(null);

    if (persistedRanking()) {
      deleteRanking(rankingId());
    }
  };

  const knownEvents = createMemo(() =>
    competitions().flatMap((competition) =>
      competition.stages.flatMap((stage) => stage.events),
    ),
  );

  const handleChange = (change: RankingConfiguratorChange) => {
    const current = ranking();

    if (!current) return;

    // A ranking cannot be stored without events, so a criteria change made while the list is still empty
    // only updates the local draft. Deleting is a separate, explicit action: the cog, or removing the last
    // event through onRemoveLastEvent. Without this, toggling a criterion on an empty draft would wipe it.
    if (change.eventIds.length === 0) {
      setDraft({
        ...current,
        events: [],
        groupBy: change.groupBy,
        includeBy: change.includeBy,
        includedCount: change.includedCount,
        includeReserves: change.includeReserves,
      });
      return;
    }

    // Every change is a full, idempotent POST: the last one always wins, which is what makes replaying a
    // queued change after being offline safe.
    const nextRanking = saveRanking(
      {
        rankingId: current.rankingId,
        name: current.name,
        eventIds: change.eventIds,
        groupBy: change.groupBy,
        includeBy: change.includeBy,
        includedCount: change.includedCount,
        includeReserves: change.includeReserves,
      },
      knownEvents(),
    );

    // Once it is persisted the query cache owns it, so the local draft is no longer needed.
    setDraft(null);
    return nextRanking;
  };

  // A ranking can be composed at any point in the competition's life, so its action lives outside the cog
  // (which only appears while the competition is still editable) — same treatment as the event export.
  // With a cog present it sits just above it and steps aside when the menu opens, leaving that level to the
  // pencil; with no cog it drops to the base level.
  const showsRankingAction = () => !props.showsEditMenu || !props.menuOpen;
  const actionLevelClass = () =>
    props.showsEditMenu
      ? "floating-action--level-1"
      : "floating-action--level-0";

  return (
    <section class="rankings-section">
      <Show
        when={ranking()}
        fallback={
          <p class="rankings-section__empty">
            {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.EMPTY")}
          </p>
        }
      >
        {(currentRanking) => (
          <>
            <RankingConfigurator
              competitions={competitions()}
              events={currentRanking().events}
              groupBy={currentRanking().groupBy}
              includeBy={currentRanking().includeBy}
              includedCount={currentRanking().includedCount}
              includeReserves={currentRanking().includeReserves}
              groupByOptions={groupBysQuery.data ?? []}
              includeByOptions={includeBysQuery.data ?? []}
              onChange={handleChange}
              onRemoveLastEvent={discardRanking}
            />
            {/* The results come from the public endpoint, so they only exist once the ranking is saved. */}
            <Show when={persistedRanking()}>
              <RankingResults rankingId={rankingId()} />
            </Show>
          </>
        )}
      </Show>

      <Show when={showsRankingAction()}>
        <div class={`floating-action ${actionLevelClass()}`}>
          {/* Add and delete are mutually exclusive, so they share the one slot. */}
          <Show
            when={hasRanking()}
            fallback={
              <button
                type="button"
                class="floating-action__trigger"
                onClick={startDraft}
              >
                <span class="floating-action__label">
                  {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING")}
                </span>
                {/* Not the affirmative action of the page, so it takes the outline treatment the export
                    action uses rather than claiming the primary colour. */}
                <span class="floating-action__circle floating-action__circle--secondary">
                  <AtomSvgIcon
                    src={plusIcon}
                    alt={i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING")}
                    tinted
                  />
                </span>
              </button>
            }
          >
            <ConfirmActionButton
              text={ranking()?.name}
              onConfirm={discardRanking}
            >
              <span class="floating-action__label">
                {i18n.t("MY.COMPETITIONS.RANKINGS_SECTION.DELETE_RANKING")}
              </span>
              <span class="floating-action__circle floating-action__circle--danger">
                <AtomSvgIcon
                  src={trashIcon}
                  alt={i18n.t(
                    "MY.COMPETITIONS.RANKINGS_SECTION.DELETE_RANKING",
                  )}
                  tinted
                />
              </span>
            </ConfirmActionButton>
          </Show>
        </div>
      </Show>
    </section>
  );
}
