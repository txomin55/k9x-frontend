import type { Page } from "@playwright/test";
import { defaultClassification } from "@test/api-mocks/classification";
import { defaultCompetitions } from "@test/api-mocks/competitions";
import { resolveDogByIdentificationPayload } from "@test/api-mocks/dogByIdentification";
import { defaultDogs } from "@test/api-mocks/dogs";
import { defaultJudges } from "@test/api-mocks/judges";
import { mockAccessToken } from "@test/api-mocks/login";
import { logoutPayload } from "@test/api-mocks/logout";
import { defaultStageDetail } from "@test/api-mocks/stageDetail";
import { defaultStages } from "@test/api-mocks/stages";
import { mockUser } from "@test/api-mocks/user";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export default async function defaultApiResponses(page: Page) {
  await Promise.all([
    setRouteResponses(page, {
      method: "POST",
      payload: mockAccessToken,
      pathname: "/login",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: mockUser,
      pathname: "/secured/user",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultDogs,
      pathname: "/secured/dogs",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultCompetitions,
      pathname: "/secured/competitions",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: [],
      pathname: "/secured/collections",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultJudges,
      pathname: "/secured/judges",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: resolveDogByIdentificationPayload,
      pathname: "/secured/dogs/*",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: [],
      pathname: "/secured/notifications",
    }),
    setRouteResponses(page, {
      method: "PATCH",
      payload: "",
      pathname: "/secured/subscriptions",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: {},
      pathname: "/secured/set-notification-setup",
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: logoutPayload,
      pathname: "/secured/logout",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultStages,
      pathname: "/stages",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultStageDetail,
      pathname: "/stages/*",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: defaultClassification,
      pathname: "/events/*/classification",
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: "",
      pathname: "/secured/events/*/enroll",
      status: 204,
    }),
  ]);
}
