import { Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import PositionBadge from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/PositionBadge";
import { isLive } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { ObdxCompetitorHeaderProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function ObdxCompetitorHeader(props: ObdxCompetitorHeaderProps) {
  return (
    <div class="obdx-clf__competitor">
      <PositionBadge
        position={props.competitor.position}
        tied={props.competitor.tied}
        live={isLive(props.competitor.status)}
        trend={props.trend}
      />
      <div class="obdx-clf__info">
        <span class="obdx-clf__dog text-heading-xs">
          <Show when={props.competitor.country}>
            <CountryFlag
              country={props.competitor.country}
              width={16}
              height={16}
            />
          </Show>
          {props.competitor.dog.name}
        </span>
        <Show when={props.competitor.owner}>
          <span class="obdx-clf__owner text-body-sm">
            {props.competitor.owner}
          </span>
        </Show>
      </div>
    </div>
  );
}
