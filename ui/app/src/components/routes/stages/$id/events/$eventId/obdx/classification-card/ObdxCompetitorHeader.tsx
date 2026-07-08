import { Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import BihIndicator from "@/components/common/bih-indicator/BihIndicator";
import NotCompetingIndicator from "@/components/common/not-competing-indicator/NotCompetingIndicator";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import PositionBadge from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-badge/PositionBadge";
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
            <CountryFlag country={props.competitor.country.id} />
          </Show>
          {props.competitor.dog.name}
          <Show when={props.competitor.bih}>
            <BihIndicator />
          </Show>
          <Show when={props.competitor.notCompeting}>
            <NotCompetingIndicator />
          </Show>
          <AwardBadges awards={props.competitor.awards} />
          <Show when={props.competitor.startOrder}>
            <span class="obdx-clf__start-order">
              #{props.competitor.startOrder}
            </span>
          </Show>
        </span>
        <Show when={props.competitor.handler}>
          <span class="obdx-clf__owner text-body-sm">
            {props.competitor.handler}
          </span>
        </Show>
      </div>
    </div>
  );
}
