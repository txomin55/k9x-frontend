import { Show } from "solid-js";
import { ratingColorClass } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import YellowCardIndicator from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/yellow-card-indicator/YellowCardIndicator";
import type { ScoreChipProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/score-chip/ScoreChip.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function ScoreChip(props: ScoreChipProps) {
  const color = () =>
    props.value === null ? "grey" : ratingColorClass(props.rating);
  const display = () => (props.value === null ? "—" : props.value);

  return (
    <span
      class="obdx-clf__chip"
      classList={{
        "obdx-clf__chip--square": props.shape === "square",
        "obdx-clf__chip--pill": props.shape === "pill",
        "is-green": color() === "green",
        "is-yellow": color() === "yellow",
        "is-red": color() === "red",
        "is-grey": color() === "grey",
      }}
    >
      <span class="obdx-clf__chip-value">{display()}</span>
      <Show when={props.sublabel}>
        <span class="obdx-clf__chip-sub">{props.sublabel}</span>
      </Show>
      <Show when={props.hasYellowCard}>
        <YellowCardIndicator />
      </Show>
    </span>
  );
}
