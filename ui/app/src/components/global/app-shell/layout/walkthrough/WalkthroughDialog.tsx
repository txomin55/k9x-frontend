import { createEffect, createSignal, onCleanup } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useI18n } from "@/stores/i18n/i18n";
import {
  isWalkthroughDisabled,
  setIsWalkthroughPending,
} from "@/components/global/app-shell/layout/walkthrough/walkthroughState";
import breadcrumbsHint from "@/assets/miscelaneous/i_icon.webp";
import "@/components/global/app-shell/layout/walkthrough/styles.css";

export default function WalkthroughDialog() {
  const i18n = useI18n();

  const [open, setOpen] = createSignal(false);
  const [dismissed, setDismissed] = createSignal(false);

  createEffect(() => {
    if (isWalkthroughDisabled()) {
      setIsWalkthroughPending(false);
      return;
    }

    if (dismissed()) return;

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setOpen(true), {
        timeout: 2500,
      });
      onCleanup(() => window.cancelIdleCallback(id));
    } else {
      const id = window.setTimeout(() => setOpen(true), 400);
      onCleanup(() => window.clearTimeout(id));
    }
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDismissed(true);
      setIsWalkthroughPending(false);
    }
  };

  return (
    <AtomDialog
      closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
      onOpenChange={handleOpenChange}
      open={open()}
      title={i18n.t("GLOBAL.WALKTHROUGH.BREADCRUMBS_TITLE")}
      content={
        <div class="walkthrough">
          <figure class="walkthrough__figure">
            <img
              class="walkthrough__image"
              src={breadcrumbsHint}
              alt={i18n.t("GLOBAL.WALKTHROUGH.BREADCRUMBS_IMAGE_ALT")}
              width="640"
              height="564"
            />
          </figure>
          <p class="walkthrough__text">
            {i18n.t("GLOBAL.WALKTHROUGH.BREADCRUMBS_MESSAGE")}
          </p>
          <div class="walkthrough__actions">
            <AtomButton
              type={BUTTON_TYPES.PRIMARY}
              onClick={() => handleOpenChange(false)}
            >
              {i18n.t("GLOBAL.WALKTHROUGH.GOT_IT")}
            </AtomButton>
          </div>
        </div>
      }
    />
  );
}
