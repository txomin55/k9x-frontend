import { get, writable } from "svelte/store";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import { api } from "$lib/stores/api";
import fetchUserData from "$lib/services/fetch_user_data/fetchUserData";

const auth = writable({
  user: null,
  loading: false,
  error: null,
});

let inFlight = null;

const setUser = (user) => {
  auth.update((state) => ({ ...state, user, loading: false, error: null }));
};

const ensureAuthenticated = async (pathname) => {
  const current = get(auth);
  if (current.user) {
    if (current.loading) auth.update((s) => ({ ...s, loading: false }));
    return;
  }

  if (pathname === "/" || pathname === "/auth/callback") {
    auth.update((s) => ({ ...s, loading: false, error: null }));
    return;
  }

  const apiValue = get(api);
  if (!apiValue?.getUserData) return;

  if (inFlight) return;

  auth.update((s) => ({ ...s, loading: true, error: null }));

  inFlight = fetchUserData(apiValue.getUserData, (d) => setUser(d))
    .then(() => {
      if (pathname === "/") {
        goto(resolve("/home"), { replaceState: true });
      }
    })
    .catch((error) => {
      auth.update((s) => ({ ...s, error }));
      if (pathname !== "/") {
        goto(resolve("/"), { replaceState: true });
      }
    })
    .finally(() => {
      auth.update((s) => ({ ...s, loading: false }));
      inFlight = null;
    });
};

export { auth, ensureAuthenticated, setUser };
