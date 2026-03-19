import type { Page } from "@playwright/test";
import { resolveDogByIdPayload } from "@test/api-mocks/dogById";
import { defaultDogs } from "@test/api-mocks/dogs";
import { mockAccessToken } from "@test/api-mocks/login";
import { logoutPayload } from "@test/api-mocks/logout";
import { mockUser } from "@test/api-mocks/user";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export default async function defaultApiResponses(page: Page) {
  await setRouteResponses(page, {
    method: "POST",
    payload: mockAccessToken,
    pathname: "/login",
  });
  await setRouteResponses(page, {
    method: "GET",
    payload: mockUser,
    pathname: "/api/user",
  });
  await setRouteResponses(page, {
    method: "GET",
    payload: defaultDogs,
    pathname: "/dogs",
  });
  await setRouteResponses(page, {
    method: "GET",
    payload: resolveDogByIdPayload,
    pathname: "/dogs/*",
  });
  await setRouteResponses(page, {
    method: "GET",
    payload: logoutPayload,
    pathname: "/api/logout",
  });
}
