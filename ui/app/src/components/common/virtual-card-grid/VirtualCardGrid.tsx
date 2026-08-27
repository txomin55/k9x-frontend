import { useRowWindow } from "@lib/utils/virtual/useRowWindow";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
  type JSX,
} from "solid-js";
import "./styles.css";

type VirtualCardGridProps<T> = {
  items: T[];
  children: (item: T) => JSX.Element;
  /** Narrowest a card may get before the grid drops a column, in pixels. */
  minColumnWidth: number;
  /** Height every card is laid out at. Uniform rows are what make the scroll window a division. */
  rowHeight: number;
  height: number;
  gap?: number;
  /** Scrollable space kept after the last row, so it can be scrolled clear of a floating button. */
  endSpacing?: number;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadingMoreMessage?: string;
  class?: string;
};

/**
 * Renders a responsive card grid keeping only the visible rows in the DOM, and asks for more items as
 * the last row comes into view. Virtualization works on rows, not cards: how many cards fit on a row is
 * measured from the container, the same way the CSS grid would have wrapped them.
 */
export default function VirtualCardGrid<T>(props: VirtualCardGridProps<T>) {
  const [scroller, setScroller] = createSignal<HTMLDivElement>();
  const [width, setWidth] = createSignal(0);

  const gap = () => props.gap ?? 16;
  const rowHeight = () => props.rowHeight + gap();

  createEffect(() => {
    const element = scroller();
    if (!element || typeof ResizeObserver === "undefined") return;

    const measure = () => setWidth(element.clientWidth);
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(element);

    onCleanup(() => observer.disconnect());
  });

  const columns = createMemo(() => {
    const available = width();
    if (!available) return 1;

    const fitting = Math.floor(
      (available + gap()) / (props.minColumnWidth + gap()),
    );

    return Math.max(1, fitting);
  });

  const rowCount = createMemo(() => Math.ceil(props.items.length / columns()));

  const rowWindow = useRowWindow({
    scrollElement: scroller,
    rowCount,
    rowHeight,
  });

  const rowItems = (rowIndex: number) =>
    props.items.slice(rowIndex * columns(), rowIndex * columns() + columns());

  // Asking for the next page from the last rendered row keeps the request in step with the scroll,
  // without a sentinel that virtualization would have unmounted anyway.
  createEffect(() => {
    if (
      rowCount() &&
      rowWindow.isAtEnd() &&
      props.hasMore &&
      !props.isLoadingMore
    ) {
      props.onLoadMore?.();
    }
  });

  return (
    <div
      class={`virtual-card-grid ${props.class ?? ""}`.trim()}
      ref={setScroller}
      style={{ height: `${props.height}px` }}
    >
      <div
        class="virtual-card-grid__canvas"
        style={{
          height: `${rowWindow.totalHeight() + (props.endSpacing ?? 0)}px`,
        }}
      >
        <For each={rowWindow.rows()}>
          {(rowIndex) => (
            <div
              class="virtual-card-grid__row"
              data-index={rowIndex}
              style={{
                transform: `translateY(${rowIndex * rowHeight()}px)`,
                height: `${props.rowHeight}px`,
                "grid-template-columns": `repeat(${columns()}, minmax(0, 1fr))`,
                gap: `${gap()}px`,
              }}
            >
              <For each={rowItems(rowIndex)}>
                {(item) => props.children(item)}
              </For>
            </div>
          )}
        </For>
      </div>

      <Show when={props.isLoadingMore}>
        <p class="virtual-card-grid__loading">{props.loadingMoreMessage}</p>
      </Show>
    </div>
  );
}
