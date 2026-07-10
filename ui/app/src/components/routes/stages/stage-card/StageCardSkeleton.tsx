import { For } from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import "./styles.css";

export default function StageCardSkeleton(props: { count?: number }) {
  return (
    <For each={Array.from({ length: props.count ?? 3 })}>
      {() => (
        <Card
          topLeft={
            <div class="stage-card__main-info">
              <AtomSkeleton
                variant="rectangular"
                width="var(--unit-6)"
                height="var(--unit-4)"
                radius="var(--radius-sm)"
              />
              <AtomSkeleton width="55%" height="var(--text-heading-sm)" />
            </div>
          }
          subHeader={<AtomSkeleton width="40%" />}
          description={
            <div class="stage-card__meta">
              <AtomSkeleton width="7rem" />
              <AtomSkeleton width="12rem" />
              <AtomSkeleton width="9rem" />
            </div>
          }
          actions={
            <div class="stage-card__actions">
              <AtomSkeleton
                variant="rectangular"
                width="5rem"
                height="var(--unit-5)"
                radius="var(--radius-full)"
              />
            </div>
          }
        />
      )}
    </For>
  );
}
