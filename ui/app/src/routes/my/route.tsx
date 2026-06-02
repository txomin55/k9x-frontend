import { createFileRoute, Navigate, Outlet } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { useAuthLoading, useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";

export const Route = createFileRoute("/my")({
  component: MyLayoutPage,
});

function MyLayoutPage() {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const i18n = useI18n();

  return (
    <Show
      when={!loading()}
      fallback={<span>{i18n.t("MY.LOADING_USER_DATA")}</span>}
    >
      <Show
        when={user()}
        fallback={<Navigate to={AppRoutePath.HOME as "/"} replace />}
      >
        <Outlet />
      </Show>
    </Show>
  );
}
