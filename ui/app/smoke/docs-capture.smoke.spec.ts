import fs from "node:fs";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import * as flows from "./utils/flows";
import { cleanup, newRegistry } from "./utils/cleanup";
import { PENDING_COLLECTIONS_DISABLED_KEY } from "./utils/constants";

// Throwaway spec that produces the screenshots for the user guide. It builds the
// scenarios with the smoke helpers (English UI) and then walks the app a second
// time in Portuguese, only reading and cancelling, so every frame is taken at a
// moment we choose: no half-faded dialogs and no data created by the capture.
const SHOTS = process.env.DOCS_SHOTS_DIR ?? "/tmp/k9x-docs-shots";
const LOCALE_STORAGE_KEY = "k9x_locale";

type Scenario = {
  competitionId: string;
  stageId: string;
  stageTitle: string;
  eventId: string;
  dogName: string;
};

const registry = newRegistry();
const built: { open?: Scenario; scored?: Scenario } = {};

test.describe.configure({ mode: "serial" });

// Fail fast on a selector that does not exist instead of hanging for the whole
// test timeout: every interaction here is on a page we know is already loaded.
test.use({ actionTimeout: 20_000 });

test.afterAll(async () => {
  await cleanup(registry);
});

const shot = async (page: Page, name: string) => {
  await page.screenshot({ path: path.join(SHOTS, name) });
  console.log(
    (fs.existsSync(path.join(SHOTS, name)) ? "shot " : "MISSED ") + name,
  );
};

const settle = (page: Page, ms = 700) => page.waitForTimeout(ms);

// Tall forms end up scrolled to the last field we filled, which hides the top of
// the dialog. Bring it back before the shot so the guide shows the whole form.
const scrollDialogTop = async (page: Page) => {
  await page
    .locator(".atom-dialog__content")
    .last()
    .evaluate((node) => {
      node.scrollTop = 0;
      node.querySelectorAll("*").forEach((child) => {
        (child as HTMLElement).scrollTop = 0;
      });
    })
    .catch(() => undefined);
  await settle(page, 400);
};

const closeDialog = async (page: Page) => {
  const close = page.locator(".atom-dialog__close-button").last();
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  }
  await settle(page, 400);
};

const pickFirst = async (trigger: Locator, page: Page) => {
  await trigger.click();
  const option = page.getByRole("option").first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
  }
  await settle(page, 300);
};

const editMode = async (page: Page) => {
  await page.getByRole("button", { name: "Opções" }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await settle(page);
};

test("build the guide scenarios", async ({ page }) => {
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "true"),
    PENDING_COLLECTIONS_DISABLED_KEY,
  );

  flows.setDeadlineOffset(20);
  const judge = await flows.createJudge(page);
  registry.judgeIds.push(judge.id);
  const dog = await flows.createDog(page);
  registry.dogIdentifications.push(dog.identification);
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
  // Left pending on purpose: the guide needs a screenshot of "accept enrollment".
  await flows.enrollDog(page, stage.id, dog.name);

  built.open = {
    competitionId: competition.id,
    stageId: stage.id,
    stageTitle: stage.title,
    eventId: event.id,
    dogName: dog.name,
  };

  const scored = await flows.buildScoredEvent(page);
  registry.judgeIds.push(scored.judge.id);
  registry.dogIdentifications.push(scored.dog.identification);
  registry.competitionIds.push(scored.competition.id);

  built.scored = {
    competitionId: scored.competition.id,
    stageId: scored.stage.id,
    stageTitle: scored.stage.title,
    eventId: scored.event.id,
    dogName: scored.dog.name,
  };
});

