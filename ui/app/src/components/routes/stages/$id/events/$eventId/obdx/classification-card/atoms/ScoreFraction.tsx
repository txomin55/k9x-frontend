import {
  formatScore,
  ratingColorClass,
} from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { ScoreFractionProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/ScoreFraction.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function ScoreFraction(props: ScoreFractionProps) {
  const color = () => ratingColorClass(props.rating);

  return (
    <span
      class="obdx-clf__fraction"
      classList={{
        "is-green": color() === "green",
        "is-yellow": color() === "yellow",
        "is-red": color() === "red",
        "is-grey": color() === "grey",
      }}
    >
      {formatScore(props.score)}
      <span class="obdx-clf__fraction-max">/{formatScore(props.max)}</span>
    </span>
  );
}
