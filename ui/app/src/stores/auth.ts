import { createStore } from "solid-js/store";
import { AppRoutePath } from "@/components/router/paths";
import fetchUserData from "@/services/fetch_user_data/fetchUserData";
import type { User } from "@/services/fetch_user_data/UserResponse";
import { stripBasePath } from "@/utils/app-paths";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};

const [authStore, setAuth] = createStore({
  user: null,
  loading: false,
  error: null,
} as AuthState);

const setUser = (user: User | null) => {
  setAuth({
    user,
    loading: false,
    error: null,
  });
};

const fetchUserIfAuthenticated = async (
  pathname: string,
  navigate: (path: string) => void,
) => {
  const appPath = stripBasePath(pathname);

  if (appPath === AppRoutePath.AUTH_CALLBACK) return;

  if (authStore.user && !authStore.loading) return;

  const hasToken =
    typeof globalThis !== "undefined" &&
    Boolean(globalThis.localStorage.getItem("k9x_access_token"));

  if (!hasToken && appPath !== AppRoutePath.AUTH_CALLBACK) {
    setAuth({
      ...authStore,
      loading: false,
      error: null,
    });
    return;
  }

  setAuth({
    ...authStore,
    loading: true,
    error: null,
  });

  setUser(await fetchUserData());
  navigate(appPath);
};

const auth = () => authStore;

export { auth, fetchUserIfAuthenticated, setUser };
