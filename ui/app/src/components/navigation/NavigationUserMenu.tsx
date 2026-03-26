import AtomButton from "@lib/components/atoms/button/AtomButton";
import { For, Show } from "solid-js";
import { clearAuth, useAuthUser } from "@/stores/auth";
import { useI18n } from "@/stores/i18n";
import { queryClient } from "@/utils/http/query-client";
import { displayNotification } from "@/utils/notifications/notifications";
import mockedNotification from "@/utils/service_worker/native_features/notifications/mockedNotification";
import type { NavigationUserMenuProps } from "@/components/navigation/NavigationUserMenu.types";

export default function NavigationUserMenu(props: NavigationUserMenuProps) {
  const user = useAuthUser();
  const i18n = useI18n();

  const handleLogout = () => {
    queryClient.clear();
    clearAuth();
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  return (
    <div class="navigation-tools">
      <div class="navigation-tools__group">
        <p>--Mode</p>
        <AtomButton type="accent" onClick={props.onToggleMode}>
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
                type="primary"
                onClick={() => i18n.setLocale(nextLocale)}
              >
                {nextLocale}
              </AtomButton>
            )}
          </For>
        </div>

        <button
          class="news-visualizer__toast-button"
          onClick={() => displayNotification(mockedNotification)}
        >
          --Trigger notification
        </button>

        <Show when={user()}>
          <p>{i18n.t("hello", { name: "txomin" })}</p>
          <AtomButton type="primary" onClick={handleLogout}>
            --Logout
          </AtomButton>
        </Show>
      </div>
    </div>
  );
}
