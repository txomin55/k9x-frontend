import { For } from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";

export default function CardListSkeleton(props: { count?: number }) {
  return (
    <For each={Array.from({ length: props.count ?? 6 })}>
      {() => (
        <Card
          topLeft={<AtomSkeleton width="55%" height="var(--text-heading-sm)" />}
          topRight={<AtomSkeleton width="3rem" />}
          subHeader={<AtomSkeleton width="40%" />}
          description={
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "var(--unit-05)",
              }}
            >
              <AtomSkeleton width="90%" />
              <AtomSkeleton width="70%" />
            </div>
          }
          actions={
            <div
              style={{
                display: "flex",
                gap: "var(--unit-1)",
                "justify-content": "flex-end",
              }}
            >
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
