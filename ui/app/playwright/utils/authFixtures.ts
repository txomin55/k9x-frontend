import type { BrowserContext } from "@playwright/test";
import { test as baseTest } from "@test/utils/testFixture";
import { mockAccessToken } from "@test/api-mocks/login";
import { competitorUser, organizerUser } from "@test/api-mocks/user";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

const ACCESS_TOKEN_KEY = "k9x_access_token";

const seedToken = async (context: BrowserContext) => {
  await context.addInitScript(
    ([key, token]) => {
      window.localStorage.setItem(key, token);
    },
    [ACCESS_TOKEN_KEY, mockAccessToken] as const,
  );
};

const clearToken = async (context: BrowserContext) => {
  await context.addInitScript((key) => {
    window.localStorage.removeItem(key);
  }, ACCESS_TOKEN_KEY);
};

/**
 * Logged-in organizer: `/secured/user` returns `organizer: true`, so the app
 * exposes the "My" workspace and competition CRUD controls.
 */
export const organizerTest = baseTest.extend<{ autoOrganizer: void }>({
  autoOrganizer: [
    async ({ autoTestFixture, context, page }, use) => {
      void autoTestFixture;
      await seedToken(context);
      await setRouteResponses(page, {
        method: "GET",
        payload: organizerUser,
        pathname: "/secured/user",
      });
      await use();
    },
    { auto: true, scope: "test" },
  ],
});

/**
 * Logged-in competitor: `/secured/user` returns `organizer: false`. The user is
 * authenticated but must not see organizer-only competition management.
 */
export const competitorTest = baseTest.extend<{ autoCompetitor: void }>({
  autoCompetitor: [
    async ({ autoTestFixture, context, page }, use) => {
      void autoTestFixture;
      await seedToken(context);
      await setRouteResponses(page, {
        method: "GET",
        payload: competitorUser,
        pathname: "/secured/user",
      });
      await use();
    },
    { auto: true, scope: "test" },
  ],
});

/**
 * Logged-out user: no access token, `/secured/user` and `/refresh` reject so no
 * session can be recovered. Protected `/my` routes redirect home.
 */
export const loggedOutTest = baseTest.extend<{ autoLoggedOut: void }>({
  autoLoggedOut: [
    async ({ autoTestFixture, context, page }, use) => {
      void autoTestFixture;
      await clearToken(context);
      await Promise.all([
        setRouteResponses(page, {
          method: "GET",
          payload: "Unauthorized",
          pathname: "/secured/user",
          status: 401,
        }),
        setRouteResponses(page, {
          method: "POST",
          payload: "Unauthorized",
          pathname: "/refresh",
          status: 401,
        }),
      ]);
      await use();
    },
    { auto: true, scope: "test" },
  ],
});
