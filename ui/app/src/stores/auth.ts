import { AppRoutePath } from "@/components/router/paths";
import {
  clearCachedUserData,
  fetchCachedUserData,
} from "@/services/fetch_user_data/fetchUserData";
import type { User } from "@/services/fetch_user_data/UserResponse.types";
import type { AuthState } from "@/stores/auth.types";
import { createAppStore } from "@/utils/store/createAppStore";
import { stripBasePath } from "@/utils/routes/app-paths";

const { getState, setState, useAppStore } = createAppStore<AuthState>({
  user: null,
  loading: false,
  error: null,
});

const setAuthState = (updater: (state: AuthState) => AuthState) => {
  setState(updater);
};

const setUser = (user: User | null) => {
  setAuthState(() => ({
    user,
    loading: false,
    error: null,
  }));
};

const fetchUserIfAuthenticated = async (
  pathname: string,
  navigate: (path: string) => void,
) => {
  const appPath = stripBasePath(pathname);

  if (appPath === AppRoutePath.AUTH_CALLBACK) return;

  const state = getState();

  if (state.user && !state.loading) return;

  const hasToken =
    typeof globalThis !== "undefined" &&
    Boolean(globalThis.localStorage.getItem("k9x_access_token"));

  if (!hasToken && appPath !== AppRoutePath.AUTH_CALLBACK) {
    setAuthState((currentState) => ({
      ...currentState,
      loading: false,
      error: null,
    }));
    return;
  }

  setAuthState((currentState) => ({
    ...currentState,
    loading: true,
    error: null,
  }));

  setUser(await fetchCachedUserData());
  navigate(appPath);
};

const clearAuth = () => {
  clearCachedUserData();
  setUser(null);
};

const useAuth = <TSelected>(selector: (state: AuthState) => TSelected) =>
  useAppStore(selector);

const useAuthUser = () => useAuth((state) => state.user);

export { clearAuth, fetchUserIfAuthenticated, setUser, useAuthUser };
