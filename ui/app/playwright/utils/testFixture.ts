import { test as testBase } from "@playwright/test";
import { getMCRInstance } from "@test/config/mcr.config";
import defaultApiResponses from "@test/utils/defaultApiResponses";

const WALKTHROUGH_DISABLED_KEY = "k9x_walkthrough_disabled";

const test = testBase.extend<{
  autoTestFixture: string;
}>({
  autoTestFixture: [
    async ({ context, page: myPage }, use) => {
      await context.addInitScript((key) => {
        window.localStorage.setItem(key, "true");
      }, WALKTHROUGH_DISABLED_KEY);

      await defaultApiResponses(myPage);

      await myPage.coverage.startJSCoverage({
        resetOnNavigation: true,
      });

      await use("autoTestFixture");

      const coverageList = await Promise.all(
        context.pages().map(async (page) => {
          return page.coverage.stopJSCoverage();
        }),
      );

      await getMCRInstance().add(coverageList.flat());
    },
    {
      scope: "test",
      auto: true,
    },
  ],
});

export { test };
