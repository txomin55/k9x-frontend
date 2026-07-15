import { AppRoutePath } from "@/components/global/app-shell/paths";
import { resolveAppPath, stripBasePath } from "@/utils/paths/app-paths";

export const GOOGLE_OAUTH_STATE_KEY = "k9x_google_oauth_state";
export const POST_LOGIN_REDIRECT_KEY = "k9x_post_login_redirect";

const capturePostLoginRedirect = () => {
  const { pathname, search, hash } = globalThis.location;
  const routePath = stripBasePath(pathname);

  if (
    routePath === AppRoutePath.AUTH_CALLBACK ||
    routePath === AppRoutePath.HOME
  ) {
    return;
  }

  globalThis.sessionStorage.setItem(
    POST_LOGIN_REDIRECT_KEY,
    `${routePath}${search}${hash}`,
  );
};

const getGoogleRedirectUri = () =>
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${globalThis.location.origin}${resolveAppPath(AppRoutePath.HOME)}`;

export const buildGoogleAuthUrl = ({
  prompt,
  state,
}: {
  prompt?: "none" | "select_account";
  state: string;
}) => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  if (prompt) {
    params.set("prompt", prompt);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const startGoogleInteractiveLogin = () => {
  const state = crypto.randomUUID();
  capturePostLoginRedirect();
  globalThis.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
  globalThis.location.assign(
    buildGoogleAuthUrl({ prompt: "select_account", state }),
  );
};
