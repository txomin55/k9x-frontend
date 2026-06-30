import { expect, type Page } from "@playwright/test";
import { named } from "./constants";

const futureDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const selectFirstOption = async (
  page: Page,
  trigger: import("@playwright/test").Locator,
) => {
  const isUnselected = async () =>
    /Select an option|Select a /i.test((await trigger.innerText()) ?? "");

  for (let attempt = 0; attempt < 5; attempt++) {
    const option = page.getByRole("option").first();
    if (!(await option.isVisible().catch(() => false))) {
      await trigger.click();
      await page.waitForTimeout(300);
    }
    if (await option.isVisible().catch(() => false)) {
      await option.click().catch(() => undefined);
    } else {
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    }
    await page.waitForTimeout(300);
    if (!(await isUnselected())) return;
  }
  throw new Error("selectFirstOption: option was never selected");
};

let deadlineOffsetDays = 20;
export const setDeadlineOffset = (days: number) => {
  deadlineOffsetDays = days;
};

const setEnrollmentDeadline = (page: Page) =>
  page.getByLabel("Enrollment deadline").fill(futureDate(deadlineOffsetDays));

const waitForEventWrite = async (page: Page, action: () => Promise<void>) => {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      response.url().includes("/secured/obdx/events/") &&
      response.ok(),
    { timeout: 30_000 },
  );
  await action();
  await responsePromise;
};

type CreateMatch = { urlIncludes: string; method?: string };

const captureCreate = async <T = Record<string, unknown>>(
  page: Page,
  { urlIncludes, method = "POST" }: CreateMatch,
  action: () => Promise<void>,
): Promise<T> => {
  const requestPromise = page.waitForRequest(
    (request) =>
      request.method() === method && request.url().includes(urlIncludes),
  );
  await action();
  const request = await requestPromise;
  return (request.postDataJSON() ?? {}) as T;
};

