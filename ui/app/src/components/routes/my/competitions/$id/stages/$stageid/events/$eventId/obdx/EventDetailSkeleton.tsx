import { For } from "solid-js";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";

export default function EventDetailSkeleton() {
  return (
    <div class="competition-event-detail">
      <div class="page competition-event-detail__content">
        <header>
          <div class="competition-event-detail__content--header">
            <div class="competition-event-detail__content--header-title">
              <AtomSkeleton
                variant="rectangular"
                width="6rem"
                height="var(--unit-5)"
                radius="var(--radius-full)"
              />
            </div>
            <AtomSkeleton
              variant="rectangular"
              width="var(--unit-6)"
              height="var(--unit-6)"
              radius="var(--radius-md)"
            />
          </div>
        </header>

        <AtomSkeleton
          variant="rectangular"
          height="var(--unit-8)"
          radius="var(--radius-md)"
        />

        <AtomSkeleton
          variant="rectangular"
          height="var(--unit-8)"
          radius="var(--radius-md)"
        />

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "var(--unit-05)",
          }}
        >
          <AtomSkeleton width="8rem" />
          <AtomSkeleton width="12rem" />
        </div>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "var(--unit-05)",
          }}
        >
          <AtomSkeleton width="6rem" />
          <AtomSkeleton width="10rem" />
        </div>

        <div style={{ display: "flex", gap: "var(--unit-1)" }}>
          <For each={Array.from({ length: 3 })}>
            {() => (
              <AtomSkeleton
                variant="rectangular"
                width="5rem"
                height="var(--unit-4)"
                radius="var(--radius-md)"
              />
            )}
          </For>
        </div>

        <AtomSkeleton count={4} height="var(--unit-6)" />
      </div>
    </div>
  );
}
