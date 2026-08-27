import { expect, type Page } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { toDogsPage } from "@test/api-mocks/dogs";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

// One, two and three lines of name at the card width, so the cards that must line up differ in content.
const NAMES = [
  "Rex",
  "Vallhunden Mr Hyde Junior",
  "Wonderful Life Del Mulino Prudenza Bella",
];

const dogs = Array.from({ length: 60 }, (_, index) => ({
  identification: `dog-${index}`,
  name: `${NAMES[index % 3]} ${index}`,
  image: "",
  breed: { id: "labrador", name: "Labrador Retriever" },
  origin: `ES-DOG-${index}`,
  license: `LIC-${index}`,
  owner: "Carlos Competitor",
  handler: "Carlos Competitor",
  team: "Team Alpha",
  country: { id: "ES", name: "Spain" },
  sex: "MALE",
  withersCm: 50,
  owned: true,
  threeFciGenerationsConfirmed: false,
}));

const openList = async (page: Page) => {
  await setRouteResponses(page, {
    method: "GET",
    payload: (_match, request) => toDogsPage(dogs, request.url()),
    pathname: "/secured/dogs",
  });
  await page.goto("/my/dogs/list");
  await expect(page.getByText("Rex 0", { exact: true })).toBeVisible();
};

/** How much the page around the list scrolls: the list has the only scrollbar, so this must stay 0. */
const pageOverflow = (page: Page) =>
  page.evaluate(() => {
    const content = document.querySelector(".app-layout__content") as HTMLElement;
    return content.scrollHeight - content.clientHeight;
  });

competitorTest.describe("My dogs - list layout", () => {
  competitorTest("gives every card the same height", async ({ page }) => {
    await openList(page);

    const heights = await page
      .locator(".virtual-card-grid .card")
      .evaluateAll((cards) => [
        ...new Set(
          cards.map((card) =>
            Math.round(card.getBoundingClientRect().height),
          ),
        ),
      ]);

    expect(heights).toHaveLength(1);
  });

  competitorTest(
    "keeps the actions on the bottom edge of every card",
    async ({ page }) => {
      await openList(page);

      const gaps = await page
        .locator(".virtual-card-grid .card")
        .evaluateAll((cards) => [
          ...new Set(
            cards.map((card) => {
              const actions = card.querySelector(
                ".card__actions",
              ) as HTMLElement;
              return Math.round(
                card.getBoundingClientRect().bottom -
                  actions.getBoundingClientRect().bottom,
              );
            }),
          ),
        ]);

      expect(gaps).toHaveLength(1);
    },
  );

  competitorTest(
    "keeps the table columns at the same width while rows scroll in and out",
    async ({ page }) => {
      await openList(page);
      await page.getByText("Table", { exact: true }).click();
      await expect(page.locator(".atom-table")).toBeVisible();

      const columnWidths = () =>
        page
          .locator(".atom-table__table thead th")
          .evaluateAll((headers) =>
            headers.map((header) =>
              Math.round(header.getBoundingClientRect().width),
            ),
          );

      const before = await columnWidths();
      await page
        .locator(".atom-table__scroller")
        .evaluate((scroller) => {
          scroller.scrollTop = scroller.scrollHeight;
        });
      await expect.poll(columnWidths).toEqual(before);
    },
  );

  competitorTest(
    "scrolls the list without scrolling the page around it",
    async ({ page }) => {
      await openList(page);

      expect(await pageOverflow(page)).toBe(0);

      await page.getByText("Table", { exact: true }).click();
      await expect(page.locator(".atom-table")).toBeVisible();

      expect(await pageOverflow(page)).toBe(0);
    },
  );
});
