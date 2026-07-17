import { ratingColor } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type ScoreFractionProps = {
  score: number | null | undefined;
  max: number;
  rating: number | null | undefined;
};

export default function ScoreFraction(props: ScoreFractionProps) {
  const color = () => ratingColor(props.rating);

  return (
    <span
      class="obdx-clf__fraction"
      classList={{
        "is-graded": color() !== null,
        "is-grey": color() === null,
      }}
      style={color() === null ? undefined : { "--rating-color": color()! }}
    >
      {props.score ?? "-"}
      <span class="obdx-clf__fraction-max">/{props.max}</span>
    </span>
  );
}
