import { test } from "@playwright/test";
import * as flows from "./utils/flows";
import { cleanup, newRegistry } from "./utils/cleanup";

const registry = newRegistry();

test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await cleanup(registry);
});

test("enroll journey: build an event from a judge and dog, view info, enroll another dog", async ({
  page,
}) => {
  flows.setDeadlineOffset(20);

  const judge = await flows.createJudge(page);
  registry.judgeIds.push(judge.id);

  const dog = await flows.createDog(page);
  registry.dogIds.push(dog.id);

  const otherDog = await flows.createDog(page);
  registry.dogIds.push(otherDog.id);

  const competition = await flows.createCompetition(page);
  registry.competitionIds.push(competition.id);

  const stage = await flows.createStage(page, competition.id);
  const event = await flows.createEvent(page, competition.id, stage.id);

  await flows.setEventConfiguration(page, competition.id, stage.id, event.id);
  await flows.addJudgeToEvent(page, competition.id, stage.id, event.id, judge.name);
  await flows.addCompetitorToEvent(
    page,
    competition.id,
    stage.id,
    event.id,
    dog.name,
  );

  await flows.viewEventInfo(page, stage.id, event.title);
  await flows.enrollDog(page, stage.id, otherDog.name);
});

test("scoring journey: build an event with a dog, add scores, view classification", async ({
  page,
}) => {
  flows.setDeadlineOffset(-1);

  const judge = await flows.createJudge(page);
  registry.judgeIds.push(judge.id);

  const dog = await flows.createDog(page);
  registry.dogIds.push(dog.id);

  const competition = await flows.createCompetition(page);
  registry.competitionIds.push(competition.id);

  const stage = await flows.createStage(page, competition.id, 0);
  const event = await flows.createEvent(page, competition.id, stage.id);

  await flows.setEventConfiguration(page, competition.id, stage.id, event.id);
  await flows.addJudgeToEvent(page, competition.id, stage.id, event.id, judge.name);
  await flows.addExerciseToEvent(page, competition.id, stage.id, event.id);
  await flows.addCompetitorToEvent(
    page,
    competition.id,
    stage.id,
    event.id,
    dog.name,
  );

  await flows.addScores(page, competition.id, stage.id, event.id, dog.name);
  await flows.viewClassification(page, stage.id, event.id, dog.name);
});
