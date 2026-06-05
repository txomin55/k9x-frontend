import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import pinIcon from "@/assets/pin.svg";
import type { PinButtonProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/PinButton.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function PinButton(props: PinButtonProps) {
  const { t } = useI18n();
  const label = () =>
    props.pinned
      ? t("STAGES.CLASSIFICATION_CARD.UNPIN")
      : t("STAGES.CLASSIFICATION_CARD.PIN");

  return (
    <button
      type="button"
      class="obdx-clf__pin"
      classList={{ "obdx-clf__pin--pinned": props.pinned }}
      title={label()}
      aria-pressed={props.pinned ? "true" : "false"}
      onClick={() => props.onToggle?.()}
    >
      <AtomSvgIcon src={pinIcon} alt={label()} />
    </button>
  );
}
