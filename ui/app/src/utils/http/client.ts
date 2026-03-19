import {
  getSilentGoogleAuthCode,
  startGoogleInteractiveLogin,
} from "@/services/google_auth/googleAuth";
import { locale } from "@/stores/i18n";

const ACCESS_TOKEN_KEY = "k9x_access_token";
const LOGIN_ENDPOINT_PATH = "/login";

type RequestOptions = {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  method?: string;
  path: string;
  retryOnUnauthorized?: boolean;
};

const getApiBaseUrl = () => import.meta.env.VITE_APP_API_ADDRESS;

const buildHeaders = (path: string, headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Accept-language", locale());

  if (path.startsWith("/api/")) {
    const token = globalThis.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      nextHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
};

const rawRequest = async <TResponse>({
  auth = false,
  body,
  headers,
  method = "GET",
  path,
  retryOnUnauthorized = auth,
}: RequestOptions): Promise<TResponse> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: buildHeaders(path, headers),
    method,
  });

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    shouldAttemptSilentLogin(path)
  ) {
    try {
      const token = await getSilentAuthToken();
      globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, token);

      return rawRequest<TResponse>({
        auth,
        body,
        headers: {
          ...Object.fromEntries(new Headers(headers).entries()),
          Authorization: `Bearer ${token}`,
        },
        method,
        path,
        retryOnUnauthorized: false,
      });
    } catch (error) {
      startGoogleInteractiveLogin();
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(
      `Request failed for ${path} with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
};

const loginWithToken = (payload: { idToken: string }) =>
  rawRequest<string>({
    body: payload,
    method: "POST",
    path: LOGIN_ENDPOINT_PATH,
    retryOnUnauthorized: false,
  });

const getSilentAuthToken = async () => {
  const code = await getSilentGoogleAuthCode();
  return loginWithToken({ idToken: code });
};

const shouldAttemptSilentLogin = (path: string) => {
  const hasToken = Boolean(globalThis.localStorage.getItem(ACCESS_TOKEN_KEY));
  const isApiRequest = path.startsWith("/api/");
  const isLoginRequest = path === LOGIN_ENDPOINT_PATH;

  return hasToken && isApiRequest && !isLoginRequest;
};

export { loginWithToken, rawRequest };