export const createJudge = async (page: Page) => {
  const name = named("Judge");
  await page.goto("/my/judges/list");
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/judges" },
    async () => {
      await page.getByRole("button", { name: "+", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Name").fill(name);
      await dialog.getByRole("button", { name: "Save" }).click();
    },
  );
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  return { id: body.id, name };
};

export const createDog = async (page: Page) => {
  const name = named("Dog");
  await page.goto("/my/dogs/list");
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/dogs" },
    async () => {
      await page.getByRole("button", { name: "+", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Name").fill(name);
      await dialog.getByText("Owned", { exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Owned" })).toBeChecked();
      await dialog.getByRole("button", { name: "Country" }).click();
      await page.keyboard.type("Spain");
      await page.keyboard.press("Enter");
      await dialog.getByRole("button", { name: "Save" }).click();
    },
  );
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  return { id: body.id, name };
};

export const createCompetition = async (page: Page) => {
  await page.goto("/my/competitions/list");
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/competitions" },
    async () => {
      await page.getByRole("button", { name: "+", exact: true }).click();
    },
  );
  await expect(page).toHaveURL(new RegExp(`/my/competitions/${body.id}`));
  return { id: body.id };
};

export const createStage = async (
  page: Page,
  competitionId: string,
  startInDays = 30,
) => {
  const title = named("Trial");
  await page.goto(`/my/competitions/${competitionId}`);
  await page.getByRole("button", { name: "Edit" }).click();
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/stages" },
    async () => {
      await page
        .getByRole("button", { name: "+", exact: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Trial title").fill(title);
      await dialog.getByLabel("Date from").fill(futureDate(startInDays));
      await dialog.getByLabel("Date to").fill(futureDate(startInDays + 1));
      await dialog.getByRole("button", { name: "Save" }).click();
    },
  );
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  return { id: body.id, title };
};

export const createEvent = async (
  page: Page,
  competitionId: string,
  stageId: string,
) => {
  const title = named("Event");
  await page.goto(`/my/competitions/${competitionId}/stages/${stageId}`);
  await page.getByRole("button", { name: "Edit" }).click();
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/events" },
    async () => {
      await page
        .getByRole("button", { name: "+", exact: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.getByLabel("Event title").fill(title);
      await selectFirstOption(
        page,
        dialog.getByRole("button", { name: /Discipline/ }),
      );
      await dialog.getByRole("button", { name: "Save" }).click();
    },
  );
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  return { id: body.id, title };
};

export const setEventConfiguration = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
) => {
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("button", { name: "Edit" }).click();
  await page.addStyleTag({
    content: ".floating-toggle-circle { pointer-events: none; }",
  });
  await setEnrollmentDeadline(page);
  await selectFirstOption(
    page,
    page.getByRole("button", { name: /Federation/ }),
  );

  const configuration = page.getByRole("button", { name: /Configuration/ });
  await expect(configuration).toBeEnabled();
  await waitForEventWrite(page, () => selectFirstOption(page, configuration));
};

export const addJudgeToEvent = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
  judgeName: string,
) => {
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("button", { name: "Edit" }).click();
  await setEnrollmentDeadline(page);
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  const judge = dialog.getByRole("combobox", { name: "Judge" });
  await judge.click();
  await judge.fill(judgeName);
  await page.locator(".atom-combobox__listbox").getByText(judgeName).click();
  await dialog.getByLabel("Email").fill("k9x.support@gmail.com");
  await waitForEventWrite(page, () =>
    dialog.getByRole("button", { name: "Create" }).click(),
  );
  await expect(dialog).toBeHidden();
};

export const addExerciseToEvent = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
  optionIndex = 1,
) => {
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("button", { name: "Edit" }).click();
  await setEnrollmentDeadline(page);
  await page.getByRole("tab", { name: "Exercises" }).click();
  await page.addStyleTag({
    content: ".floating-toggle-circle { pointer-events: none; }",
  });
  await page.getByRole("button", { name: "+", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const exercise = dialog.getByRole("combobox", { name: "Exercise" });
  await exercise.click();
  await expect(page.locator(".atom-combobox__listbox li")).not.toHaveCount(0);
  for (let i = 0; i < optionIndex; i++) {
    await exercise.press("ArrowDown");
  }
  await exercise.press("Enter");
  await waitForEventWrite(page, () =>
    dialog.getByRole("button", { name: "Create" }).click(),
  );
  await expect(dialog).toBeHidden();
};

export const addCompetitorToEvent = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
  dogName: string,
) => {
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("button", { name: "Edit" }).click();
  await setEnrollmentDeadline(page);
  await page.getByRole("tab", { name: "Competitors" }).click();
  await page.addStyleTag({
    content: ".floating-toggle-circle { pointer-events: none; }",
  });
  await page.getByRole("button", { name: "+", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const dog = dialog.getByRole("combobox", { name: "Dog" });
  await dog.click();
  await dog.fill(dogName);
  await page.locator(".atom-combobox__listbox").getByText(dogName).click();
  await waitForEventWrite(page, () =>
    dialog.getByRole("button", { name: "Create" }).click(),
  );
  await expect(
    page.getByText(`Dog: ${dogName}`, { exact: true }),
  ).toBeVisible();
};

export const viewEventInfo = async (page: Page, stageId: string) => {
  await page.goto(`/stages/${stageId}/info`);
  const enrolled = page.getByRole("button", { name: "Competitors enrolled" });
  await expect(enrolled).toBeVisible();
  await enrolled.click();
};

export const enrollDog = async (
  page: Page,
  stageId: string,
  dogName: string,
) => {
  await page.goto(`/stages/${stageId}/info`);
  await page.getByRole("button", { name: "Enroll", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const dog = dialog.getByRole("combobox", { name: "Dog" });
  await dog.click();
  await dog.fill(dogName);
  await dog.press("ArrowDown");
  await dog.press("Enter");
  await dialog.getByRole("button", { name: "Enroll", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Competitors enrolled" }).click();
  await expect(page.getByText(dogName)).toBeVisible();
};

export const addScores = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
  competitorName: string,
) => {
  // The "Scores" button on the event page only appears once the event is
  // STARTED, which happens after the collector enters a score. So the collector
  // reaches the collection directly (it shows up under My collections because
  // the judge's collector email is the test user) and scores there.
  await page.goto(`/my/collections/${eventId}`);
  await page.addStyleTag({
    content: ".floating-toggle-circle { pointer-events: none; }",
  });
  const competitorSelect = page
    .getByRole("button", { name: /Competitors/ })
    .first();
  await expect(competitorSelect).toBeVisible();
  await competitorSelect.click();
  // The option is labelled by the competitor's owner, not the dog name, so just
  // pick the only competitor in the list rather than filtering by name.
  const option = page.getByRole("option").first();
  await expect(option).toBeVisible();
  await option.click();

  const score = page.getByRole("spinbutton").first();
  await score.fill("8");
  await score.blur();
  await expect(score).toHaveValue("8");

  // Scoring transitions the event to STARTED; the "Scores" button now shows.
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("tab", { name: "Competitors" }).click();
  await expect(
    page.getByRole("button", { name: "Scores" }).first(),
  ).toBeVisible();
};

export const viewClassification = async (
  page: Page,
  stageId: string,
  eventId: string,
  dogName: string,
) => {
  await page.goto(
    `/stages/${stageId}/events/${eventId}/classification?view=TABLE`,
  );
  // Classification is computed server-side and can take a while to populate.
  await expect(page.getByText(dogName).first()).toBeVisible({
    timeout: 30_000,
  });
};
