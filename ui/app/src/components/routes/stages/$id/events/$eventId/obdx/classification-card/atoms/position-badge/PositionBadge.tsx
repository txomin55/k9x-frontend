import { Show } from "solid-js";
import PositionMedal from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal";
import type { PositionBadgeProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-badge/PositionBadge.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function PositionBadge(props: PositionBadgeProps) {
  return (
    <div class="obdx-clf__position-col">
      <Show when={props.live}>
        <span class="obdx-clf__live-dot" aria-hidden="true" />
      </Show>
      <Show
        when={props.position <= 3 && !props.tied}
        fallback={
          <span class="obdx-clf__position text-heading-lg">
            #{props.position}
            <Show when={props.tied}>
              <span class="obdx-clf__tied">=</span>
            </Show>
          </span>
        }
      >
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
