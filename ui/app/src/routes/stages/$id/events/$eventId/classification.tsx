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
import { createVirtualizer } from "@tanstack/solid-virtual";

export const Route = createFileRoute(
  "/stages/$id/events/$eventId/classification",
)({
  component: EventClassificationPage,
});

function EventClassificationPage() {
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
  // Reactive ref: the scroll element mounts inside <Show> only after the data
  // arrives, so it must be a signal — otherwise the virtualizer never picks it
  // up and renders every row at translateY(0) (all stacked on first paint).
  const [scrollEl, setScrollEl] = createSignal<HTMLDivElement>();
  const [listHeight, setListHeight] = createSignal(
    ITEM_HEIGHT * MAX_VIEWPORT_ITEMS,
  );
  const competitors = createMemo(
    () => classificationQuery.data?.obdx.competitors ?? [],
  );
  // Currently rendered rows, so we can force a re-measure on data refetches
  // (which otherwise reset the virtualizer's sizes back to the estimate).
  const rowEls = new Map<number, HTMLDivElement>();

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
        // A refetch resets the virtualizer's measured sizes to the estimate;
        // re-measure the live rows so an expanded card keeps pushing the rows
        // below it down instead of overlapping them.
        rowEls.forEach((el) => virtualizer.measureElement(el));
      });
    }
  });

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
              when={classification().obdx.competitors.length > 0}
              fallback={<span>--No classification data available.</span>}
            >
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
                      const competitor = classification().obdx.competitors[
                        virtualRow.index
                      ] as StageEventClassificationItemResponseDTO | undefined;
                      if (!competitor) return null;

                      return (
                        <div
                          data-index={virtualRow.index}
                          ref={(el) => {
                            // Re-measure whenever the row's height changes (the
                            // accordion expanding/collapsing), so the rows below
                            // get the real height instead of the estimate and
                            // don't end up overlapped behind it.
                            const index = virtualRow.index;
                            rowEls.set(index, el);
                            virtualizer.measureElement(el);
                            // Defer re-measuring to the next frame: measuring
                            // synchronously inside the observer reflows the
                            // other rows and re-triggers the observer in the
                            // same frame ("ResizeObserver loop ... undelivered
                            // notifications").
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
                          <ObdxClassificationCard competitor={competitor} />
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
