import {AppRoutePath} from "@/components/global/app-shell/paths";
import {
  clearCachedUserData,
  fetchCachedUserData,
  UserProfileResponseDTO,
} from "@/services/secured/fetch-user-data/fetchUserData";
import type {AuthState} from "@/stores/auth/auth.types";
import {ACCESS_TOKEN_KEY, refreshAccessToken} from "@/utils/http/client";
import {clearLocalFirstQueryCache} from "@/utils/local-first/query_snapshots/localFirstQueryCache";
import {clearLocalFirstData} from "@/utils/local-first/storage/localFirstDatabase";
import {createAppStore} from "@/utils/store/createAppStore";
import {stripBasePath} from "@/utils/paths/app-paths";

const { getState, setState, useAppStore } = createAppStore<AuthState>({
  user: null,
  loading: true,
  error: null,
});

const setAuthState = (updater: (state: AuthState) => AuthState) => {
  setState(updater);
};

const setUser = (user: UserProfileResponseDTO | null) => {
  setAuthState(() => ({
    user,
    loading: false,
    error: null,
  }));
};

const recoverSessionFromRefresh = async () => {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) {
    return false;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  try {
    const token = await refreshAccessToken();
    globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
};

const fetchUserIfAuthenticated = async (pathname: string) => {
  const appPath = stripBasePath(pathname);

  if (appPath === AppRoutePath.AUTH_CALLBACK) return;

  const state = getState();

  if (state.user && !state.loading) return;

  const hasToken =
    typeof globalThis !== "undefined" &&
    Boolean(globalThis.localStorage.getItem(ACCESS_TOKEN_KEY));

  if (!hasToken && !(await recoverSessionFromRefresh())) {
    setAuthState((currentState) => ({
      ...currentState,
      user: null,
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

  const result = await fetchCachedUserData().then(
    (user) => ({ user, error: null }),
    (error: unknown) => ({
      user: null,
      error: error instanceof Error ? error : new Error(String(error)),
    }),
  );

  setAuthState((currentState) => ({
    ...currentState,
    user: result.user,
    loading: false,
    error: result.error,
  }));
};

const clearAuth = () => {
  clearCachedUserData();
  clearLocalFirstQueryCache();
  void clearLocalFirstData();
  setUser(null);
};

const useAuth = <TSelected>(selector: (state: AuthState) => TSelected) =>
  useAppStore(selector);

const useAuthUser = () => useAuth((state) => state.user);
const useAuthLoading = () => useAuth((state) => state.loading);

const isOrganizer = () => Boolean(getState().user?.organizer);

const hasAccessToken = () =>
  typeof globalThis !== "undefined" &&
  Boolean(globalThis.localStorage?.getItem(ACCESS_TOKEN_KEY));

export {
  clearAuth,
  fetchUserIfAuthenticated,
  hasAccessToken,
  isOrganizer,
  setUser,
  useAuthLoading,
  useAuthUser,
};
