import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import reserveIcon from "@/assets/dogs/reserve-badge.svg";
import "@/components/common/reserve-indicator/styles.css";

export default function ReserveIndicator() {
  const i18n = useI18n();

  return (
    <span class="reserve-indicator">
      <AtomSvgIcon src={reserveIcon} alt={i18n.t("COMMON.RESERVE_INDICATOR")} />
    </span>
  );
}
