import { createFileRoute, Navigate, Outlet } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { hasAccessToken, useAuthLoading, useAuthUser } from "@/stores/auth/auth";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";

export const Route = createFileRoute("/my")({
  component: MyLayoutPage,
});

function MyLayoutPage() {
  const user = useAuthUser();
  const loading = useAuthLoading();

  const canRenderOptimistically = () =>
    Boolean(user()) || (loading() && hasAccessToken());

  return (
    <Show
      when={canRenderOptimistically()}
      fallback={
        <Show
          when={loading()}
          fallback={<Navigate to={AppRoutePath.HOME as "/"} replace />}
        >
          <div class="page">
            <CardListSkeleton />
          </div>
        </Show>
      }
    >
      <Outlet />
    </Show>
  );
}
