import {createFileRoute, useParams} from "@tanstack/solid-router";
import {useEventClassification} from "@/services/fetch-stages/fetchStages";
import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import {createEffect, createMemo, createSignal, For, onCleanup, onMount, Show,} from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import ObdxClassificationCard from "@/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationCard";
import PositionMedal
  from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal";
import ObdxClassificationContent from "@/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationContent";
import ObdxExerciseSquares
  from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares";
import {
  isLive,
  positionTrend,
  type TrendDirection,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type {ColumnDef} from "@lib/components/atoms/table/AtomTable.types";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import {AtomSegmentedControl} from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import {AtomCombobox, type AtomComboboxOption,} from "@lib/components/atoms/combobox/AtomCombobox";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import BihIndicator from "@/components/common/bih-indicator/BihIndicator";
import ReserveIndicator from "@/components/common/reserve-indicator/ReserveIndicator";
import NotCompetingIndicator from "@/components/common/not-competing-indicator/NotCompetingIndicator";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import RotateDeviceHint from "@/components/common/rotate-device-hint/RotateDeviceHint";
import PinButton
  from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/pin-button/PinButton";
import {useI18n} from "@/stores/i18n/i18n";
import {useAuthUser} from "@/stores/auth/auth";
import {useSearchParam, useSearchParamList,} from "@/utils/search-params/useSearchParam";
import {formatDateTime} from "@/utils/date";
import {exportClassificationPdf} from "@/utils/classification-pdf";
import {isOffline} from "@/utils/local-first/localFirstPolicy";
import "./styles.css";

export const Route = createFileRoute(
  "/stages/$id/events/$eventId/classification",
)({
  component: EventClassificationPage,
});

const CONTROLS_KEYS = {
  LIST: "LIST",
  TABLE: "TABLE",
};

function ClassificationSkeleton() {
  return (
    <div class="page classification">
      <div class="classification__header">
        <AtomSkeleton width="12rem" height="var(--text-caption-lg)" />
        <div class="classification__header--info">
          <div
            style={{
              display: "flex",
              gap: "var(--unit-05)",
              "align-items": "center",
            }}
          >
            <AtomSkeleton
              variant="rectangular"
              width="var(--unit-5)"
              height="var(--unit-5)"
              radius="var(--radius-md)"
            />
            <AtomSkeleton width="8rem" />
          </div>
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "var(--unit-025)",
            }}
          >
            <AtomSkeleton width="5rem" />
            <AtomSkeleton width="7rem" />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--unit-1)" }}>
        <AtomSkeleton
          variant="rectangular"
          width="4rem"
          height="var(--unit-4)"
          radius="var(--radius-md)"
        />
        <AtomSkeleton
          variant="rectangular"
          width="5rem"
          height="var(--unit-4)"
          radius="var(--radius-md)"
        />
      </div>

      <div class="obdx-clf__list">
        <For each={Array.from({ length: 6 })}>
          {() => (
            <Card
              topLeft={
                <div
                  style={{
                    display: "flex",
                    gap: "var(--unit-1)",
                    "align-items": "center",
                  }}
                >
                  <AtomSkeleton
                    variant="circular"
                    width="var(--unit-6)"
                    height="var(--unit-6)"
                  />
                  <div
                    style={{
                      display: "flex",
                      "flex-direction": "column",
                      gap: "var(--unit-025)",
                    }}
                  >
                    <AtomSkeleton width="8rem" />
                    <AtomSkeleton width="5rem" />
                  </div>
                </div>
              }
              topRight={
                <AtomSkeleton
                  variant="rectangular"
                  width="var(--unit-5)"
                  height="var(--unit-5)"
                  radius="var(--radius-md)"
                />
              }
              content={
                <AtomSkeleton
                  variant="rectangular"
                  height="var(--unit-5)"
                  radius="var(--radius-md)"
                />
              }
            />
          )}
        </For>
      </div>
    </div>
  );
}

