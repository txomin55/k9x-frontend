import { rawRequest } from "@/utils/http/client";

const LOGOUT_ENDPOINT_PATH = "/secured/logout";

/**
 * Invalidates the server-side session and clears the httpOnly `refresh_token`
 * cookie (the server responds with `Set-Cookie: refresh_token=; Max-Age=0`).
 *
 * `credentials: "include"` is required so the browser accepts that clearing
 * cookie cross-origin. `retryOnUnauthorized: false` keeps logout best-effort:
 * an expired access token must not trigger a silent refresh + Google redirect.
 */
const logout = () =>
  rawRequest<void>({
    credentials: "include",
    method: "POST",
    path: LOGOUT_ENDPOINT_PATH,
    retryOnUnauthorized: false,
  });

export { logout };
