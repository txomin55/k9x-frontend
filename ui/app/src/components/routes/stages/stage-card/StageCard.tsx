import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { createSignal, Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import IconToggleButton from "@/components/common/icon-toggle-button/IconToggleButton";
import type { StageCardProps } from "@/components/routes/stages/stage-card/StageCard.types";
import StageCardEventsContent from "@/components/routes/stages/stage-card/StageCardEventsContent";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import bellIcon from "@/assets/miscelaneous/bell.svg";
import { isStageLive } from "@/utils/stage";
import { formatStageDateRange } from "@/utils/date";
import "./styles.css";

export default function StageCard(props: StageCardProps) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = createSignal(false);

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
        <div class="stage-card__notifications">
          <IconToggleButton
            src={bellIcon}
            active={notificationsEnabled()}
            activeLabel={i18n.t("STAGES.STAGE_CARD.UNNOTIFY")}
            inactiveLabel={i18n.t("STAGES.STAGE_CARD.NOTIFY")}
            onToggle={() => setNotificationsEnabled((enabled) => !enabled)}
          />
        </div>
      }
      subHeader={
        props.competitionName ? (
          <span class="stage-card__description text-body-md">
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
        </div>
      }
    />
  );
}
