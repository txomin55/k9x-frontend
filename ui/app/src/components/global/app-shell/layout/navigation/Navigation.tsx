import { Link } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import "@/components/global/app-shell/layout/navigation/styles.css";
import { Show, Suspense } from "solid-js";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { useCollections } from "@/services/secured/collection-crud/collectionCrud";
import { isOffline } from "@/utils/local-first/localFirstPolicy";

function CollectionsLink() {
  const i18n = useI18n();
  const collectionsQuery = useCollections({ refetchOnMount: !isOffline() });

  return (
    <Show when={collectionsQuery.data?.length}>
      <Link
        to={AppRoutePath.MY_COLLECTIONS as never}
        activeProps={{ class: "navigation__link--active" }}
      >
        {i18n.t("GLOBAL.NAVIGATION.COLLECTIONS")}
      </Link>
    </Show>
  );
}

export default function Navigation() {
  const user = useAuthUser();
  const i18n = useI18n();

  return (
    <nav class="navigation__sidebar-panel--navigation">
      <Show when={!user()}>
        <Link
          to={AppRoutePath.HOME as "/"}
          activeOptions={{ exact: true }}
          activeProps={{ class: "navigation__link--active" }}
        >
          {i18n.t("GLOBAL.NAVIGATION.LANDING")}
        </Link>
      </Show>
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
        <Suspense fallback={null}>
          <CollectionsLink />
        </Suspense>
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
