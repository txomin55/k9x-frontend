import { createRootRoute } from "@tanstack/solid-router";
import AppShell from "@/components/global/app-shell/AppShell";
import { useI18n } from "@/stores/i18n/i18n";

function NotFoundComponent() {
  const i18n = useI18n();
  return <p>{i18n.t("ROOT.PAGE_NOT_FOUND")}</p>;
}

export const Route = createRootRoute({
  component: AppShell,
  /*
  errorComponent: (props) => (
    <div>
      <h1>Unexpected error</h1>
      <p>{String(props.error)}</p>
    </div>
  ),*/
  notFoundComponent: NotFoundComponent,
});
