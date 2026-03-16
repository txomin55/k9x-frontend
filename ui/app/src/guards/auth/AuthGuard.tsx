import { useLocation, useNavigate } from "@solidjs/router";
import { onMount, Show } from "solid-js";
import { auth, fetchUserIfAuthenticated } from "@/stores/auth";

export default function AuthGuard(props) {
  const location = useLocation();
  const navigate = useNavigate();

  onMount(async () => {
    await fetchUserIfAuthenticated(location.pathname, navigate);
  });

  return (
    <Show
      when={!auth().loading}
      fallback={<p>...Retrieving user information</p>}
    >
      <Show when={auth().user}>ESTAS LOGUEADO</Show>
      {props.children}
    </Show>
  );
}
