import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { useEventRankings } from "@/services/fetch-rankings/fetchRankings";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

export interface EventRankingsLinkProps {
  stageId: string;
  eventId: string;
}

/**
 * Entry point to the public ranking results of one event. Renders nothing when the event takes part in no
 * ranking, so it stays out of the way for the common case.
 */
export default function EventRankingsLink(props: EventRankingsLinkProps) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const rankingsQuery = useEventRankings(props.stageId, props.eventId, {
    refetchOnMount: false,
  });

  return (
    <Show when={rankingsQuery.data?.length}>
      <div class="event-rankings-link">
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() =>
            navigate({
              to: "/stages/$id/events/$eventId/rankings",
              params: { id: props.stageId, eventId: props.eventId },
            })
          }
        >
          {i18n.t("STAGES.CLASSIFICATION.SEE_RANKINGS")}
        </AtomButton>
      </div>
    </Show>
  );
}
