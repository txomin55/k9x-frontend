import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import Carousel from "@lib/components/molecules/carousel/Carousel";
import { useI18n } from "@/stores/i18n/i18n";
import {
  isWalkthroughDisabled,
  setIsWalkthroughPending,
} from "@/components/global/app-shell/layout/walkthrough/walkthroughState";
import breadcrumbsHint from "@/assets/miscelaneous/i_icon.webp";
import loginHint from "@/assets/miscelaneous/walkthrough-login.webp";
import userMenuHint from "@/assets/miscelaneous/walkthrough-user-menu.webp";
import notificationsHint from "@/assets/miscelaneous/walkthrough-notifications.webp";
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

    const events = ["pointerup", "keydown", "wheel", "touchend", "scroll"];
    const openOnFirstInteraction = () => setOpen(true);

    events.forEach((event) =>
      window.addEventListener(event, openOnFirstInteraction, {
        once: true,
        passive: true,
      }),
    );
    onCleanup(() =>
      events.forEach((event) =>
        window.removeEventListener(event, openOnFirstInteraction),
      ),
    );
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDismissed(true);
      setIsWalkthroughPending(false);
    }
  };

  const walkthroughSlides = createMemo(() => [
    <div class="walkthrough__slide">
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
    </div>,
    <div class="walkthrough__slide">
      <figure class="walkthrough__figure">
        <img
          class="walkthrough__image"
          src={loginHint}
          alt={i18n.t("GLOBAL.WALKTHROUGH.LOGIN_IMAGE_ALT")}
        />
      </figure>
      <p class="walkthrough__text">
        {i18n.t("GLOBAL.WALKTHROUGH.LOGIN_FILTERS_MESSAGE")}
      </p>
    </div>,
    <div class="walkthrough__slide">
      <p class="walkthrough__text">
        {i18n.t("GLOBAL.WALKTHROUGH.OFFLINE_MESSAGE")}
      </p>
    </div>,
    <div class="walkthrough__slide">
      <figure class="walkthrough__figure">
        <img
          class="walkthrough__image"
          src={userMenuHint}
          alt={i18n.t("GLOBAL.WALKTHROUGH.USER_MENU_IMAGE_ALT")}
        />
      </figure>
      <p class="walkthrough__text">
        {i18n.t("GLOBAL.WALKTHROUGH.USER_MENU_MESSAGE")}
      </p>
    </div>,
    <div class="walkthrough__slide">
      <figure class="walkthrough__figure">
        <img
          class="walkthrough__image"
          src={notificationsHint}
          alt={i18n.t("GLOBAL.WALKTHROUGH.NOTIFICATIONS_IMAGE_ALT")}
        />
      </figure>
      <p class="walkthrough__text">
        {i18n.t("GLOBAL.WALKTHROUGH.NOTIFICATIONS_MESSAGE")}
      </p>
    </div>,
  ]);

  return (
    <AtomDialog
      closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
      onOpenChange={handleOpenChange}
      open={open()}
      title={i18n.t("GLOBAL.WALKTHROUGH.BREADCRUMBS_TITLE")}
      content={
        <div class="walkthrough">
          <Carousel
            label={i18n.t("GLOBAL.WALKTHROUGH.BREADCRUMBS_TITLE")}
            previousLabel={i18n.t("COMMON.CAROUSEL_PREVIOUS")}
            nextLabel={i18n.t("COMMON.CAROUSEL_NEXT")}
            items={walkthroughSlides()}
          />
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
