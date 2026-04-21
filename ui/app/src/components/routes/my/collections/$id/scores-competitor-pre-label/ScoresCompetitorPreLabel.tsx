import { EventCompetitor } from "@/services/api/event-crud/eventCrud.types";

interface ScoresCompetitorPreLabelProps {
  competitor: EventCompetitor;
}

export default (props: ScoresCompetitorPreLabelProps) => {
  return (
    <div class="scores-competitor-pre-label">
      <span>{props.competitor.order}</span>
      <div>
        <span>{props.competitor.country}</span>
        <span>{props.competitor.owner}</span>
      </div>
    </div>
  );
};
