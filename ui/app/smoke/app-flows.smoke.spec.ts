import { test } from "@playwright/test";
import * as flows from "./utils/flows";
import { cleanup, newRegistry } from "./utils/cleanup";

const registry = newRegistry();

const shared: { stageId?: string } = {};

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await cleanup(registry);
});

// An event with unscored trials pops a global "Pending collections" reminder on
// every page, which aria-hides the page underneath and blocks interactions.
// Auto-dismiss it whenever it appears.
test.beforeEach(async ({ page }) => {
  const pending = page.locator(".atom-dialog__content", {
    hasText: "Pending collections",
  });
  await page.addLocatorHandler(pending, async () => {
    await pending.locator(".atom-dialog__close-button").click();
  });
});

test("competition creation journey: build an event from a judge and dog, view info", async ({
  page,
}) => {
  flows.setDeadlineOffset(20);

  const judge = await flows.createJudge(page);
  registry.judgeIds.push(judge.id);

  const dog = await flows.createDog(page);
  registry.dogIds.push(dog.id);

  const competition = await flows.createCompetition(page);
  registry.competitionIds.push(competition.id);

  const stage = await flows.createStage(page, competition.id);
  const event = await flows.createEvent(page, competition.id, stage.id);

  await flows.setEventConfiguration(page, competition.id, stage.id, event.id);
  await flows.addJudgeToEvent(
    page,
    competition.id,
    stage.id,
    event.id,
    judge.name,
  );
  await flows.addCompetitorToEvent(page, competition.id, stage.id, event.id);

  await flows.viewEventInfo(page, stage.id);

  shared.stageId = stage.id;
});

test("enroll journey: enroll a dog into the event built in the previous journey", async ({
  page,
}) => {
  const dog = await flows.createDog(page);
  registry.dogIds.push(dog.id);

  await flows.enrollDog(page, shared.stageId!, dog.name);
});

test("scoring journey: build an event with a dog, enroll the owned dog, add scores, view classification", async ({
  page,
}) => {
  flows.setDeadlineOffset(1);

  const judge = await flows.createJudge(page);
  registry.judgeIds.push(judge.id);

  const dog = await flows.createDog(page);
  registry.dogIds.push(dog.id);

  const competition = await flows.createCompetition(page);
  registry.competitionIds.push(competition.id);

  const stage = await flows.createStage(page, competition.id);
  const event = await flows.createEvent(page, competition.id, stage.id);

  await flows.setEventConfiguration(page, competition.id, stage.id, event.id);
  await flows.addJudgeToEvent(
    page,
    competition.id,
    stage.id,
    event.id,
    judge.name,
  );
  await flows.addExerciseToEvent(page, competition.id, stage.id, event.id, 1);
  await flows.addExerciseToEvent(page, competition.id, stage.id, event.id, 2);
  await flows.enrollDog(page, stage.id, dog.name);
  await flows.acceptEnrollment(page, competition.id, stage.id, event.id);
  await flows.setStageDatesToToday(page, competition.id);

  await flows.addScores(page, competition.id, stage.id, event.id, dog.name);
  await flows.viewClassification(page, stage.id, event.id, dog.name);
});

test("visitor journey: browse the public stages listing, open info, explore a classification", async ({
  page,
}) => {
  const { judge, dog, competition, stage } = await flows.buildScoredEvent(page);
  registry.judgeIds.push(judge.id);
  registry.dogIds.push(dog.id);
  registry.competitionIds.push(competition.id);

  await flows.visitStagesListing(page, stage.title);
  await flows.exploreClassification(page, dog.name);
});
