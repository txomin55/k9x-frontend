import { test as testBase } from "@playwright/test";
import { getMCRInstance } from "@test/config/mcr.config";

const test = testBase.extend<{
  autoTestFixture: string;
}>({
  autoTestFixture: [
    async ({ context, page: myPage }, use) => {
      await Promise.all([
        myPage.coverage.startJSCoverage({
          resetOnNavigation: true,
        }),
        myPage.coverage.startCSSCoverage({
          resetOnNavigation: true,
        }),
      ]);

      await use("autoTestFixture");

      const coverageList = await Promise.all(
        context.pages().map(async (page) => {
          const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
          ]);

          return [...jsCoverage, ...cssCoverage];
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
