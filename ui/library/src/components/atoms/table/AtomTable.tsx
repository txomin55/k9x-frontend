import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  type ExpandedState,
  type SortingState,
} from "@tanstack/solid-table";
import type { AtomTableProps } from "@lib/components/atoms/table/AtomTable.types";
import { createEffect, createSignal, onCleanup } from "solid-js";
import "./styles.css";

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
        return expanded();
      },
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      props.onSortingChange?.(updater);
    },
    onExpandedChange: setExpanded,
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
              table.getRowModel().rows.map((row) => (
                <>
                  <tr class="atom-table__row">
                    {row.getVisibleCells().map((cell) => (
                      <td class="atom-table__cell">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
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
              ))
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
