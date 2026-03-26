import { Link } from "@tanstack/solid-router";
import { AppRoutePath } from "@/components/router/paths";
import { useAuthUser } from "@/stores/auth";
import "@/components/navigation/styles.css";
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
          <Link to={AppRoutePath.HOME as "/"}>--Events</Link>
          <Show when={user()}>
            <Link to={AppRoutePath.MY_COMPETITIONS as never}>
              --My competitions
            </Link>
          </Show>
        </nav>
      </div>
    </aside>
  );
}
