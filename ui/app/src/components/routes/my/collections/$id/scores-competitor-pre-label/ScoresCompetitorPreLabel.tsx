import { EventCompetitorResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { Show } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

interface ScoresCompetitorPreLabelProps {
  competitor: EventCompetitorResponseDTO;
  seen: boolean;
}

export default (props: ScoresCompetitorPreLabelProps) => {
  const i18n = useI18n();
  return (
    <div class="scores-competitor-pre-label" style={{ position: "relative" }}>
      <Show when={props.seen}>
        <span>{i18n.t("MY.COLLECTIONS.DETAIL.READY")}</span>
      </Show>
      <span>{props.competitor.order}.-</span>
      <div>
        <span>{props.competitor.country}</span>
        <span>{props.competitor.owner}</span>
      </div>
    </div>
  );
};
