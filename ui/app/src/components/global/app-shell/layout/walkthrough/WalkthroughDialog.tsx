import { createEffect, createSignal } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useI18n } from "@/stores/i18n/i18n";
import {
  isWalkthroughDisabled,
  setIsWalkthroughPending,
} from "@/components/global/app-shell/layout/walkthrough/walkthroughState";
import breadcrumbsHint from "@/assets/miscelaneous/i_icon.png";
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

    if (!dismissed() && i18n.translationsLoaded()) {
      setOpen(true);
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
