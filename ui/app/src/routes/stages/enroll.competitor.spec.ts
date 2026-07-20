import { expect } from "@playwright/test";
import { competitorTest } from "@test/utils/authFixtures";
import { defaultDogs } from "@test/api-mocks/dogs";
import { defaultStageDetail } from "@test/api-mocks/stageDetail";
import { verifyLocalFirstWrite } from "@test/utils/localFirst";

const STAGE_ID = defaultStageDetail.id;

competitorTest.describe("Event enrollment (write) - competitor", () => {
  competitorTest(
    "enrolls optimistically, queues the request while offline, and rehydrates on reload",
    async ({ page, context }) => {
      // Stateful server: the enroll PUT persists so a later GET reflects it.
      const extraCompetitors: unknown[] = [];
      const currentDetail = () => ({
        ...defaultStageDetail,
        events: defaultStageDetail.events.map((event, index) =>
          index === 0
            ? {
                ...event,
                competitors: [...event.competitors, ...extraCompetitors],
              }
            : event,
        ),
      });

      await page.route(`**/stages/${STAGE_ID}`, async (route) => {
        if (route.request().method() !== "GET") {
          await route.fallback();
          return;
        }
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(currentDetail()),
        });
      });

      await page.route("**/secured/events/*/enroll", async (route) => {
        if (route.request().method() !== "PUT") {
          await route.fallback();
          return;
        }
        const { dogId } = route.request().postDataJSON();
        const dog = defaultDogs.find((candidate) => candidate.id === dogId);
        if (dog) {
          extraCompetitors.push({
            dog: { id: dog.id, name: dog.name },
            owner: dog.owner,
            team: dog.team,
            country: dog.country.id,
            breed: dog.breed,
          });
        }
        await route.fulfill({ status: 204, body: "" });
      });

      await page.goto(`/stages/${STAGE_ID}/info`);
      await expect(page.getByText("Agility Standard", { exact: true })).toBeVisible();

      const openEnrolledCompetitors = () =>
        page.getByRole("button", { name: "Competitors enrolled" }).click();

      await verifyLocalFirstWrite(page, context, {
        mutation: { method: "PUT", urlIncludes: "/enroll" },
        entityType: "stage-enroll",
        performMutation: async () => {
          await page.getByRole("button", { name: "Enroll", exact: true }).click();
          const dogCombobox = page.getByRole("combobox", { name: "Dog" });
          await dogCombobox.click();
          await dogCombobox.fill("Koda");
          await dogCombobox.press("ArrowDown");
          await dogCombobox.press("Enter");
          await page
            .getByRole("dialog")
            .getByRole("button", { name: "Enroll", exact: true })
            .click();
        },
        assertOptimistic: async () => {
          await openEnrolledCompetitors();
          await expect(page.getByText("Koda (Labrador)")).toBeVisible();
        },
      });
    },
  );
});
