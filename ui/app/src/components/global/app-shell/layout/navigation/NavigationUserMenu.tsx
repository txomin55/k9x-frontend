import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { createSignal, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { clearAuth, useAuthUser } from "@/stores/auth/auth";
import { logout } from "@/services/secured/do-logout/doLogout";
import { useI18n } from "@/stores/i18n/i18n";
import { queryClient } from "@/utils/http/query-client";
import { displayNotification } from "@/utils/notifications/notifications";
import mockedNotification from "@/utils/service-worker/native_features/notifications/mockedNotification";
import type { NavigationUserMenuProps } from "@/components/global/app-shell/layout/navigation/NavigationUserMenu.types";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import ContactForm from "@/components/global/app-shell/layout/navigation/ContactForm";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import sunIcon from "@/assets/miscelaneous/sun.svg";
import moonIcon from "@/assets/miscelaneous/moon.svg";

const LOCALE_COUNTRIES: Record<string, string> = {
  en: "gb",
  es: "es",
};

export default function NavigationUserMenu(props: NavigationUserMenuProps) {
  const user = useAuthUser();
  const i18n = useI18n();
  const navigate = useNavigate();

  const [openGenericContactForm, setOpenGenericContactForm] =
    createSignal(false);

  const localeOptions: AtomSelectOption[] = i18n.locales.map((locale) => ({
    label: locale,
    value: locale,
    preLabel: <CountryFlag country={LOCALE_COUNTRIES[locale]} />,
  }));

  const selectedLocale = () =>
    localeOptions.find((option) => option.value === i18n.locale()) ?? null;

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
      <div class="navigation-tools__row">
        <AtomSelect
          placeholder={i18n.t("GLOBAL.NAVIGATION.LOCALE")}
          onChange={(option) => option && i18n.setLocale(option.value)}
          options={localeOptions}
          value={selectedLocale()}
        />

        <div
          class="navigation-tools__theme-toggle"
          title={
            props.isDark
              ? i18n.t("GLOBAL.NAVIGATION.LIGHT")
              : i18n.t("GLOBAL.NAVIGATION.DARK")
          }
        >
          <CircleButton
            onClick={props.onToggleMode}
            size="md"
            type={BUTTON_TYPES.ACCENT}
          >
            <AtomSvgIcon
              alt={
                props.isDark
                  ? i18n.t("GLOBAL.NAVIGATION.LIGHT")
                  : i18n.t("GLOBAL.NAVIGATION.DARK")
              }
              src={props.isDark ? moonIcon : sunIcon}
              tinted
            />
          </CircleButton>
        </div>
      </div>

      <div class="navigation-tools__actions">
        <AtomButton
          onClick={() => displayNotification(mockedNotification)}
          size="sm"
          type={BUTTON_TYPES.GHOST}
        >
          {i18n.t("GLOBAL.NAVIGATION.TRIGGER_NOTIFICATION")}
        </AtomButton>
      </div>

      <Show when={user()}>
        <div class="navigation-tools__divider" />
        <div class="navigation-tools__bottom">
          <AtomDialog
            closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
            content={
              <ContactForm onClose={() => setOpenGenericContactForm(false)} />
            }
            onOpenChange={setOpenGenericContactForm}
            open={openGenericContactForm()}
            title={i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
            trigger={
              <AtomButton size="sm" type={BUTTON_TYPES.GHOST}>
                {i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
              </AtomButton>
            }
          />
          <AtomButton
            class="navigation-tools__logout"
            onClick={handleLogout}
            size="sm"
            type={BUTTON_TYPES.ACCENT}
          >
            {i18n.t("GLOBAL.NAVIGATION.LOGOUT")}
          </AtomButton>
        </div>
      </Show>
    </div>
  );
}
