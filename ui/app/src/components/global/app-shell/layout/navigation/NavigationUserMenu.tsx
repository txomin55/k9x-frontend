import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { createSignal, For, Show } from "solid-js";
import { clearAuth, useAuthUser } from "@/stores/auth/auth";
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
    queryClient.clear();
    clearAuth();
    globalThis.localStorage.removeItem("k9x_access_token");
    await navigate({ to: AppRoutePath.HOME as "/", replace: true });
  };

  return (
    <div class="navigation-tools">
      <div class="navigation-tools__group">
        <p>--Mode</p>
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onToggleMode}>
          {props.isDark ? "--Light" : "--Dark"}
        </AtomButton>
      </div>

      <div class="navigation-tools__group">
        <p>--LOCALES</p>
        <p>--locale - {i18n.locale()}</p>
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
          closeButtonText="--Close dialog"
          content={<ContactForm />}
          onOpenChange={setOpenGenericContactForm}
          open={openGenericContactForm()}
          title="--Contact us"
          trigger={
            <AtomButton type={BUTTON_TYPES.GHOST}>--Contact us</AtomButton>
          }
        />

        <AtomButton onClick={() => displayNotification(mockedNotification)}>
          --Trigger notification
        </AtomButton>

        <Show when={user()}>
          <p>{i18n.t("hello", { name: "txomin" })}</p>
          <AtomButton type={BUTTON_TYPES.PRIMARY} onClick={handleLogout}>
            --Logout
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
