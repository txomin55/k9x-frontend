import { useLocation } from "@tanstack/solid-router";
import { Show } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { showToast } from "@/stores/toast/toast";
import shareIcon from "@/assets/miscelaneous/share.svg";
import "./styles.css";

export default function FloatingShareButton() {
  const location = useLocation();
  const i18n = useI18n();
  const user = useAuthUser();

  const isVisible = () =>
    Boolean(user()) && !location().pathname.startsWith("/my");

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
      <button
        type="button"
        class="floating-share-button"
        onClick={handleShare}
        aria-label={i18n.t("GLOBAL.SHARE.SHARE")}
      >
        <AtomSvgIcon
          src={shareIcon}
          alt={i18n.t("GLOBAL.SHARE.SHARE")}
          tinted
        />
      </button>
    </Show>
  );
}
