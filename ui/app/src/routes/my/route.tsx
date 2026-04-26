import { createFileRoute, Navigate, Outlet } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { useAuthLoading, useAuthUser } from "@/stores/auth";

export const Route = createFileRoute("/my")({
  component: MyLayoutPage,
});

function MyLayoutPage() {
  const user = useAuthUser();
  const loading = useAuthLoading();

  if (loading()) {
    return <span>--Loading user data</span>;
  }

  if (!user()) {
    return <Navigate to={AppRoutePath.HOME as "/"} replace />;
  }

  return <Outlet />;
}
