import { useI18n } from "@/stores/i18n/i18n";
import "@/components/common/not-competing-indicator/styles.css";

export default function NotCompetingIndicator() {
  const i18n = useI18n();

  return (
    <span
      class="not-competing-indicator"
      role="img"
      aria-label={i18n.t("COMMON.NOT_COMPETING_INDICATOR")}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </span>
  );
}
