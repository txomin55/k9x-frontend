import { useI18n } from "@/stores/i18n/i18n";
import type { PinButtonProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/PinButton.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function PinButton(props: PinButtonProps) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      class="obdx-clf__pin"
      classList={{ "obdx-clf__pin--pinned": props.pinned }}
      title={
        props.pinned
          ? t("STAGES.CLASSIFICATION_CARD.UNPIN")
          : t("STAGES.CLASSIFICATION_CARD.PIN")
      }
      aria-pressed={props.pinned ? "true" : "false"}
      onClick={() => props.onToggle?.()}
    >
      <svg
        class="obdx-clf__pin-icon"
        viewBox="0 0 24 24"
        fill={props.pinned ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
      </svg>
    </button>
  );
}
