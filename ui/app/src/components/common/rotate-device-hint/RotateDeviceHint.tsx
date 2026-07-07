import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import rotateDeviceIcon from "@/assets/rotate-device.svg";
import "@/components/common/rotate-device-hint/styles.css";

export default function RotateDeviceHint() {
  const { t } = useI18n();

  return (
    <span class="rotate-device-hint">
      <AtomSvgIcon
        src={rotateDeviceIcon}
        alt={t("COMMON.ROTATE_DEVICE_HINT")}
      />
    </span>
  );
}
