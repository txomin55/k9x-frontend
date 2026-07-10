import { For, JSX, mergeProps } from "solid-js";
import "./styles.css";

export const SKELETON_VARIANTS = {
  TEXT: "text",
  CIRCULAR: "circular",
  RECTANGULAR: "rectangular",
} as const;

export type AtomSkeletonVariant =
  (typeof SKELETON_VARIANTS)[keyof typeof SKELETON_VARIANTS];

export interface AtomSkeletonProps {
  variant?: AtomSkeletonVariant;
  width?: string;
  height?: string;
  radius?: string;
  count?: number;
  animated?: boolean;
  class?: string;
  style?: JSX.CSSProperties;
}

export default function AtomSkeleton(props: AtomSkeletonProps) {
  const merged = mergeProps(
    { variant: SKELETON_VARIANTS.TEXT, count: 1, animated: true },
    props,
  );

  return (
    <For each={Array.from({ length: merged.count })}>
      {() => (
        <span
          class="atom-skeleton"
          classList={{
            "atom-skeleton--animated": merged.animated,
            [merged.class ?? ""]: !!merged.class,
          }}
          data-variant={merged.variant}
          aria-hidden="true"
          style={{
            ...(merged.width ? { width: merged.width } : {}),
            ...(merged.height ? { height: merged.height } : {}),
            ...(merged.radius ? { "border-radius": merged.radius } : {}),
            ...merged.style,
          }}
        />
      )}
    </For>
  );
}
