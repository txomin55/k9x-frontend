import { expect, type Page } from "@playwright/test";
import { organizerTest } from "@test/utils/authFixtures";
import {
  EVENT_DETAIL_COMPETITION_ID,
  EVENT_DETAIL_ID,
  EVENT_DETAIL_STAGE_ID,
  setupEventDetailCrud,
} from "@test/api-mocks/eventDetail";
import { openEditMode } from "@test/utils/detailEditMenu";
import { toDogsPage } from "@test/api-mocks/dogs";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

const EVENT_DETAIL_URL = `/my/competitions/${EVENT_DETAIL_COMPETITION_ID}/stages/${EVENT_DETAIL_STAGE_ID}/events/${EVENT_DETAIL_ID}`;

const KENNEL_SIZE = 180;

const kennel = Array.from({ length: KENNEL_SIZE }, (_, index) => ({
  identification: `dog-${index}`,
  name: `Kennel Dog ${String(index).padStart(3, "0")}`,
  image: "",
  breed: { id: "labrador", name: "Labrador" },
  origin: `ES-DOG-${index}`,
  license: `LIC-${index}`,
  owner: "owner@example.test",
  handler: "Ana",
  team: "Team Alpha",
  country: { id: "ES", name: "Spain" },
  sex: "MALE",
  withersCm: 50,
  owned: false,
  threeFciGenerationsConfirmed: false,
}));

const openDogPicker = async (page: Page) => {
  await setupEventDetailCrud(page);
  await setRouteResponses(page, {
    method: "GET",
    payload: (_match, request) => toDogsPage(kennel, request.url()),
    pathname: "/secured/dogs",
  });

  await page.goto(EVENT_DETAIL_URL);
  await expect(page.getByText("Judge Alpha", { exact: true })).toBeVisible();
  await openEditMode(page);
  await page.getByRole("tab", { name: "Competitors" }).click();
  // The floating toggle overlaps the lower card actions and swallows the click.
  await page.addStyleTag({
    content: ".floating-toggle-circle { pointer-events: none; }",
  });
  await page.getByRole("button", { name: "Add competitor" }).click();

  const dogBox = page.getByRole("dialog").getByRole("combobox", { name: "Dog" });
  await dogBox.click();
  await expect(page.locator(".atom-combobox__listbox")).toBeVisible();

  return dogBox;
};

/** The dog pages the picker asked the API for, as query strings. */
const trackDogRequests = (page: Page) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.endsWith("/secured/dogs") && !url.search.includes("owned")) {
      calls.push(url.search);
    }
  });
  return calls;
};

organizerTest.describe("Event competitor dog picker - organizer", () => {
  organizerTest(
    "reads the kennel one page at a time as the list is scrolled",
    async ({ page }) => {
      const calls = trackDogRequests(page);
      await openDogPicker(page);

      // Never the whole kennel: the box opens on a single page.
      await expect.poll(() => calls).toContain("?page=0&size=50");
      expect(calls.every((call) => call.includes("page="))).toBe(true);

      calls.length = 0;
      await page
        .locator(".atom-combobox__listbox")
        .evaluate((listbox) => {
          listbox.scrollTop = listbox.scrollHeight;
        });

      await expect.poll(() => calls).toContain("?page=1&size=50");
    },
  );

  organizerTest(
    "keeps painting options all the way down the list",
    async ({ page }) => {
      await openDogPicker(page);
      const listbox = page.locator(".atom-combobox__listbox");
      const renderedNames = () =>
        listbox
          .locator(".atom-combobox__item")
          .evaluateAll((items) => items.map((item) => item.textContent ?? ""));

      const onOpen = await renderedNames();
      expect(onOpen.length).toBeGreaterThan(0);

      await listbox.evaluate((element) => {
        element.scrollTop = 600;
      });

      // The options follow the scroll instead of leaving the rest of the list blank.
      await expect
        .poll(async () => (await renderedNames())[0])
        .not.toBe(onOpen[0]);
      expect((await renderedNames()).length).toBeGreaterThan(0);
    },
  );

  organizerTest(
    "matches what is loaded until the text is worth searching for",
    async ({ page }) => {
      const calls = trackDogRequests(page);
      const dogBox = await openDogPicker(page);
      await expect.poll(() => calls.length).toBeGreaterThan(0);

      calls.length = 0;
      await dogBox.fill("Ke");
      await page.waitForTimeout(800);
      // Two characters are matched against the dogs already in the box.
      expect(calls).toHaveLength(0);
      await expect(
        page.locator(".atom-combobox__listbox").getByText("Kennel Dog 000"),
      ).toBeVisible();

      // A longer text goes to the API, so it reaches dogs no page has brought in yet.
      await dogBox.fill("Kennel Dog 17");
      await expect
        .poll(() => calls.some((call) => call.includes("name=Kennel+Dog+17")))
        .toBe(true);
      await expect(
        page.locator(".atom-combobox__listbox").getByText("Kennel Dog 170"),
      ).toBeVisible();
    },
  );

  organizerTest(
    "finds a dog by its identification, not only by its name",
    async ({ page }) => {
      const calls = trackDogRequests(page);
      const dogBox = await openDogPicker(page);
      await expect.poll(() => calls.length).toBeGreaterThan(0);

      calls.length = 0;
      // No dog is named after this: the identification is what matches it.
      await dogBox.fill("dog-171");

      await expect
        .poll(() =>
          calls.some((call) => call.includes("identification=dog-171")),
        )
        .toBe(true);
      await expect(
        page.locator(".atom-combobox__listbox").getByText("Kennel Dog 171"),
      ).toBeVisible();
    },
  );
});
