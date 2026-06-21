import type { Page } from "@playwright/test";
import type { ApiMock } from "@test/api-mocks/types";

const serializePayload = (payload: unknown) => {
  if (Buffer.isBuffer(payload)) {
    return {
      body: payload,
    };
  }

  if (typeof payload === "object" && payload !== null) {
    return {
      body: JSON.stringify(payload),
    };
  }

  return {
    body: String(payload),
  };
};

const getAppOrigin = () =>
  new URL(process.env.PWA_PRO_URL ?? "http://localhost:5173").origin;

/**
 * Builds a matcher for the request path, where each `*` matches a single segment
 * (e.g. "/secured/dogs/*"). Anchored only at the end, so it matches the path no
 * matter what API base the app points to (apidog adds a "/m1/<workspace>"
 * prefix, the integrated backend adds none).
 */
const buildPathMatcher = (path: string) => {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const withWildcards = escaped.replace(/\\\*/g, "([^/]+)");
  return new RegExp(`${withWildcards}$`);
};

export const setRouteResponses = async (page: Page, apiMock: ApiMock) => {
  const pathMatcher = buildPathMatcher(apiMock.pathname);
  const appOrigin = getAppOrigin();

  // Intercept the API call wherever it points, but never the app's own origin:
  // SPA navigations (e.g. "http://localhost:5173/stages") share a path suffix
  // with API routes and must reach the dev server, not the mock.
  const isApiRequest = (url: URL) =>
    url.origin !== appOrigin && pathMatcher.test(url.pathname);

  await page.route(
    (url) => isApiRequest(url),
    async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    // Hand off to the next matching route (not the network) so several mocks
    // can share a pathname across methods (e.g. GET + POST on /secured/dogs).
    if (request.method() !== apiMock.method) {
      await route.fallback();
      return;
    }

    const pathnameMatch = pathname.match(pathMatcher) ?? undefined;
    if (!pathnameMatch) {
      await route.fallback();
      return;
    }

    const resolvedPayload =
      typeof apiMock.payload === "function"
        ? await apiMock.payload(pathnameMatch, request)
        : apiMock.payload;
    const { body } = serializePayload(resolvedPayload);

    await route.fulfill({
      body,
      contentType: apiMock.contentType ?? "application/json",
      headers: apiMock.headers,
      status: apiMock.status ?? 200,
    });
    },
  );
};