function EventClassificationPage() {
  const { t } = useI18n();
  const params = useParams({
    from: "/stages/$id/events/$eventId/classification",
  });
  const user = useAuthUser();
  const isLoggedIn = () => Boolean(user());

  const classificationQuery = useEventClassification(
    params().id,
    params().eventId,
    {
      refetchOnMount: !isOffline(),
      gcTime: 5 * 60 * 1000,
    },
  );

  const [clfData, setClfData] =
    createSignal<StageEventClassificationResponseDTO>();
  const activeScroller = () => {
    const list = scrollEl();
    if (list?.isConnected) return list;
    return (
      tableEl()?.querySelector<HTMLElement>(".atom-table__scroller") ??
      undefined
    );
  };
  createEffect(() => {
    const data = classificationQuery.data;
    if (!data) return;
    const el = activeScroller();
    const prevScroll = el?.scrollTop ?? 0;
    setClfData(data);
    if (el && prevScroll) {
      const restore = () => {
        el.scrollTop = prevScroll;
      };
      restore();
      requestAnimationFrame(restore);
    }
  });

  const ITEM_HEIGHT = 220;
  const MAX_VIEWPORT_ITEMS = 6;

  const [scrollEl, setScrollEl] = createSignal<HTMLDivElement>();
  const [tableEl, setTableEl] = createSignal<HTMLDivElement>();
  const [listHeight, setListHeight] = createSignal(
    ITEM_HEIGHT * MAX_VIEWPORT_ITEMS,
  );
  const competitors = createMemo(() => clfData()?.obdx?.competitors ?? []);

  const [competitorFilterIds, setCompetitorFilterIds] =
    useSearchParamList("competitors");
  const competitorFilterIdSet = createMemo(
    () => new Set(competitorFilterIds()),
  );

  const competitorOptions = createMemo<AtomComboboxOption[]>(() =>
    competitors().map((competitor) => ({
      label: competitor.dog.name,
      value: competitor.dog.id,
    })),
  );

  const selectedCompetitorOptions = createMemo(() =>
    competitorOptions().filter((option) =>
      competitorFilterIdSet().has(option.value),
    ),
  );

  const filteredCompetitors = createMemo(() => {
    const ids = competitorFilterIdSet();
    if (!ids.size) return competitors();
    return competitors().filter((competitor) => ids.has(competitor.dog.id));
  });

  let previousPositions = new Map<string, number>();
  let previousTrends = new Map<string, TrendDirection>();
  const [trends, setTrends] = createSignal<Map<string, TrendDirection>>(
    new Map(),
  );

  createEffect(() => {
    const list = competitors();
    if (!list.length) return;
    const nextTrends = new Map<string, TrendDirection>();
    const nextPositions = new Map<string, number>();
    for (const competitor of list) {
      const id = competitor.dog.id;
      const previousPosition = previousPositions.get(id);
      const positionChanged =
        previousPosition !== undefined &&
        previousPosition !== competitor.position;
      nextTrends.set(
        id,
        positionChanged
          ? positionTrend(previousPosition, competitor.position)
          : (previousTrends.get(id) ?? "same"),
      );
      nextPositions.set(id, competitor.position);
    }
    setTrends(nextTrends);
    previousPositions = nextPositions;
    previousTrends = nextTrends;
  });

  const liveIds = createMemo(() => {
    const ids = new Set<string>();
    for (const competitor of competitors()) {
      if (isLive(competitor.status)) ids.add(competitor.dog.id);
    }
    return ids;
  });

  const [pinnedList, setPinnedList] = useSearchParamList("pinned");
  const pinnedIds = createMemo(() => new Set(pinnedList()));

  const isPinned = (id: string) => liveIds().has(id) || pinnedIds().has(id);

  const togglePin = (id: string) => {
    if (liveIds().has(id)) return;
    const next = new Set(pinnedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinnedList([...next]);
  };

  const pinnedCompetitors = createMemo(() =>
    competitors().filter((competitor) => isPinned(competitor.dog.id)),
  );

  const [openIds, setOpenIds] = createSignal<Set<string>>(new Set());

  const isOpen = (id: string) => openIds().has(id);

  const setOpen = (id: string, open: boolean) => {
    const next = new Set(openIds());
    if (open) next.add(id);
    else next.delete(id);
    setOpenIds(next);
  };

  const expandedState = createMemo<Record<string, boolean>>(() => {
    const record: Record<string, boolean> = {};
    for (const id of openIds()) record[id] = true;
    return record;
  });

  const [pinnedOpenIds, setPinnedOpenIds] = createSignal<Set<string>>(
    new Set(),
  );

  const isPinnedOpen = (id: string) => pinnedOpenIds().has(id);

  const setPinnedOpen = (id: string, open: boolean) => {
    const next = new Set(pinnedOpenIds());
    if (open) next.add(id);
    else next.delete(id);
    setPinnedOpenIds(next);
  };

  const handleExpandedChange = (
    updater: Record<string, boolean> | ((old: any) => any) | boolean,
  ) => {
    const next =
      typeof updater === "function" ? updater(expandedState()) : updater;
    const ids = new Set<string>();
    if (next && typeof next === "object") {
      for (const [id, value] of Object.entries(next)) {
        if (value) ids.add(id);
      }
    }
    setOpenIds(ids);
  };

  const updateListHeight = () => {
    const el = scrollEl();
    if (!el) return;
    const height = Math.max(
      120,
      Math.floor(window.innerHeight - el.getBoundingClientRect().top - 16),
    );
    setListHeight(height);
  };

  onMount(() => {
    updateListHeight();
    window.addEventListener("resize", updateListHeight);
    window.addEventListener("scroll", updateListHeight, { passive: true });
    onCleanup(() => {
      window.removeEventListener("resize", updateListHeight);
      window.removeEventListener("scroll", updateListHeight);
    });
  });

  createEffect(() => {
    if (clfData()) {
      queueMicrotask(updateListHeight);
    }
  });

  const columns = createMemo<
    ColumnDef<StageEventClassificationItemResponseDTO>[]
  >(() => [
    {
      accessorKey: "position",
      header: t("STAGES.CLASSIFICATION.POSITION"),
      cell: (info) => {
        const position = info.getValue<number>();
        return (
          <div class="obdx-clf-table__position">
            <span class="text-caption-md">{position}</span>
            <Show when={position <= 3}>
              <PositionMedal position={position as 1 | 2 | 3} />
            </Show>
          </div>
        );
      },
    },
    {
      id: "country_dog",
      accessorFn: (stage) => stage,
      header: t("STAGES.CLASSIFICATION.DOG"),
      enableSorting: false,
      cell: (info) => {
        const row = info.getValue<StageEventClassificationItemResponseDTO>();
        return (
          <div class="obdx-clf-table__dog">
            <span class="obdx-clf-table__dog-name">
              <CountryFlag country={row.country.id} />
              <span>{row.dog.name}</span>
              <Show when={row.bih}>
                <BihIndicator />
              </Show>
              <Show when={row.reserve}>
                <ReserveIndicator />
              </Show>
              <Show when={row.notCompeting}>
                <NotCompetingIndicator />
              </Show>
              <AwardBadges awards={row.awards} />
            </span>
          </div>
        );
      },
    },
    {
      id: "scores",
      accessorFn: (stage) => stage,
      header: () => (
        <div class="obdx-clf-table__scores">
          {t("STAGES.CLASSIFICATION.SCORES")}
        </div>
      ),
      enableSorting: false,
      cell: (info) => {
        const row = info.getValue<StageEventClassificationItemResponseDTO>();
        return (
          <div class="obdx-clf-table__scores">
            <ObdxExerciseSquares exercises={row.exercises} />
          </div>
        );
      },
    },
    {
      accessorKey: "totalScore",
      header: t("STAGES.CLASSIFICATION.TOTAL"),
      cell: (info) => (
        <span class="text-heading-xs">
          {info.getValue<number>() ?? "-"}
          <Show when={info.row.original.qualification}>
            <span class="obdx-clf__qualification text-caption-sm">
              {info.row.original.qualification}
            </span>
          </Show>
        </span>
      ),
    },
    {
      id: "pin",
      header: () => null,
      enableSorting: false,
      cell: (info) => (
        <PinButton
          pinned={isPinned(info.row.original.dog.id)}
          disabled={liveIds().has(info.row.original.dog.id)}
          onToggle={() => togglePin(info.row.original.dog.id)}
        />
      ),
    },
    {
      id: "expander",
      header: () => null,
      enableSorting: false,
      cell: (info) => (
        <button
          type="button"
          class="obdx-clf-table__expander"
          aria-label={
            info.row.getIsExpanded()
              ? t("STAGES.CLASSIFICATION_CARD.CLOSE")
              : t("STAGES.CLASSIFICATION_CARD.SEE_DETAIL")
          }
          aria-expanded={info.row.getIsExpanded()}
          onClick={info.row.getToggleExpandedHandler()}
        >
          {info.row.getIsExpanded() ? "▾" : "▸"}
        </button>
      ),
    },
  ]);

  const listContent = () => (
    <div
      ref={(el) => {
        setScrollEl(el);
        updateListHeight();
      }}
      class="obdx-clf__list"
      style={{
        height: `${listHeight()}px`,
        "overflow-y": "auto",
      }}
    >
      <For each={filteredCompetitors()}>
        {(item) => (
          <ObdxClassificationCard
            competitor={item}
            trend={trends().get(item.dog.id)}
            pinned={isPinned(item.dog.id)}
            pinDisabled={liveIds().has(item.dog.id)}
            onTogglePin={() => togglePin(item.dog.id)}
            open={isOpen(item.dog.id)}
            onOpenChange={(open) => setOpen(item.dog.id, open)}
          />
        )}
      </For>
    </div>
  );

  const tableContent = () => (
    <div
      ref={setTableEl}
      class="obdx-clf-table"
      style={{ height: `${listHeight()}px` }}
    >
      <AtomTable<StageEventClassificationItemResponseDTO>
        data={filteredCompetitors()}
        columns={columns()}
        getRowCanExpand={() => true}
        getRowId={(row) => row.dog.id}
        expanded={expandedState()}
        onExpandedChange={handleExpandedChange}
        renderSubComponent={(row) => (
          <ObdxClassificationContent
            competitor={row.original}
            open={isOpen(row.original.dog.id)}
            onOpenChange={(open) => setOpen(row.original.dog.id, open)}
            hideSquaresTotal
          />
        )}
      />
    </div>
  );

  const [isExporting, setIsExporting] = createSignal(false);

  const handleExportPdf = async () => {
    const data = clfData();
    if (!data || isExporting()) return;
    setIsExporting(true);
    try {
      await exportClassificationPdf(data, filteredCompetitors(), t);
    } finally {
      setIsExporting(false);
    }
  };

  const [controlValue, setControlValue] = useSearchParam(
    "view",
    CONTROLS_KEYS.LIST,
  );

  const classificationControls = createMemo(() => [
    {
      value: CONTROLS_KEYS.LIST,
      text: t("STAGES.CLASSIFICATION.LIST"),
      content: listContent,
    },
    {
      value: CONTROLS_KEYS.TABLE,
      text: t("STAGES.CLASSIFICATION.TABLE"),
      content: tableContent,
    },
  ]);

  // Pinning, expanding a card/row, and switching tabs all change how much
  // vertical space is taken above the list, so the available height needs
  // recalculating each time. Deferred to the next frame so it reads the
  // layout after the DOM has actually settled.
  createEffect(() => {
    openIds();
    pinnedOpenIds();
    pinnedIds();
    controlValue();
    requestAnimationFrame(updateListHeight);
  });

  return (
    <Show
      when={clfData()}
      fallback={
        <Show
          when={classificationQuery.isError}
          fallback={<ClassificationSkeleton />}
        >
          <div class="page classification">
            <div class="classification__error">
              <span>{t("STAGES.CLASSIFICATION.ERROR")}</span>
              <AtomButton onClick={() => classificationQuery.refetch()}>
                {t("STAGES.CLASSIFICATION.RETRY")}
              </AtomButton>
            </div>
          </div>
        </Show>
      }
    >
      {(classification) => (
        <div class="page classification">
          <div class="classification__header">
            <div class="classification__header--title">
              <span class="text-caption-lg">
                {classification().competitionName}
              </span>
              <Show when={competitors().length}>
                <AtomButton
                  type="ghost"
                  disabled={isExporting()}
                  onClick={handleExportPdf}
                >
                  {t("STAGES.CLASSIFICATION.EXPORT_PDF")}
                </AtomButton>
              </Show>
            </div>
            <div class="classification__header--info">
              <div>
                <DisciplineIcon disciplineId={classification().discipline.id} />
                <span class="text-caption-md">
                  {classification().configuration.name}
                </span>
              </div>

              <div>
                <span class="text-caption-sm">
                  {t("STAGES.CLASSIFICATION.LAST_UPDATED")}
                </span>
                <span class="text-caption-md">
                  {formatDateTime(classification().lastUpdated)}
                </span>
              </div>
            </div>
          </div>
          <Show when={classification().obdx}>
            {(obdx) => (
              <div class="classification__score-calculation">
                <span class="text-caption-sm">
                  {t("STAGES.CLASSIFICATION.SCORE_CALCULATION")}
                </span>
                <span class="text-caption-md">
                  {t(
                    `MY.COMPETITIONS.EVENT_DETAIL.SCORE_CALCULATION_${obdx().scoreCalculation}`,
                  )}
                </span>
              </div>
            )}
          </Show>
          <Show when={classification().obdx?.judges?.length}>
            <div class="classification__judges">
              <span class="text-caption-sm">
                {t("STAGES.CLASSIFICATION.JUDGES")}
              </span>
              <span class="text-caption-md">
                {classification()
                  .obdx?.judges.map((judge) => judge.name)
                  .join(", ")}
              </span>
            </div>
          </Show>
          <Show when={isLoggedIn() && competitorOptions().length}>
            <div class="obdx-clf__filter obdx-clf__filter-row">
              <AtomCombobox
                multiple
                label={t("STAGES.CLASSIFICATION.FILTER_COMPETITORS")}
                placeholder={t(
                  "STAGES.CLASSIFICATION.FILTER_COMPETITORS_PLACEHOLDER",
                )}
                options={competitorOptions()}
                value={selectedCompetitorOptions()}
                onChange={(options) =>
                  setCompetitorFilterIds(options.map((option) => option.value))
                }
              />
              <RotateDeviceHint />
            </div>
          </Show>
          <Show when={pinnedCompetitors().length}>
            <div class="obdx-clf__pinned">
              <For each={pinnedCompetitors()}>
                {(competitor) => (
                  <ObdxClassificationCard
                    competitor={competitor}
                    trend={trends().get(competitor.dog.id)}
                    pinned
                    pinDisabled={liveIds().has(competitor.dog.id)}
                    onTogglePin={() => togglePin(competitor.dog.id)}
                    open={isPinnedOpen(competitor.dog.id)}
                    onOpenChange={(open) =>
                      setPinnedOpen(competitor.dog.id, open)
                    }
                  />
                )}
              </For>
            </div>
          </Show>
          <Show
            when={classification()?.obdx?.competitors?.length}
            fallback={<span>{t("STAGES.CLASSIFICATION.NO_DATA")}</span>}
          >
            <Show
              when={filteredCompetitors().length}
              fallback={
                <span>{t("STAGES.CLASSIFICATION.NO_FILTER_RESULTS")}</span>
              }
            >
              <AtomSegmentedControl
                title={t("STAGES.CLASSIFICATION.CLASSIFICATION_BY")}
                control={controlValue()}
                onControlChange={setControlValue}
                controls={classificationControls()}
              />
            </Show>
          </Show>
        </div>
      )}
    </Show>
  );
}
