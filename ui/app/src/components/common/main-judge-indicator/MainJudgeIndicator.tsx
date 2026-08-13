import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import mainJudgeIcon from "@/assets/miscelaneous/main-judge.svg";
import "@/components/common/main-judge-indicator/styles.css";

export default function MainJudgeIndicator() {
  const i18n = useI18n();

  return (
    <span class="main-judge-indicator">
      <AtomSvgIcon
        src={mainJudgeIcon}
        alt={i18n.t("COMMON.MAIN_JUDGE_INDICATOR")}
      />
    </span>
  );
}
