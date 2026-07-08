import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import infoIcon from "@/assets/miscelaneous/info.svg";
import "@/components/common/info-icon/styles.css";

export default function InfoIcon() {
  const i18n = useI18n();

  return (
    <span class="info-icon">
      <AtomSvgIcon src={infoIcon} alt={i18n.t("COMMON.INFO_ICON")} tinted />
    </span>
  );
}
