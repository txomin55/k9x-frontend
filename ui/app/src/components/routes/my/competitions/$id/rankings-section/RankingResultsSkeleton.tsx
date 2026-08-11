import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { For } from "solid-js";
import "./styles.css";

export interface RankingResultsSkeletonProps {
  /** Collapsed group rows to draw. Six fills a screen without pretending to know the real count. */
  rows?: number;
}

/**
 * Placeholder for the results block. It reuses the real layout classes and a row box identical to the
 * collapsible trigger, so the swap to data does not move anything.
 */
export default function RankingResultsSkeleton(
  props: RankingResultsSkeletonProps,
) {
  return (
    <section class="ranking-results">
      <AtomSkeleton width="30%" height="var(--text-label-lg)" />
      <div class="ranking-results__filter">
        <div class="ranking-skeleton__field">
          <AtomSkeleton width="40%" height="var(--text-caption-md)" />
          <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
        </div>
      </div>
      <div class="ranking-results__header">
        <AtomSkeleton width="var(--unit-3)" />
        <AtomSkeleton width="35%" />
        <AtomSkeleton width="var(--unit-4)" />
      </div>
      <ul class="ranking-results__groups">
        <For each={Array.from({ length: props.rows ?? 6 })}>
          {() => (
            <li class="ranking-results__group">
              <div class="ranking-results__group-skeleton">
                <span class="ranking-results__summary">
                  <AtomSkeleton width="var(--unit-2)" />
                  <AtomSkeleton width="45%" />
                  <AtomSkeleton width="var(--unit-3)" />
                </span>
                <AtomSkeleton
                  variant="circular"
                  width="var(--unit-2)"
                  height="var(--unit-2)"
                />
              </div>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
