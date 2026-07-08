import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import redCardIcon from "@/assets/dogs/red-card.svg";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function RedCardIndicator() {
  const i18n = useI18n();

  return (
    <span class="obdx-clf__red-card-indicator">
      <AtomSvgIcon
        src={redCardIcon}
        alt={i18n.t("STAGES.CLASSIFICATION_CARD.RED_CARD")}
      />
    </span>
  );
}
