import { Show } from "solid-js";
import { ratingColor } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import YellowCardIndicator from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/yellow-card-indicator/YellowCardIndicator";
import RedCardIndicator from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/red-card-indicator/RedCardIndicator";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type ScoreChipShape = "square" | "pill";

export type ScoreChipProps = {
  value: number | null;
  rating: number | null | undefined;
  shape: ScoreChipShape;
  sublabel?: string;
  hasYellowCard?: boolean;
  hasRedCard?: boolean;
  applies?: boolean;
};

export default function ScoreChip(props: ScoreChipProps) {
  const color = () =>
    props.value === null || props.applies === false
      ? null
      : ratingColor(props.rating);
  const display = () => (props.value === null ? "—" : props.value);

  return (
    <span
      class="obdx-clf__chip"
      classList={{
        "obdx-clf__chip--square": props.shape === "square",
        "obdx-clf__chip--pill": props.shape === "pill",
        "is-graded": color() !== null,
        "is-grey": color() === null,
      }}
      style={color() === null ? undefined : { "--rating-color": color()! }}
    >
      <span class="obdx-clf__chip-value">{display()}</span>
      <Show when={props.sublabel}>
        <span class="obdx-clf__chip-sub">{props.sublabel}</span>
      </Show>
      <Show when={props.hasYellowCard || props.hasRedCard}>
        <span class="obdx-clf__card-indicators">
          <Show when={props.hasYellowCard}>
            <YellowCardIndicator />
          </Show>
          <Show when={props.hasRedCard}>
            <RedCardIndicator />
          </Show>
        </span>
      </Show>
    </span>
  );
}
