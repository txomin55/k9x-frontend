import { Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import BihIndicator from "@/components/common/bih-indicator/BihIndicator";
import ReserveIndicator from "@/components/common/reserve-indicator/ReserveIndicator";
import NotCompetingIndicator from "@/components/common/not-competing-indicator/NotCompetingIndicator";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import PositionBadge from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-badge/PositionBadge";
import { isLive, type TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type ObdxCompetitorHeaderProps = {
  competitor: StageEventClassificationItemResponseDTO;
  trend?: TrendDirection;
};

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
          <Show when={props.competitor.reserve}>
            <ReserveIndicator />
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
