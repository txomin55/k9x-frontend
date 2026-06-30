import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { createSignal, Index, Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import IconToggleButton from "@/components/common/icon-toggle-button/IconToggleButton";
import type { StageCardProps } from "@/components/routes/stages/stage-card/StageCard.types";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import { canSeeClassification } from "@/utils/event";
import bellIcon from "@/assets/bell.svg";
import "./styles.css";

export default function StageCard(props: StageCardProps) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const [notificationsEnabled, setNotificationsEnabled] = createSignal(false);
  const navigateToClassification = (eventId: string) =>
    void navigate({
      params: { id: props.id, eventId },
      to: "/stages/$id/events/$eventId/classification",
    });

  const navigateToStageInfo = (stageId: string) =>
    void navigate({
      params: { id: stageId },
      to: "/stages/$id/info",
    });

  return (
    <Card
      topLeft={
        <div class="stage-card__main-info">
          <div class="stage-card__country-flag">
            <CountryFlag country={props.country} alt={`${props.name} flag`} />
          </div>
          <span class="text-heading-sm">{props.name}</span>
          <Show when={props.status}>
            {(status) => <StatusBadge status={status()} />}
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
        <div class="stage-card__meta">
          <span class="stage-card__address text-caption-md">
            {props.organizer}
          </span>
          <span class="stage-card__address text-caption-md">
            {props.address}
          </span>
          <span class="stage-card__date text-caption-sm">
            {`${new Date(props.from).toDateString()} - ${new Date(props.to).toDateString()}`}
          </span>
        </div>
      }
      description={
        props.description ? (
          <span class="stage-card__description text-body-md">
            {props.description}
          </span>
        ) : undefined
      }
      content={
        <Index each={props.events}>
          {(event) => (
            <div class="stage-card__events-content">
              <div class="stage-card__events-content--info">
                <span>{event().name}</span>
                <span>({event().competitors})</span>
              </div>
              <Show when={canSeeClassification(event().status)}>
                <AtomButton
                  type={BUTTON_TYPES.PRIMARY}
                  onClick={() => navigateToClassification(event().id)}
                >
                  {i18n.t("STAGES.STAGE_CARD.SEE_CLASSIFICATION")}
                </AtomButton>
              </Show>
            </div>
          )}
        </Index>
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
