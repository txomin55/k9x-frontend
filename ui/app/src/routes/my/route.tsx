import { createFileRoute, Navigate, Outlet } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { useAuthLoading, useAuthUser } from "@/stores/auth/auth";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";

export const Route = createFileRoute("/my")({
  component: MyLayoutPage,
});

function MyLayoutPage() {
  const user = useAuthUser();
  const loading = useAuthLoading();

  return (
    <Show
      when={!loading()}
      fallback={
        <div class="page">
          <CardListSkeleton />
        </div>
      }
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
