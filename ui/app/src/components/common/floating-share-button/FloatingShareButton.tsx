import { useLocation } from "@tanstack/solid-router";
import { Show } from "solid-js";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";
import "./styles.css";

export default function FloatingShareButton() {
  const location = useLocation();
  const i18n = useI18n();

  const isVisible = () => !location().pathname.startsWith("/my");

  const handleShare = async () => {
    const url = globalThis.location.href;
    const shareData = { title: document.title, url };

    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData).catch((error: Error) => {
        if (error.name !== "AbortError") throw error;
      });
      return;
    }

    await navigator.clipboard?.writeText(url);
    showToast(i18n.t("GLOBAL.SHARE.LINK_COPIED"));
  };

  return (
    <Show when={isVisible()}>
      <div class="floating-share-button">
        <CircleButton onClick={handleShare} size="lg">
          <svg
            class="floating-share-button__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-label={i18n.t("GLOBAL.SHARE.SHARE")}
            role="img"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </CircleButton>
      </div>
    </Show>
  );
}
