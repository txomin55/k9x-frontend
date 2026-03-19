import { test as testBase } from "@playwright/test";
import { getMCRInstance } from "@test/config/mcr.config";
import defaultApiResponses from "@test/utils/defaultApiResponses";

const test = testBase.extend<{
  autoTestFixture: string;
}>({
  autoTestFixture: [
    async ({ context, page: myPage }, use) => {
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
