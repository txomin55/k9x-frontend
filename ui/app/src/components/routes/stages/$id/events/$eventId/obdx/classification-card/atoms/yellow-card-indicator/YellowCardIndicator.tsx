import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import yellowCardIcon from "@/assets/yellow-card.svg";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function YellowCardIndicator() {
  const i18n = useI18n();

  return (
    <span class="obdx-clf__yellow-card-indicator">
      <AtomSvgIcon
        src={yellowCardIcon}
        alt={i18n.t("STAGES.CLASSIFICATION_CARD.YELLOW_CARD")}
      />
    </span>
  );
}
