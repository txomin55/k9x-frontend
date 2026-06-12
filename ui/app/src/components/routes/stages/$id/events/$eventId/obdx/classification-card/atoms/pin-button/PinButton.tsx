import IconToggleButton from "@/components/common/icon-toggle-button/IconToggleButton";
import { useI18n } from "@/stores/i18n/i18n";
import pinIcon from "@/assets/pin.svg";
import type { PinButtonProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/pin-button/PinButton.types";

export default function PinButton(props: PinButtonProps) {
  const { t } = useI18n();

  return (
    <IconToggleButton
      src={pinIcon}
      active={props.pinned}
      activeLabel={t("STAGES.CLASSIFICATION_CARD.UNPIN")}
      inactiveLabel={t("STAGES.CLASSIFICATION_CARD.PIN")}
      disabled={props.disabled}
      onToggle={props.onToggle}
    />
  );
}
