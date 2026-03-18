import OpenAPIClientAxios from "openapi-client-axios";
import { AppRoutePath } from "@/components/router/paths";
import { resolveAppPath } from "@/utils/app-paths";
import doLogin from "@/services/do_login/doLogin";

const ACCESS_TOKEN_KEY = "k9x_access_token";
const OAUTH_STATE_KEY = "k9x_google_oauth_state";
const SILENT_OAUTH_MESSAGE_TYPE = "k9x_google_oauth";

export default {
  async initAxiosClient(locale) {
    this.locale = locale;
    this.silentLoginPromise = null;

    return new Promise<void>((resolve) => {
      this.index = new OpenAPIClientAxios({
        definition: import.meta.env.VITE_APP_OAS,
      });

      this.index.init().then((client) => {
        client.interceptors.request.use((request) => {
          request.headers["Accept-language"] = this.locale;

          if (request.url.includes("/api/")) {
            const token = globalThis.localStorage.getItem(ACCESS_TOKEN_KEY);
            if (token) {
              request.headers["Authorization"] = `Bearer ${token}`;
            }
          }

          return request;
        });

        client.interceptors.response.use(
          (response) => {
            return response.data;
          },
          async (error) => {
            const status = error?.response?.status;
            const originalRequest = error?.config || {};
            if (!shouldAttemptSilentLogin(status, originalRequest)) {
              return Promise.reject(error);
            }

            if (!this.silentLoginPromise) {
              this.silentLoginPromise = (async () => {
                const code = await getSilentAuthCode();
                const token = await doLogin({ idToken: code });

                globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, token);
                return token;
              })().finally(() => {
                this.silentLoginPromise = null;
              });
            }

            return this.silentLoginPromise
              .then((token) => {
                originalRequest.__k9xSilentRetry = true;
                originalRequest.headers = {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${token}`,
                };

                return client(originalRequest);
              })
              .catch((silentError) => {
                startInteractiveLogin();
                return Promise.reject(silentError);
              });
          },
        );

        resolve();
      });
    });
  },
  async getOASClient() {
    const client = await this.index.getClient();
    client.defaults.baseURL = import.meta.env.VITE_APP_API_ADDRESS;
    return client;
  },
  setLocale(locale) {
    this.locale = locale;
  },
};

const getGoogleRedirectUri = () =>
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${globalThis.location.origin}${resolveAppPath(AppRoutePath.HOME)}`;

const buildGoogleAuthUrl = ({ state, prompt }) => {
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

const startInteractiveLogin = () => {
  const state = crypto.randomUUID();
  globalThis.sessionStorage.setItem(OAUTH_STATE_KEY, state);
  globalThis.location.assign(
    buildGoogleAuthUrl({ state, prompt: "select_account" }),
  );
};

const getSilentAuthCode = () =>
  new Promise<string>((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error("Missing Google client id"));
      return;
    }

    const state = crypto.randomUUID();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");

    const cleanup = (timeoutId, onMessage) => {
      clearTimeout(timeoutId);
      globalThis.removeEventListener("message", onMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const onMessage = (event) => {
      if (event.origin !== globalThis.location.origin) return;

      const data = event.data || {};
      if (data.type !== SILENT_OAUTH_MESSAGE_TYPE) return;

      const params = new URLSearchParams(data.search || "");
      const returnedState = params.get("state");
      const error = params.get("error");
      const code = params.get("code");

      if (returnedState !== state) {
        cleanup(timeoutId, onMessage);
        reject(new Error("Invalid OAuth state"));
        return;
      }

      if (error) {
        cleanup(timeoutId, onMessage);
        reject(new Error(error));
        return;
      }

      if (!code) {
        cleanup(timeoutId, onMessage);
        reject(new Error("Missing OAuth code"));
        return;
      }

      cleanup(timeoutId, onMessage);
      resolve(code);
    };

    const timeoutId = globalThis.setTimeout(() => {
      cleanup(timeoutId, onMessage);
      reject(new Error("Silent login timeout"));
    }, 10000);

    globalThis.addEventListener("message", onMessage);
    iframe.src = buildGoogleAuthUrl({ state, prompt: "none" });
    document.body.appendChild(iframe);
  });

const shouldAttemptSilentLogin = (status, request) => {
  const hasToken = Boolean(globalThis.localStorage.getItem(ACCESS_TOKEN_KEY));
  const isApiRequest = Boolean(request?.url?.includes("/api/"));
  const isLoginRequest = Boolean(request?.url?.includes("/login"));

  return (
    status === 401 &&
    isApiRequest &&
    !isLoginRequest &&
    hasToken &&
    !request.__k9xSilentRetry
  );
};
