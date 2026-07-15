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
import { createEffect, createSignal, For, onCleanup } from "solid-js";
import type { JSX } from "solid-js";
import "./styles.css";

export type { ColumnDef, Row } from "@tanstack/solid-table";

export type AtomTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyMessage?: string;
  loadingMoreMessage?: string;
  class?: string;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (row: Row<TData>) => JSX.Element;
  getRowId?: (row: TData, index: number) => string;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
};

export default function AtomTable<TData>(props: AtomTableProps<TData>) {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const [expanded, setExpanded] = createSignal<ExpandedState>({});
  let scrollerRef: HTMLDivElement | undefined;
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
      { root: scrollerRef ?? null },
    );

    observer.observe(sentinelRef);

    onCleanup(() => observer.disconnect());
  });

  return (
    <div class={`atom-table ${props.class ?? ""}`.trim()}>
      <div class="atom-table__scroller" ref={scrollerRef}>
        <table class="atom-table__table">
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
            {table.getRowModel().rows.length === 0 ? (
              <tr class="atom-table__row">
                <td class="atom-table__empty" colSpan={props.columns.length}>
                  {props.emptyMessage ?? "No data available"}
                </td>
              </tr>
            ) : (
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <>
                    <tr class="atom-table__row">
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
