import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { createSignal, For, Show } from "solid-js";
import { clearAuth, useAuthUser } from "@/stores/auth/auth";
import { logout } from "@/services/secured/do-logout/doLogout";
import { useI18n } from "@/stores/i18n/i18n";
import { queryClient } from "@/utils/http/query-client";
import { displayNotification } from "@/utils/notifications/notifications";
import mockedNotification from "@/utils/service-worker/native_features/notifications/mockedNotification";
import type { NavigationUserMenuProps } from "@/components/global/app-shell/layout/navigation/NavigationUserMenu.types";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import ContactForm from "@/components/global/app-shell/layout/navigation/ContactForm";

export default function NavigationUserMenu(props: NavigationUserMenuProps) {
  const user = useAuthUser();
  const i18n = useI18n();
  const navigate = useNavigate();

  const [openGenericContactForm, setOpenGenericContactForm] =
    createSignal(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Best-effort: clear the client session even if the server call fails.
    }
    queryClient.clear();
    clearAuth();
    globalThis.localStorage.removeItem("k9x_access_token");
    await navigate({ to: AppRoutePath.HOME as "/", replace: true });
  };

  return (
    <div class="navigation-tools">
      <div class="navigation-tools__group">
        <p>{i18n.t("GLOBAL.NAVIGATION.MODE")}</p>
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onToggleMode}>
          {props.isDark ? i18n.t("GLOBAL.NAVIGATION.LIGHT") : i18n.t("GLOBAL.NAVIGATION.DARK")}
        </AtomButton>
      </div>

      <div class="navigation-tools__group">
        <p>{i18n.t("GLOBAL.NAVIGATION.LOCALES")}</p>
        <p>{i18n.t("GLOBAL.NAVIGATION.LOCALE")} - {i18n.locale()}</p>
        <div class="navigation-tools__locales">
          <For each={i18n.locales}>
            {(nextLocale) => (
              <AtomButton
                type={BUTTON_TYPES.PRIMARY}
                onClick={() => i18n.setLocale(nextLocale)}
              >
                {nextLocale}
              </AtomButton>
            )}
          </For>
        </div>

        <AtomDialog
          closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
          content={<ContactForm onClose={() => setOpenGenericContactForm(false)} />}
          onOpenChange={setOpenGenericContactForm}
          open={openGenericContactForm()}
          title={i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
          trigger={
            <AtomButton type={BUTTON_TYPES.GHOST}>{i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}</AtomButton>
          }
        />

        <AtomButton onClick={() => displayNotification(mockedNotification)}>
          {i18n.t("GLOBAL.NAVIGATION.TRIGGER_NOTIFICATION")}
        </AtomButton>

        <Show when={user()}>
          <p>{i18n.t("GLOBAL.NAVIGATION.HELLO", { name: "txomin" })}</p>
          <AtomButton type={BUTTON_TYPES.PRIMARY} onClick={handleLogout}>
            {i18n.t("GLOBAL.NAVIGATION.LOGOUT")}
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
