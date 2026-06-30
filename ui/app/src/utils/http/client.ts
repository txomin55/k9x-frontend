import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import { getCurrentLocale } from "@/stores/i18n/i18n";
import type { LoginRequestDTO } from "@/services/secured/do-login/doLogin.types";
import type {
  RequestOptions,
  SerializableRequest,
} from "@/utils/http/client.types";

const ACCESS_TOKEN_KEY = "k9x_access_token";
const LOGIN_ENDPOINT_PATH = "/login";
const REFRESH_ENDPOINT_PATH = "/refresh";

class HttpRequestError extends Error {
  kind = "http" as const;
  path: string;
  status: number;

  constructor(path: string, status: number, message?: string) {
    super(message ?? `Request failed for ${path} with status ${status}`);
    this.name = "HttpRequestError";
    this.path = path;
    this.status = status;
  }
}

class NetworkRequestError extends Error {
  kind = "network" as const;
  path: string;

  constructor(path: string, cause?: unknown) {
    super(`Network request failed for ${path}`);
    this.name = "NetworkRequestError";
    this.path = path;
    this.cause = cause;
  }
}

const getApiBaseUrl = () => import.meta.env.VITE_APP_API_ADDRESS;

const buildHeaders = (path: string, headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Accept-language", getCurrentLocale());

  if (path.startsWith("/secured/")) {
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

const serializeHeaders = (headers: Headers) =>
  Object.fromEntries(headers.entries());

const serializeBody = (body: unknown) =>
  body === undefined ? undefined : JSON.stringify(body);

const extractErrorMessage = async (
  response: Response,
): Promise<string | undefined> => {
  try {
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const data = (await response.json()) as Record<string, unknown> | null;
      const message =
        data?.msg ?? data?.message ?? data?.error ?? data?.detail;

      return typeof message === "string" && message.length > 0
        ? message
        : undefined;
    }

    const text = (await response.text()).trim();

    return text.length > 0 ? text : undefined;
  } catch {
    return undefined;
  }
};

const createSerializableRequest = ({
  body,
  credentials,
  headers,
  method = "GET",
  path,
}: RequestOptions): SerializableRequest => ({
  body: serializeBody(body),
  credentials,
  headers: serializeHeaders(buildHeaders(path, headers)),
  method,
  url: `${getApiBaseUrl()}${path}`,
});

const rawRequest = async <TResponse>({
  auth = false,
  body,
  credentials,
  headers,
  method = "GET",
  path,
  retryOnUnauthorized = auth || path.startsWith("/secured/"),
}: RequestOptions): Promise<TResponse> => {
  let response: Response;

  try {
    const request = createSerializableRequest({
      body,
      credentials,
      headers,
      method,
      path,
    });

    response = await fetch(request.url, {
      body: request.body,
      credentials: request.credentials,
      headers: request.headers,
      method: request.method,
    });
  } catch (error) {
    throw new NetworkRequestError(path, error);
  }

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    shouldAttemptSilentLogin(path)
  ) {
    try {
      const token = await refreshAccessToken();
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
      globalThis.localStorage.removeItem(ACCESS_TOKEN_KEY);
      startGoogleInteractiveLogin();
      throw error;
    }
  }

  if (!response.ok) {
    throw new HttpRequestError(
      path,
      response.status,
      await extractErrorMessage(response),
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as TResponse;
    } catch (error) {
      throw new HttpRequestError(
        path,
        response.status,
        `Invalid JSON response for ${path}`,
      );
    }
  }

  return (await response.text()) as TResponse;
};

const loginWithToken = (payload: LoginRequestDTO) =>
  rawRequest<string>({
    body: payload,
    credentials: "include",
    method: "POST",
    path: LOGIN_ENDPOINT_PATH,
    retryOnUnauthorized: false,
  });

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = rawRequest<string>({
      credentials: "include",
      method: "POST",
      path: REFRESH_ENDPOINT_PATH,
      retryOnUnauthorized: false,
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const shouldAttemptSilentLogin = (path: string) => {
  const hasToken = Boolean(globalThis.localStorage.getItem(ACCESS_TOKEN_KEY));
  const isSecuredRequest = path.startsWith("/secured/");
  const isLoginRequest = path === LOGIN_ENDPOINT_PATH;

  return hasToken && isSecuredRequest && !isLoginRequest;
};

export {
  HttpRequestError,
  loginWithToken,
  NetworkRequestError,
  rawRequest,
  refreshAccessToken,
};
export { ACCESS_TOKEN_KEY, createSerializableRequest };
