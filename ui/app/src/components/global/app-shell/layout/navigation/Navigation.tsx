import { Link } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { useAuthUser } from "@/stores/auth";
import "@/components/global/app-shell/layout/navigation/styles.css";
import { Show } from "solid-js";

export default function Navigation(props) {
  const user = useAuthUser();

  return (
    <aside
      class="navigation__sidebar"
      classList={{
        "navigation__sidebar--desktop": props.isDesktop,
        "navigation__sidebar--mobile": !props.isDesktop,
        "navigation__sidebar--open": props.isNavOpen,
      }}
      id={props.id}
    >
      <div class="navigation__sidebar-panel">
        <nav class="navigation__sidebar-panel--navigation">
          <Link to={AppRoutePath.HOME as "/"}>--Stages</Link>
          <Show when={user()}>
            <p>--My</p>
            <Link to={AppRoutePath.MY_COMPETITIONS as never}>
              --Competitions
            </Link>
            <Link to={AppRoutePath.MY_JUDGES as never}>--Judges</Link>
            <Link to={AppRoutePath.MY_DOGS as never}>--Dogs</Link>
          </Show>
        </nav>
      </div>
    </aside>
  );
}
