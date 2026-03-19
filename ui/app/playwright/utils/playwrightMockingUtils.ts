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

const matchesPathname = (pathname: string, apiMock: ApiMock) => {
  if (typeof apiMock.pathname === "string") {
    return pathname === apiMock.pathname;
  }

  return apiMock.pathname.pattern.test(pathname);
};

export const setRouteResponses = async (page: Page, apiMock: ApiMock) => {
  await page.route(
    (url) => matchesPathname(url.pathname, apiMock),
    async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() !== apiMock.method) {
      await route.continue();
      return;
    }

    let pathnameMatch: RegExpMatchArray | undefined;
    if (typeof apiMock.pathname === "string") {
      if (pathname !== apiMock.pathname) {
        await route.continue();
        return;
      }
    } else {
      pathnameMatch = pathname.match(apiMock.pathname.pattern) ?? undefined;
      if (!pathnameMatch) {
        await route.continue();
        return;
      }
    }

    const resolvedPayload =
      typeof apiMock.payload === "function"
        ? await apiMock.payload(pathnameMatch)
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
