import { Show } from "solid-js";
import PositionMedal
  from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal";
import type { TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type PositionBadgeProps = {
  position: number;
  tied: boolean;
  live: boolean;
  trend?: TrendDirection;
};

export default function PositionBadge(props: PositionBadgeProps) {
  return (
    <div class="obdx-clf__position-col">
      <Show when={props.live}>
        <span class="obdx-clf__live-dot" aria-hidden="true" />
      </Show>
      <span class="obdx-clf__position text-heading-lg">
        #{props.position}
        <Show when={props.tied}>
          <span class="obdx-clf__tied">=</span>
        </Show>
      </span>
      <Show when={props.position <= 3}>
        <PositionMedal position={props.position as 1 | 2 | 3} />
      </Show>
      <Show when={props.trend && props.trend !== "same"}>
        <span
          class="obdx-clf__trend"
          classList={{
            "is-up": props.trend === "up",
            "is-down": props.trend === "down",
          }}
          aria-hidden="true"
        >
          {props.trend === "up" ? "↑" : "↓"}
        </span>
      </Show>
    </div>
  );
}
