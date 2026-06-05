import { createFileRoute, useParams } from "@tanstack/solid-router";
import { useEventClassification } from "@/services/fetch-stages/fetchStages";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import ObdxClassificationCard from "@/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationCard";
import {
  positionTrend,
  type TrendDirection,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { ColumnDef } from "@lib/components/atoms/table/AtomTable.types";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useI18n } from "@/stores/i18n/i18n";
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
      refetchOnMount: false,
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
      accessorKey: "country",
      header: t("STAGES.CLASSIFICATION.COUNTRY"),
      enableSorting: false,
      cell: (info) => (
        <CountryFlag country={info.getValue<string>()} width={20} height={20} />
      ),
    },
    {
      id: "dog",
      accessorFn: (row) => row.dog.name,
      header: t("STAGES.CLASSIFICATION.DOG"),
      cell: (info) => info.getValue<string>(),
    },
    {
      accessorKey: "owner",
      header: t("STAGES.CLASSIFICATION.GUIDE"),
      cell: (info) => info.getValue<string>(),
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

  const listContent = (
    classification: StageEventClassificationItemResponseDTO[],
  ) => (
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
            const competitor = classification[virtualRow.index];
            if (!competitor) return null;

            return (
              <div
                data-index={virtualRow.index}
                ref={(el) => {
                  const index = virtualRow.index;
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
                  competitor={competitor}
                  trend={trends().get(competitor.dog.id)}
                />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );

  const tableContent = (
    classification: StageEventClassificationItemResponseDTO[],
  ) => (
    <div style={{ height: `${listHeight()}px` }}>
      <AtomTable<StageEventClassificationItemResponseDTO>
        data={classification}
        columns={columns()}
        getRowCanExpand={() => true}
        renderSubComponent={(row) => (
          <ObdxClassificationCard
            competitor={row.original}
            trend={trends().get(row.original.dog.id)}
          />
        )}
      />
    </div>
  );

  const [controlValue, setControlValue] = createSignal(CONTROLS_KEYS.LIST);

  return (
    <div>
      <h2>--Event classification</h2>
      <Show
        when={classificationQuery.data}
        fallback={<span>--Loading classification...</span>}
      >
        {(classification) => (
          <div>
            <p>--Event {classification().event.name}</p>
            <p>--LastUpdated {classification().lastUpdated}</p>
            <p>--Stage {classification().stage.name}</p>
            <p>--Discipline {classification().discipline.name}</p>
            <p>--Classification</p>
            <Show
              when={classification()?.obdx?.competitors?.length}
              fallback={<span>--No classification data available.</span>}
            >
              <AtomSegmentedControl
                title={t("STAGES.CLASSIFICATION.CLASSIFICATION_BY")}
                control={controlValue()}
                onControlChange={setControlValue}
                controls={[
                  {
                    value: CONTROLS_KEYS.LIST,
                    text: t("STAGES.CLASSIFICATION.LIST"),
                    content: listContent(
                      classification().obdx?.competitors ?? [],
                    ),
                  },
                  {
                    value: CONTROLS_KEYS.TABLE,
                    text: t("STAGES.CLASSIFICATION.TABLE"),
                    content: tableContent(
                      classification().obdx?.competitors ?? [],
                    ),
                  },
                ]}
              />
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