test("capture the guide screenshots", async ({ page }) => {
  await page.addInitScript(
    ([pendingKey, localeKey]) => {
      window.localStorage.setItem(pendingKey, "true");
      window.localStorage.setItem(localeKey, "pt");
    },
    [PENDING_COLLECTIONS_DISABLED_KEY, LOCALE_STORAGE_KEY],
  );

  const open = built.open!;
  const scored = built.scored!;
  const openEvent = `/my/competitions/${open.competitionId}/stages/${open.stageId}/events/${open.eventId}`;

  // ---------------------------------------------------------------- journey 1
  await page.goto("/my/judges/list");
  await expect(
    page.getByRole("button", { name: "+", exact: true }),
  ).toBeVisible();
  await settle(page);
  await page.getByRole("button", { name: "+", exact: true }).click();
  const judgeDialog = page.getByRole("dialog");
  await judgeDialog.getByLabel("Nome").fill("Ana Ribeiro");
  await judgeDialog.getByRole("button", { name: "País" }).click();
  await page.keyboard.type("Portugal");
  await page.keyboard.press("Enter");
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "01-judge-dialog.png");
  await closeDialog(page);

  await page.goto("/my/judges/list");
  await settle(page);
  await shot(page, "02-judge-list.png");

  await page.goto("/my/dogs/list");
  await expect(
    page.getByRole("button", { name: "+", exact: true }),
  ).toBeVisible();
  await settle(page);
  await page.getByRole("button", { name: "+", exact: true }).click();
  const dogDialog = page.getByRole("dialog");
  await dogDialog.getByLabel("Identificação").fill("620000000000001");
  await dogDialog.getByLabel("Nome", { exact: true }).fill("Luna");
  await dogDialog.getByText("Próprio", { exact: true }).click();
  await pickFirst(dogDialog.getByRole("button", { name: "Raça" }), page);
  await dogDialog.getByLabel("Origem").fill("LOP123456");
  await dogDialog.getByLabel("Altura ao garrote (cm)").fill("52");
  await dogDialog.getByRole("button", { name: "País" }).click();
  await page.keyboard.type("Portugal");
  await page.keyboard.press("Enter");
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "03-dog-dialog.png");
  await closeDialog(page);

  await page.goto(`/my/competitions/${open.competitionId}`);
  await editMode(page);
  await shot(page, "04-competition-edit.png");

  await page
    .getByRole("button", { name: "Adicionar prova", exact: false })
    .first()
    .click();
  const trialDialog = page.getByRole("dialog");
  await trialDialog.getByLabel("Título da prova").fill("Prova de Outono");
  await trialDialog.getByLabel("Data de início").fill("2026-10-10");
  await trialDialog.getByLabel("Data de fim").fill("2026-10-11");
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "05-add-trial.png");
  await closeDialog(page);

  await page.goto(
    `/my/competitions/${open.competitionId}/stages/${open.stageId}`,
  );
  await editMode(page);
  await page
    .getByRole("button", { name: "Adicionar evento", exact: false })
    .first()
    .click();
  const eventDialog = page.getByRole("dialog");
  await eventDialog.getByLabel("Título do evento").fill("Classe 1");
  await pickFirst(
    eventDialog.getByRole("button", { name: /Disciplina/ }),
    page,
  );
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "06-add-event.png");
  await closeDialog(page);

  await page.goto(openEvent);
  await editMode(page);
  await shot(page, "07-event-config.png");

  await page
    .getByRole("button", { name: "Adicionar juiz", exact: false })
    .first()
    .click();
  const addJudge = page.getByRole("dialog");
  await addJudge.getByRole("combobox", { name: "Juiz" }).click();
  await expect(page.locator(".atom-combobox__item").first()).toBeVisible();
  await page.locator(".atom-combobox__item").first().click();
  await addJudge.getByLabel("Email").fill("juiz@exemplo.pt");
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "08-add-judge.png");
  await closeDialog(page);

  await page.goto(openEvent);
  await editMode(page);
  await page.getByRole("tab", { name: "Competidores" }).click();
  await settle(page);
  await page
    .getByRole("button", { name: "Adicionar competidor", exact: false })
    .first()
    .click();
  const addCompetitor = page.getByRole("dialog");
  await addCompetitor.getByRole("combobox", { name: "Cão" }).click();
  await expect(page.locator(".atom-combobox__item").first()).toBeVisible();
  await page.locator(".atom-combobox__item").first().click();
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "09-add-competitor.png");
  await closeDialog(page);

  await page.goto(`/stages/${open.stageId}/info`);
  await page.getByRole("button", { name: "Inscritos" }).click();
  await settle(page);
  await shot(page, "10-stage-info.png");

  // ---------------------------------------------------------------- journey 2
  await page.goto(`/stages/${open.stageId}/info`);
  await page.getByRole("button", { name: "Inscrever-se", exact: true }).click();
  const enrollDialog = page.getByRole("dialog");
  await enrollDialog.getByRole("combobox", { name: "Cão" }).click();
  await expect(page.locator(".atom-combobox__item").first()).toBeVisible();
  await page.locator(".atom-combobox__item").first().click();
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "11-enroll-dialog.png");
  await closeDialog(page);

  await page.goto(`/stages/${open.stageId}/info`);
  await page.getByRole("button", { name: "Inscritos" }).click();
  await expect(page.getByText(open.dogName).first()).toBeVisible();
  await settle(page);
  await shot(page, "12-enrolled.png");

  // ---------------------------------------------------------------- journey 3
  await page.goto(
    `/my/competitions/${scored.competitionId}/stages/${scored.stageId}/events/${scored.eventId}`,
  );
  await page.getByRole("tab", { name: "Exercícios" }).click();
  await settle(page);
  await shot(page, "13-exercises.png");

  await page.goto(openEvent);
  await page.getByRole("tab", { name: "Competidores" }).click();
  await expect(
    page.getByRole("button", { name: "Aceitar inscrição" }).first(),
  ).toBeVisible();
  await settle(page);
  await shot(page, "14-accept-enrollment.png");

  await page.goto(openEvent);
  await editMode(page);
  const deadline = page.getByLabel("Data limite de inscrição");
  await deadline.scrollIntoViewIfNeeded();
  await deadline.click();
  await settle(page);
  await shot(page, "15-close-enrollment.png");

  await page.goto(`/my/competitions/${open.competitionId}`);
  await editMode(page);
  await page
    .getByRole("button", { name: "Editar", exact: true })
    .last()
    .click();
  await expect(
    page
      .locator(".atom-dialog__content", { hasText: "Título da prova" })
      .last(),
  ).toBeVisible();
  await settle(page);
  await scrollDialogTop(page);
  await shot(page, "16-stage-today.png");
  await closeDialog(page);

  await page.goto("/my/collections/list");
  await settle(page);
  await shot(page, "17-collection.png");

  await page.goto(`/my/collections/${scored.eventId}`);
  await page
    .getByRole("button", { name: /Competidores/ })
    .first()
    .click();
  await page.getByRole("option").first().click();
  await expect(page.getByRole("spinbutton").first()).toHaveValue("8", {
    timeout: 30_000,
  });
  await settle(page, 1_200);
  await shot(page, "18-scores.png");

  await page.goto(
    `/my/competitions/${scored.competitionId}/stages/${scored.stageId}/events/${scored.eventId}`,
  );
  await page.getByRole("tab", { name: "Competidores" }).click();
  await settle(page);
  await shot(page, "19-scores-button.png");

  await page.goto(
    `/stages/${scored.stageId}/events/${scored.eventId}/classification?view=TABLE`,
  );
  await expect(page.getByText(scored.dogName).first()).toBeVisible({
    timeout: 30_000,
  });
  await settle(page);
  await shot(page, "20-classification.png");

  // ---------------------------------------------------------------- journey 4
  const query = scored.stageTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const revealFilters = async () => {
    const field = page.getByLabel("Nome da prova");
    if (!(await field.isVisible().catch(() => false))) {
      await page.getByText("Filtros", { exact: true }).click();
      await expect(field).toBeVisible();
    }
    await field.fill(query);
    await settle(page, 1_500);
  };

  await page.goto("/stages");
  await revealFilters();
  await shot(page, "21-stages-filters.png");

  await page.getByRole("button", { name: "+ Info" }).first().click();
  await expect(page).toHaveURL(/\/stages\/[^/]+\/info/);
  await settle(page);
  await shot(page, "22-plus-info.png");

  await page.goto("/stages");
  await revealFilters();
  await page
    .locator(".atom-segmented-control__item-label", { hasText: "Mapa" })
    .first()
    .click();
  await settle(page, 2_500);
  await shot(page, "23-map.png");

  await page
    .locator(".atom-segmented-control__item-label", { hasText: "Tabela" })
    .first()
    .click();
  const row = page.getByRole("row").filter({ hasText: scored.stageTitle });
  await expect(row).toBeVisible();
  await settle(page);
  await shot(page, "24-table-row.png");
  await row.click();

  await page.getByRole("button", { name: "Classificação" }).first().click();
  await expect(page).toHaveURL(/\/classification/);
  await expect(page.getByText(scored.dogName).first()).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "Ver detalhe" }).first().click();
  await settle(page, 1_200);
  await shot(page, "25-see-detail.png");

  await page.locator('button[title="Fixar"]').first().click();
  await expect(page.locator('button[title="Desafixar"]').first()).toBeVisible();
  await page
    .locator(".atom-segmented-control__item-label", { hasText: "Tabela" })
    .first()
    .click();
  await settle(page, 1_200);
  await shot(page, "26-pin.png");
});
