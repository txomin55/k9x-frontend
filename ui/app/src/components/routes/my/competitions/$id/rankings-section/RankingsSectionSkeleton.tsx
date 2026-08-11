import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import RankingResultsSkeleton from "./RankingResultsSkeleton";
import "./styles.css";

/** Name field, configurator and results: the shape the section takes once the ranking is read. */
export default function RankingsSectionSkeleton() {
  return (
    <section class="rankings-section">
      <div class="rankings-section__name">
        <div class="ranking-skeleton__field">
          <AtomSkeleton width="40%" height="var(--text-caption-md)" />
          <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
        </div>
      </div>
      <div class="ranking-configurator">
        <div class="ranking-configurator__picker">
          <div class="ranking-skeleton__field">
            <AtomSkeleton width="40%" height="var(--text-caption-md)" />
            <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
          </div>
          <div class="ranking-skeleton__field">
            <AtomSkeleton width="40%" height="var(--text-caption-md)" />
            <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
          </div>
        </div>
        <div class="ranking-configurator__criteria">
          <div class="ranking-skeleton__field">
            <AtomSkeleton width="40%" height="var(--text-caption-md)" />
            <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
          </div>
          <div class="ranking-skeleton__field">
            <AtomSkeleton width="40%" height="var(--text-caption-md)" />
            <AtomSkeleton height="var(--unit-5)" radius="var(--radius-md)" />
          </div>
        </div>
      </div>
      <RankingResultsSkeleton rows={4} />
    </section>
  );
}
