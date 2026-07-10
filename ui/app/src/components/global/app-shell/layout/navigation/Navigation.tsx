import { Link } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import "@/components/global/app-shell/layout/navigation/styles.css";
import { Show } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";

export default function Navigation() {
  const user = useAuthUser();
  const i18n = useI18n();

  return (
    <nav class="navigation__sidebar-panel--navigation">
      <Link
        to={AppRoutePath.HOME as "/"}
        activeOptions={{ exact: true }}
        activeProps={{ class: "navigation__link--active" }}
      >
        {i18n.t("GLOBAL.NAVIGATION.LANDING")}
      </Link>
      <Link
        to={AppRoutePath.STAGES as "/stages"}
        activeProps={{ class: "navigation__link--active" }}
      >
        {i18n.t("GLOBAL.NAVIGATION.STAGES")}
      </Link>
      <Show when={user()}>
        <p>{i18n.t("GLOBAL.NAVIGATION.MY")}</p>
        <Show when={user()?.organizer}>
          <Link
            to={AppRoutePath.MY_COMPETITIONS as never}
            activeProps={{ class: "navigation__link--active" }}
          >
            {i18n.t("GLOBAL.NAVIGATION.COMPETITIONS")}
          </Link>
          <Link
            to={AppRoutePath.MY_JUDGES as never}
            activeProps={{ class: "navigation__link--active" }}
          >
            {i18n.t("GLOBAL.NAVIGATION.JUDGES")}
          </Link>
        </Show>
        <Link
          to={AppRoutePath.MY_COLLECTIONS as never}
          activeProps={{ class: "navigation__link--active" }}
        >
          {i18n.t("GLOBAL.NAVIGATION.COLLECTIONS")}
        </Link>
        <Link
          to={AppRoutePath.MY_DOGS as never}
          activeProps={{ class: "navigation__link--active" }}
        >
          {i18n.t("GLOBAL.NAVIGATION.DOGS")}
        </Link>
      </Show>
    </nav>
  );
}
