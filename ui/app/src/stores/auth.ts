import { createStore } from "solid-js/store";
import fetchUserData from "@/services/fetch_user_data/fetchUserData";
import { stripBasePath } from "@/utils/app-paths";

const [authStore, setAuth] = createStore({
  user: null,
  loading: false,
  error: null,
});

const setUser = (user) => {
  setAuth({
    user,
    loading: false,
    error: null,
  });
};

const fetchUserIfAuthenticated = async (pathname, navigate) => {
  const appPath = stripBasePath(pathname);

  if (appPath === "/auth/callback") return;

  if (authStore.user && !authStore.loading) return;

  const hasToken =
    typeof globalThis !== "undefined" &&
    Boolean(globalThis.localStorage.getItem("k9x_access_token"));

  if (!hasToken && appPath !== "/auth/callback") {
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
