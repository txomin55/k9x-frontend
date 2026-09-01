import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ExpandedState,
  type OnChangeFn,
  type Row,
  type SortingState,
} from "@tanstack/solid-table";
import { useRowWindow } from "../../../utils/virtual/useRowWindow";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import type { JSX } from "solid-js";
import "./styles.css";

export type { ColumnDef, Row } from "@tanstack/solid-table";

const DEFAULT_LOAD_MORE_THRESHOLD_ROWS = 3;

export type AtomTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  /** Rows left below the viewport at which the next page is asked for. */
  loadMoreThresholdRows?: number;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyMessage?: string;
  loadingMoreMessage?: string;
  class?: string;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (row: Row<TData>) => JSX.Element;
  getRowId?: (row: TData, index: number) => string;
  /**
   * Keeps only the visible rows in the DOM, for lists long enough that rendering every row costs.
   * Rows are laid out at `estimateRowHeight`, and expandable rows are rendered whole, so this is
   * ignored when a sub component is provided.
   */
  virtualized?: boolean;
  estimateRowHeight?: number;
  /**
   * Lays the table out on the column widths declared by `size` instead of on the widths the rendered
   * cells happen to need — which, with virtualization, would shift as rows scroll in and out. Columns
   * with no `size` share whatever width is left.
   */
  fixedLayout?: boolean;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  expandOnRowClick?: boolean;
};

export default function AtomTable<TData>(props: AtomTableProps<TData>) {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [expanded, setExpanded] = createSignal<ExpandedState>({});
  const [scrollerRef, setScrollerRef] = createSignal<HTMLDivElement>();
  let sentinelRef: HTMLDivElement | undefined;

  const table = createSolidTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    state: {
      get sorting() {
        return sorting();
      },
      get expanded() {
        return props.expanded ?? expanded();
      },
    },
    get getRowId() {
      return props.getRowId;
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      props.onSortingChange?.(updater);
    },
    onExpandedChange: (updater) => {
      if (props.onExpandedChange) props.onExpandedChange(updater);
      else setExpanded(updater);
    },
    getRowCanExpand: (row) => props.getRowCanExpand?.(row) ?? false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const rows = () => table.getRowModel().rows;

  const isVirtualized = () =>
    Boolean(props.virtualized) && !props.renderSubComponent;

  const rowHeight = () => props.estimateRowHeight ?? 56;

  const rowWindow = useRowWindow({
    scrollElement: scrollerRef,
    rowCount: () => (isVirtualized() ? rows().length : 0),
    rowHeight,
  });

  // Rows above and below the window are replaced by two spacer rows, so the scrollbar keeps the size of
  // the whole table while only the visible rows exist in the DOM.
  const paddingTop = () => (isVirtualized() ? rowWindow.offsetTop() : 0);

  const paddingBottom = () => (isVirtualized() ? rowWindow.offsetBottom() : 0);

  const renderedRows = createMemo(() =>
    isVirtualized()
      ? rowWindow.rows().map((rowIndex) => rows()[rowIndex])
      : rows(),
  );

  const handleRowClick = (row: Row<TData>, event: MouseEvent) => {
    if (!props.expandOnRowClick || !row.getCanExpand()) return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        'button, a, input, select, textarea, label, [role="button"]',
      )
    )
      return;
    row.toggleExpanded();
  };

  createEffect(() => {
    if (!sentinelRef || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry?.isIntersecting &&
          props.hasMore !== false &&
          !props.isLoadingMore
        ) {
          props.onLoadMore?.();
        }
      },
      {
        root: scrollerRef() ?? null,
        rootMargin: `0px 0px ${(props.loadMoreThresholdRows ?? DEFAULT_LOAD_MORE_THRESHOLD_ROWS) * rowHeight()}px 0px`,
      },
    );

    observer.observe(sentinelRef);

    onCleanup(() => observer.disconnect());
  });

  return (
    <div class={`atom-table ${props.class ?? ""}`.trim()}>
      <div class="atom-table__scroller" ref={setScrollerRef}>
        <table
          class="atom-table__table"
          classList={{ "atom-table__table--fixed": Boolean(props.fixedLayout) }}
        >
          <Show when={props.fixedLayout}>
            <colgroup>
              <For each={table.getVisibleLeafColumns()}>
                {(column) => (
                  <col
                    style={
                      column.columnDef.size
                        ? { width: `${column.columnDef.size}px` }
                        : undefined
                    }
                  />
                )}
              </For>
            </colgroup>
          </Show>
          <thead class="atom-table__head">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr class="atom-table__row">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <th class="atom-table__header" scope="col">
                      {header.isPlaceholder ? null : (
                        <button
                          class={`atom-table__sort-button ${canSort ? "is-sortable" : ""}`.trim()}
                          disabled={!canSort}
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          <span
                            class="atom-table__sort-indicator"
                            aria-hidden="true"
                          >
                            {sortState === "asc"
                              ? "▲"
                              : sortState === "desc"
                                ? "▼"
                                : ""}
                          </span>
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody class="atom-table__body">
            <Show when={paddingTop() > 0}>
              <tr aria-hidden="true" style={{ height: `${paddingTop()}px` }} />
            </Show>
            {rows().length === 0 ? (
              <tr class="atom-table__row">
                <td class="atom-table__empty" colSpan={props.columns.length}>
                  {props.emptyMessage ?? "No data available"}
                </td>
              </tr>
            ) : (
              <For each={renderedRows()}>
                {(row) => (
                  <>
                    <tr
                      class="atom-table__row"
                      style={
                        isVirtualized()
                          ? { height: `${rowHeight()}px` }
                          : undefined
                      }
                      classList={{
                        "atom-table__row--clickable":
                          Boolean(props.expandOnRowClick) && row.getCanExpand(),
                      }}
                      onClick={(event) => handleRowClick(row, event)}
                    >
                      <For each={row.getVisibleCells()}>
                        {(cell) => (
                          <td class="atom-table__cell">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        )}
                      </For>
                    </tr>
                    {row.getIsExpanded() && props.renderSubComponent ? (
                      <tr class="atom-table__row atom-table__row--expanded">
                        <td
                          class="atom-table__cell atom-table__expanded-cell"
                          colSpan={row.getVisibleCells().length}
                        >
                          {props.renderSubComponent(row)}
                        </td>
                      </tr>
                    ) : null}
                  </>
                )}
              </For>
            )}
            <Show when={paddingBottom() > 0}>
              <tr
                aria-hidden="true"
                style={{ height: `${paddingBottom()}px` }}
              />
            </Show>
          </tbody>
        </table>

        {props.isLoadingMore ? (
          <div class="atom-table__loading-more">
            {props.loadingMoreMessage ?? "Loading more rows..."}
          </div>
        ) : null}

        <div
          aria-hidden="true"
          class="atom-table__sentinel"
          data-testid="atom-table-sentinel"
          ref={sentinelRef}
        />
      </div>
    </div>
  );
}
