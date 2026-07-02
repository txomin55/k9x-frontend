import {createFileRoute, useParams} from "@tanstack/solid-router";
import {useEventClassification} from "@/services/fetch-stages/fetchStages";
import type {StageEventClassificationItemResponseDTO} from "@/services/fetch-stages/fetchStages.types";
import {createEffect, createMemo, createSignal, For, Match, onCleanup, onMount, Show, Switch,} from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import ObdxClassificationCard from "@/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationCard";
import {
  isLive,
  positionTrend,
  type TrendDirection,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import {createVirtualizer} from "@tanstack/solid-virtual";
import type {ColumnDef} from "@lib/components/atoms/table/AtomTable.types";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import {AtomSegmentedControl} from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import {useI18n} from "@/stores/i18n/i18n";
import {useSearchParam, useSearchParamList,} from "@/utils/search-params/useSearchParam";
import {formatDateTime} from "@/utils/date";
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

function EventClassificationPage() {
  const { t } = useI18n();
  const params = useParams({
    from: "/stages/$id/events/$eventId/classification",
  });

  const classificationQuery = useEventClassification(
    params().id,
    params().eventId,
    {
      refetchOnMount: !isOffline(),
      gcTime: 5 * 60 * 1000,
    },
  );

  const ITEM_HEIGHT = 220;
  const OVERSCAN = 5;
  const MAX_VIEWPORT_ITEMS = 6;

  const [scrollEl, setScrollEl] = createSignal<HTMLDivElement>();
  const [listHeight, setListHeight] = createSignal(
    ITEM_HEIGHT * MAX_VIEWPORT_ITEMS,
  );
  const competitors = createMemo(
    () => classificationQuery.data?.obdx?.competitors ?? [],
  );

  const rowEls = new Map<number, HTMLDivElement>();

  let previousPositions = new Map<string, number>();
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
      nextTrends.set(
        id,
        positionTrend(previousPositions.get(id), competitor.position),
      );
      nextPositions.set(id, competitor.position);
    }
    setTrends(nextTrends);
    previousPositions = nextPositions;
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
    window.addEventListener("resize", updateListHeight);
    window.addEventListener("scroll", updateListHeight, { passive: true });
    onCleanup(() => {
      window.removeEventListener("resize", updateListHeight);
      window.removeEventListener("scroll", updateListHeight);
    });
  });

  const virtualizer = createVirtualizer({
    get count() {
      return competitors().length;
    },
    getScrollElement: () => scrollEl() ?? null,
    getItemKey: (index) =>
      `classification_${params().id}_${params().eventId}_${index}`,
    estimateSize: () => ITEM_HEIGHT,
    initialRect: { width: 0, height: ITEM_HEIGHT * MAX_VIEWPORT_ITEMS },
    overscan: OVERSCAN,
  });

  createEffect(() => {
    if (classificationQuery.data) {
      queueMicrotask(() => {
        updateListHeight();
        rowEls.forEach((el) => virtualizer.measureElement(el));
      });
    }
  });

  const columns = createMemo<
    ColumnDef<StageEventClassificationItemResponseDTO>[]
  >(() => [
    {
      accessorKey: "position",
      header: t("STAGES.CLASSIFICATION.POSITION"),
      cell: (info) => info.getValue<number>(),
    },
    {
      id: "country_dog",
      accessorFn: (stage) => stage,
      header: t("STAGES.CLASSIFICATION.DOG"),
      enableSorting: false,
      cell: (info) => {
        const row = info.getValue<StageEventClassificationItemResponseDTO>();
        return (
          <div>
            <CountryFlag country={row.country} width={20} height={20} />
            <span>{row.dog.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "totalScore",
      header: t("STAGES.CLASSIFICATION.TOTAL"),
      cell: (info) => info.getValue<number>() ?? "-",
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
      ref={setScrollEl}
      style={{
        height: `${listHeight()}px`,
        "overflow-y": "auto",
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        <For each={virtualizer.getVirtualItems()}>
          {(virtualRow) => {
            const competitor = () => competitors()[virtualRow.index];

            return (
              <Show when={competitor()}>
                {(item) => (
                  <div
                    data-index={virtualRow.index}
                    ref={(el) => {
                      const index = virtualRow.index;
                      el.setAttribute("data-index", String(index));
                      rowEls.set(index, el);
                      virtualizer.measureElement(el);
                      let raf = 0;
                      const ro = new ResizeObserver(() => {
                        cancelAnimationFrame(raf);
                        raf = requestAnimationFrame(() =>
                          virtualizer.measureElement(el),
                        );
                      });
                      ro.observe(el);
                      onCleanup(() => {
                        cancelAnimationFrame(raf);
                        ro.disconnect();
                        if (rowEls.get(index) === el) rowEls.delete(index);
                      });
                    }}
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      right: "0",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ObdxClassificationCard
                      competitor={item()}
                      trend={trends().get(item().dog.id)}
                      pinned={isPinned(item().dog.id)}
                      pinDisabled={liveIds().has(item().dog.id)}
                      onTogglePin={() => togglePin(item().dog.id)}
                      open={isOpen(item().dog.id)}
                      onOpenChange={(open) => setOpen(item().dog.id, open)}
                    />
                  </div>
                )}
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );

  const tableContent = () => (
    <div style={{ height: `${listHeight()}px` }}>
      <AtomTable<StageEventClassificationItemResponseDTO>
        data={competitors()}
        columns={columns()}
        getRowCanExpand={() => true}
        getRowId={(row) => row.dog.id}
        expanded={expandedState()}
        onExpandedChange={handleExpandedChange}
        renderSubComponent={(row) => (
          <ObdxClassificationCard
            competitor={row.original}
            trend={trends().get(row.original.dog.id)}
            pinned={isPinned(row.original.dog.id)}
            pinDisabled={liveIds().has(row.original.dog.id)}
            onTogglePin={() => togglePin(row.original.dog.id)}
            open={isOpen(row.original.dog.id)}
            onOpenChange={(open) => setOpen(row.original.dog.id, open)}
          />
        )}
      />
    </div>
  );

  const [controlValue, setControlValue] = useSearchParam(
    "view",
    CONTROLS_KEYS.LIST,
  );

  return (
    <div class="page classification">
      <Switch
        fallback={
          <span>{t("STAGES.CLASSIFICATION.LOADING_CLASSIFICATION")}</span>
        }
      >
        <Match when={classificationQuery.isError && !classificationQuery.data}>
          <div class="classification__error">
            <span>{t("STAGES.CLASSIFICATION.ERROR")}</span>
            <AtomButton onClick={() => classificationQuery.refetch()}>
              {t("STAGES.CLASSIFICATION.RETRY")}
            </AtomButton>
          </div>
        </Match>
        <Match when={classificationQuery.data}>
          {(classification) => (
            <>
              <div class="classification__header">
                <span class="text-heading-sm">
                  {classification().event.name}
                </span>
                <span class="text-caption-md">
                  {t("STAGES.CLASSIFICATION.LAST_UPDATED")}{" "}
                  {formatDateTime(classification().lastUpdated)}
                </span>
              </div>
              <div class="classification__sub-header">
                <span class="text-body-md">
                  {t("STAGES.CLASSIFICATION.STAGE")}{" "}
                  {classification().stage.name}
                </span>
                <span class="text-body-md">
                  {t("STAGES.CLASSIFICATION.DISCIPLINE")}{" "}
                  {classification().discipline.name}
                </span>
              </div>
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
                <AtomSegmentedControl
                  title={t("STAGES.CLASSIFICATION.CLASSIFICATION_BY")}
                  control={controlValue()}
                  onControlChange={setControlValue}
                  controls={[
                    {
                      value: CONTROLS_KEYS.LIST,
                      text: t("STAGES.CLASSIFICATION.LIST"),
                      content: listContent(),
                    },
                    {
                      value: CONTROLS_KEYS.TABLE,
                      text: t("STAGES.CLASSIFICATION.TABLE"),
                      content: tableContent(),
                    },
                  ]}
                />
              </Show>
            </>
          )}
        </Match>
      </Switch>
    </div>
  );
}
