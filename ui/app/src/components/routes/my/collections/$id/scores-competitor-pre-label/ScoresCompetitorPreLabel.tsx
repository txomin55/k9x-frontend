import { EventCompetitor } from "@/services/api/event-crud/eventCrud.types";
import { Show } from "solid-js";
import "./styles.css";

interface ScoresCompetitorPreLabelProps {
  competitor: EventCompetitor;
  seen: boolean;
}

export default (props: ScoresCompetitorPreLabelProps) => {
  return (
    <div class="scores-competitor-pre-label" style={{ position: "relative" }}>
      <Show when={props.seen}>
        <span>--R</span>
      </Show>
      <span>{props.competitor.order}.-</span>
      <div>
        <span>{props.competitor.country}</span>
        <span>{props.competitor.owner}</span>
      </div>
    </div>
  );
};
