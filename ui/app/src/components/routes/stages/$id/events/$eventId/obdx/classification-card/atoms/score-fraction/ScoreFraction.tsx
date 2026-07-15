import { ratingColorClass } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type ScoreFractionProps = {
  score: number | null | undefined;
  max: number;
  rating: number | null | undefined;
};

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
      {props.score ?? "-"}
      <span class="obdx-clf__fraction-max">/{props.max}</span>
    </span>
  );
}
