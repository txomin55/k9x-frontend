import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import flameIcon from "@/assets/dogs/bih.svg";
import "@/components/common/bih-indicator/styles.css";

export default function BihIndicator() {
  const i18n = useI18n();

  return (
    <span class="bih-indicator">
      <AtomSvgIcon src={flameIcon} alt={i18n.t("COMMON.BIH_INDICATOR")} />
    </span>
  );
}
