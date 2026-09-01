import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

export type RowWindowOptions = {
  /** Element that scrolls; rows outside its viewport are not rendered. */
  scrollElement: () => HTMLElement | undefined;
  rowCount: () => number;
  rowHeight: () => number;
  /** Rows kept rendered above and below the viewport, so scrolling does not flash empty space. */
  overscan?: number;
};

/**
 * The window of rows worth rendering for a scroll position: everything above and below is replaced by
 * empty space of the same height, so the scrollbar still measures the whole list.
 *
 * Rows are assumed to be of equal height, which is what makes the window a division rather than a
 * measure-every-row bookkeeping exercise.
 */
export function useRowWindow(options: RowWindowOptions) {
  const overscan = () => options.overscan ?? 4;

  const [scrollTop, setScrollTop] = createSignal(0);
  const [viewportHeight, setViewportHeight] = createSignal(0);

  createEffect(() => {
    const element = options.scrollElement();
    if (!element) return;

    const readScroll = () => setScrollTop(element.scrollTop);
    const readViewport = () => setViewportHeight(element.clientHeight);

    readScroll();
    readViewport();

    element.addEventListener("scroll", readScroll, { passive: true });

    if (typeof ResizeObserver === "undefined") {
      onCleanup(() => element.removeEventListener("scroll", readScroll));
      return;
    }

    const observer = new ResizeObserver(readViewport);
    observer.observe(element);

    onCleanup(() => {
      element.removeEventListener("scroll", readScroll);
      observer.disconnect();
    });
  });

  const firstRow = createMemo(() =>
    Math.max(0, Math.floor(scrollTop() / options.rowHeight()) - overscan()),
  );

  const lastRow = createMemo(() => {
    // Until the viewport has been measured, render one screenful's worth so the list is never blank.
    const visible = viewportHeight() || options.rowHeight() * (overscan() + 1);
    const rowsInView = Math.ceil(visible / options.rowHeight());

    return Math.min(
      options.rowCount() - 1,
      firstRow() + rowsInView + overscan() * 2,
    );
  });

  const lastVisibleRow = createMemo(() => {
    const visible = viewportHeight() || options.rowHeight() * (overscan() + 1);

    return Math.ceil((scrollTop() + visible) / options.rowHeight()) - 1;
  });

  const rows = createMemo(() => {
    const from = firstRow();
    const to = lastRow();

    return to < from
      ? []
      : Array.from({ length: to - from + 1 }, (_, i) => from + i);
  });

  return {
    rows,
    firstRow,
    lastRow,
    totalHeight: () => options.rowCount() * options.rowHeight(),
    offsetTop: () => firstRow() * options.rowHeight(),
    /** Height of the empty space left below the rendered window. */
    offsetBottom: () =>
      Math.max(0, (options.rowCount() - 1 - lastRow()) * options.rowHeight()),
    isAtEnd: () => lastRow() >= options.rowCount() - 1,
    /** Rows still left below what the viewport shows. */
    rowsBelowViewport: () =>
      Math.max(0, options.rowCount() - 1 - lastVisibleRow()),
    /** Whether fewer than `rowsAhead` rows are left below the viewport. */
    isNearEnd: (rowsAhead: number) =>
      lastVisibleRow() + rowsAhead >= options.rowCount() - 1,
  };
}
