import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { createSignal, Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import StageNotificationsToggle from "@/components/common/stage-notifications-toggle/StageNotificationsToggle";
import type {
  CompetitionSource,
  StageEventSummaryResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";
import StageCardEventsContent from "@/components/routes/stages/stage-card/StageCardEventsContent";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import { isStageLive, STAGE_STATUS } from "@/utils/stage";
import { formatStageDateRange } from "@/utils/date";
import "./styles.css";

export interface StageCardProps {
  /** Whether any event of the trial is included in a ranking. */
  includesRankings?: boolean;
  address?: string;
  country: string;
  competitionName?: string;
  events: StageEventSummaryResponseDTO[];
  from: number;
  id: string;
  name: string;
  status?: string;
  to: number;
  organizer: string;
  source?: CompetitionSource;
  onEnroll?: (eventId: string) => void;
}

export default function StageCard(props: StageCardProps) {
  const navigate = useNavigate();
  const i18n = useI18n();

  const eventIds = () => props.events.map((event) => event.id);

  const navigateToStageInfo = (stageId: string) =>
    void navigate({
      params: { id: stageId },
      to: "/stages/$id/info",
    });

  return (
    <Card
      topLeft={
        <div class="stage-card__main-info">
          <CountryFlag country={props.country} alt={`${props.name} flag`} />
          <span class="text-heading-sm">{props.name}</span>
          <Show when={props.status && isStageLive(props.status)}>
            <StatusBadge status={props.status!} dotMode />
          </Show>
        </div>
      }
      topRight={
        <Show when={props.status !== STAGE_STATUS.FINISHED}>
          <div class="stage-card__notifications">
            <StageNotificationsToggle eventIds={eventIds()} />
          </div>
        </Show>
      }
      subHeader={
        props.competitionName ? (
          <span class="stage-card__description text-body-sm">
            {props.competitionName}
          </span>
        ) : undefined
      }
      description={
        <div class="stage-card__meta">
          <span class="stage-card__address text-caption-md">
            {formatStageDateRange(props.from, props.to)}
          </span>
          <span class="stage-card__address text-caption-md">
            {props.address}
          </span>
          <span class="stage-card__date text-caption-sm">
            {props.organizer}
          </span>
        </div>
      }
      content={
        <StageCardEventsContent
          id={props.id}
          events={props.events}
          onEnroll={props.onEnroll}
        />
      }
      actions={
        <div class="stage-card__actions">
          <AtomButton
            type={BUTTON_TYPES.ACCENT}
            onClick={() => navigateToStageInfo(props.id)}
          >
            {i18n.t("STAGES.STAGE_CARD.INFO")}
          </AtomButton>
          <div class="stage-card__legends">
            {/* The trial detail carries the full warning; here it is a footnote. */}
            <Show when={props.source === "EXTRACTION"}>
              <span class="stage-card__legend">
                {i18n.t("COMMON.EXTRACTION_BANNER.CARD_NOTE")}
              </span>
            </Show>
            {/* Informative only: which rankings, and their results, live behind each event. */}
            <Show when={props.includesRankings}>
              <span class="stage-card__legend">
                {i18n.t("STAGES.STAGE_CARD.INCLUDES_RANKINGS")}
              </span>
            </Show>
          </div>
        </div>
      }
    />
  );
}
