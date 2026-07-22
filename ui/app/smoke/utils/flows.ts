import { expect, type Page } from "@playwright/test";
import { named, RUN_ID } from "./constants";

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

const enterEditMode = async (page: Page) => {
  await page.getByRole("button", { name: "Options" }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
};

const clickAdd = async (page: Page, label: string) => {
  await page.getByRole("button", { name: label, exact: false }).first().click();
};

type CreateMatch = { urlIncludes: string; method?: string };

const captureCreate = async <T = Record<string, unknown>>(
  page: Page,
  { urlIncludes, method = "POST" }: CreateMatch,
  action: () => Promise<void>,
): Promise<T> => {
  // Wait for the RESPONSE (not just the request) so the entity is confirmed
  // server-side before the flow moves on — otherwise a follow-up query (e.g.
  // owned dogs on the enroll page) can race the create and come back empty.
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === method &&
      response.url().includes(urlIncludes),
  );
  await action();
  const response = await responsePromise;
  if (!response.ok()) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Create ${urlIncludes} failed: ${response.status()} ${body}`,
    );
  }
  return (response.request().postDataJSON() ?? {}) as T;
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
      await dialog.getByRole("button", { name: "Country" }).click();
      await page.keyboard.type("Spain");
      await page.keyboard.press("Enter");
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
      await dialog.getByLabel("Chip").fill(name.replace(/\D/g, ""));
      await dialog.getByLabel("Name", { exact: true }).fill(name);
      await dialog.getByText("Owned", { exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Owned" })).toBeChecked();
      await dialog.getByRole("button", { name: "Breed" }).click();
      const breedOption = page.locator(".atom-select__item").first();
      await expect(breedOption).toBeVisible();
      await breedOption.click();
      await dialog.getByLabel("Identifier").fill(name.replace(/\D/g, ""));
      await dialog.getByLabel("Withers height (cm)").fill("50");
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
  await enterEditMode(page);
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/stages" },
    async () => {
      await clickAdd(page, "Add trial");
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
  await enterEditMode(page);
  const body = await captureCreate<{ id: string }>(
    page,
    { urlIncludes: "/secured/events" },
    async () => {
      await clickAdd(page, "Add event");
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
  await enterEditMode(page);
  await page.addStyleTag({
    content: ".floating-action { pointer-events: none; }",
  });

  // The enrollment deadline (and the rest of the "details") only become
  // editable once a configuration exists, so pick federation + grade first.
  await selectFirstOption(
    page,
    page.getByRole("button", { name: /Federation/ }),
  );

  const configuration = page.getByRole("button", { name: /Grade/ });
  await expect(configuration).toBeEnabled();
  await waitForEventWrite(page, () => selectFirstOption(page, configuration));

  await expect(page.getByLabel("Enrollment deadline")).toBeEnabled();
  await waitForEventWrite(page, () => setEnrollmentDeadline(page));
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
  await enterEditMode(page);
  await setEnrollmentDeadline(page);
  await clickAdd(page, "Add judge");
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
  await enterEditMode(page);
  await setEnrollmentDeadline(page);
  await page.getByRole("tab", { name: "Exercises" }).click();
  await clickAdd(page, "Add exercise");
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
) => {
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await enterEditMode(page);
  await setEnrollmentDeadline(page);
  await page.getByRole("tab", { name: "Competitors" }).click();
  await clickAdd(page, "Add competitor");
  const dialog = page.getByRole("dialog");
  const dog = dialog.getByRole("combobox", { name: "Dog" });
  await dog.click();
  // The competitor picker lists every dog in the system (virtualized, and the
  // global list may not contain a just-created dog), so the point here is only
  // to exercise adding a competitor: pick whichever dog the list offers first.
  const firstOption = page.locator(".atom-combobox__item-label").first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();
  await waitForEventWrite(page, () =>
    dialog.getByRole("button", { name: "Create" }).click(),
  );
  await expect(dialog).toBeHidden();
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
  // Wait for the owned-dogs query to populate the combobox before selecting;
  // interacting while it is still loading leaves the picker empty.
  await expect(page.locator(".atom-combobox__item").first()).toBeVisible();
  await dog.fill(dogName);
  const option = page
    .locator(".atom-combobox__listbox")
    .getByText(dogName, { exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await dialog.getByRole("button", { name: "Enroll", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Competitors enrolled" }).click();
  await expect(page.getByText(dogName)).toBeVisible();
};

export const acceptEnrollment = async (
  page: Page,
  competitionId: string,
  stageId: string,
  eventId: string,
) => {
  // A self-enrolled competitor starts pending; the organizer must accept the
  // enrollment (while the event is still CREATED) before it can be scored.
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await page.getByRole("tab", { name: "Competitors" }).click();
  const acceptEnroll = page
    .getByRole("button", { name: "Accept enrollment" })
    .first();
  await acceptEnroll.click();
  await expect(acceptEnroll).toBeHidden();
};

export const setStageDatesToToday = async (
  page: Page,
  competitionId: string,
) => {
  // Events are only editable while their stage is CREATED (future), but only
  // become scoreable once the stage is live. So build everything on a future
  // stage, then move its dates to today to make it live.
  await page.goto(`/my/competitions/${competitionId}`);
  await enterEditMode(page);
  const editStage = page.getByRole("button", { name: "Edit", exact: true });
  await expect(editStage).toBeVisible();
  await editStage.click();
  const dialog = page.locator(".atom-dialog__content", {
    hasText: "Trial title",
  });
  const dateFrom = dialog.locator('input[type="date"]').nth(0);
  const dateTo = dialog.locator('input[type="date"]').nth(1);
  // The editor loads its draft asynchronously after opening; wait for the dates
  // to be populated before overwriting them, otherwise the draft load races the
  // fill and reverts our values.
  await expect(dateFrom).toBeVisible();
  await expect(dateFrom).not.toHaveValue("");
  await dateFrom.fill(futureDate(0));
  await expect(dateFrom).toHaveValue(futureDate(0));
  await dateTo.fill(futureDate(1));
  await expect(dateTo).toHaveValue(futureDate(1));
  // This stacked modal is aria-hidden, so getByRole can't see its controls;
  // target the Save button by DOM instead.
  const save = dialog.locator("button", { hasText: "Save" }).first();
  await expect(save).toBeEnabled();
  await save.click({ force: true });
  await expect(dateFrom).toBeHidden();
};

const dismissPendingCollections = async (page: Page) => {
  // A "pending collections" reminder dialog pops up (after a short delay) over
  // pages of an event that still has trials to score, blocking interaction.
  const pending = page.locator(".atom-dialog__content", {
    hasText: "Pending collections",
  });
  await pending
    .waitFor({ state: "visible", timeout: 5000 })
    .then(async () => {
      await pending.locator(".atom-dialog__close-button").click();
      await expect(pending).toBeHidden();
    })
    .catch(() => undefined);
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
  await dismissPendingCollections(page);
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

  // Score every exercise so the competitor finishes (a partially-scored
  // competitor stays "in progress"/live, which auto-pins it and disables its
  // pin toggle in the classification).
  const scores = page.getByRole("spinbutton");
  await expect(scores.first()).toBeVisible();
  const scoreCount = await scores.count();
  for (let i = 0; i < scoreCount; i++) {
    const score = scores.nth(i);
    await score.fill("8");
    await score.blur();
    await expect(score).toHaveValue("8");
  }

  // Scoring transitions the event to STARTED; the "Scores" button now shows.
  await page.goto(
    `/my/competitions/${competitionId}/stages/${stageId}/events/${eventId}`,
  );
  await dismissPendingCollections(page);
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

export const buildScoredEvent = async (page: Page) => {
  setDeadlineOffset(1);

  const judge = await createJudge(page);
  const dog = await createDog(page);
  const competition = await createCompetition(page);
  const stage = await createStage(page, competition.id);
  const event = await createEvent(page, competition.id, stage.id);

  await setEventConfiguration(page, competition.id, stage.id, event.id);
  await addJudgeToEvent(page, competition.id, stage.id, event.id, judge.name);
  await addExerciseToEvent(page, competition.id, stage.id, event.id, 1);
  await addExerciseToEvent(page, competition.id, stage.id, event.id, 2);
  await enrollDog(page, stage.id, dog.name);
  await acceptEnrollment(page, competition.id, stage.id, event.id);
  await setStageDatesToToday(page, competition.id);
  await addScores(page, competition.id, stage.id, event.id, dog.name);

  return { judge, dog, competition, stage, event };
};

const revealStagesFilters = async (page: Page) => {
  const nameFilter = page.getByLabel("Trial name");
  if (await nameFilter.isVisible().catch(() => false)) return;
  await page.getByText("Filters", { exact: true }).click();
  await expect(nameFilter).toBeVisible();
};

const selectSegment = async (page: Page, text: string) => {
  await page
    .locator(".atom-segmented-control__item-label", { hasText: text })
    .first()
    .click();
};

export const visitStagesListing = async (page: Page, stageName: string) => {
  // The listing filters names with a RegExp, so escape regex-special chars
  // (the stage name has parentheses) to match the literal name.
  const query = stageName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.goto("/stages");
  await revealStagesFilters(page);
  await page.getByLabel("Trial name").fill(query);

  const info = page.getByRole("button", { name: "+ Info" }).first();
  await expect(info).toBeVisible();
  await info.click();
  await expect(page).toHaveURL(/\/stages\/[^/]+\/info/);
  await expect(
    page.getByRole("button", { name: "Competitors enrolled" }),
  ).toBeVisible();

  await page.goBack();
  // Back on the listing; the name filter persists via the URL search param
  // (the mobile filter panel itself collapses again).
  await expect(page).toHaveURL(/\/stages(\?|$)/);

  await selectSegment(page, "Map");
  await selectSegment(page, "Table");

  const row = page.getByRole("row").filter({ hasText: stageName });
  await expect(row).toBeVisible();
  await row.click();

  await page.getByRole("button", { name: "Classification" }).first().click();
  await expect(page).toHaveURL(/\/classification/);
};

export const exploreClassification = async (page: Page, dogName: string) => {
  await expect(page.getByText(dogName).first()).toBeVisible({
    timeout: 30_000,
  });

  await page.getByRole("button", { name: "See detail" }).first().click();
  // The pin control is an icon button (tinted SVG mask, no accessible text), so
  // target it by its title attribute; pinning flips the title to "Unpin".
  await page.locator('button[title="Pin"]').first().click();
  await expect(page.locator('button[title="Unpin"]').first()).toBeVisible();

  await selectSegment(page, "Table");
};
