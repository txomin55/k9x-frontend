import { EventCompetitorResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { Show } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import checkIcon from "@/assets/check.svg";
import BihIndicator from "@/components/common/bih-indicator/BihIndicator";
import "./styles.css";

interface ScoresCompetitorPreLabelProps {
  competitor: EventCompetitorResponseDTO;
  seen: boolean;
}

export default (props: ScoresCompetitorPreLabelProps) => {
  return (
    <div class="scores-competitor-pre-label" style={{ position: "relative" }}>
      <Show when={props.seen}>
        <AtomSvgIcon src={checkIcon} alt="" />
      </Show>
      <Show when={props.competitor.bih}>
        <BihIndicator />
      </Show>
      <span>{props.competitor.position}.-</span>
      <div>
        <span>{props.competitor.country}</span>
        <span>{props.competitor.handler}</span>
      </div>
    </div>
  );
};
