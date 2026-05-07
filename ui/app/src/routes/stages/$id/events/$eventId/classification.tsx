import { createFileRoute, useParams } from "@tanstack/solid-router";
import { useEventClassification } from "@/services/fetch-stages/fetchStages";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import Card from "@lib/components/molecules/card/Card";
import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
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
  let listRef!: HTMLDivElement;
  const [listHeight, setListHeight] = createSignal(
    ITEM_HEIGHT * MAX_VIEWPORT_ITEMS,
  );
  const competitors = createMemo(
    () => classificationQuery.data?.competitors ?? [],
  );

  const updateListHeight = () => {
    if (!listRef) return;
    const height = Math.max(
      120,
      Math.floor(window.innerHeight - listRef.getBoundingClientRect().top - 16),
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

  createEffect(() => {
    if (classificationQuery.data) {
      queueMicrotask(updateListHeight);
    }
  });

  const virtualizer = createVirtualizer({
    get count() {
      return competitors().length;
    },
    getScrollElement: () => listRef,
    getItemKey: (index) =>
      `classification_${params().id}_${params().eventId}_${index}`,
    estimateSize: () => ITEM_HEIGHT,
    initialRect: { width: 0, height: ITEM_HEIGHT * MAX_VIEWPORT_ITEMS },
    overscan: OVERSCAN,
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
            <p>--Stage {classification().stage.name}</p>
            <p>--Discipline {classification().discipline.name}</p>
            <p>--Classification</p>
            <Show
              when={classification().competitors.length > 0}
              fallback={<span>--No classification data available.</span>}
            >
              <div
                ref={listRef}
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
                      const competitor = classification().competitors[
                        virtualRow.index
                      ] as StageEventClassificationItemResponseDTO | undefined;
                      if (!competitor) return null;

                      return (
                        <article
                          data-index={virtualRow.index}
                          ref={(el) => {
                            el.setAttribute(
                              "data-index",
                              String(virtualRow.index),
                            );
                            virtualizer.measureElement(el);
                          }}
                          style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            right: "0",
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <Card
                            topLeft={
                              <div>
                                {competitor.position}.{" "}
                                {competitor.country || "-"} -{" "}
                                {competitor.dog.name}
                              </div>
                            }
                            topRight={<div>{competitor.totalScore ?? "-"}</div>}
                            content={
                              <ClassificationCardContent
                                competitor={competitor}
                              />
                            }
                          />
                        </article>
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

type ClassificationCardContentProps = {
  competitor: StageEventClassificationItemResponseDTO;
};

function ClassificationCardContent(props: ClassificationCardContentProps) {
  return (
    <div>
      <p>
        --Team: {props.competitor.team || "-"} | --Owner:{" "}
        {props.competitor.owner || "-"}
      </p>
      <AtomCollapsible
        trigger={<span>--Exercises</span>}
        content={
          <div>
            <For each={props.competitor.exercises}>
              {(exercise) => (
                <div style={{ "margin-bottom": "0.5rem" }}>
                  <div>
                    <strong>{exercise.exercise.name}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      "flex-wrap": "wrap",
                      "column-gap": "1rem",
                      "row-gap": "0.25rem",
                    }}
                  >
                    <For each={exercise.scores}>
                      {(score) => (
                        <span>
                          {score.value} ({score.judge.name})
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        }
      />
    </div>
  );
}
