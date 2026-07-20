import type { Page } from "@playwright/test";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { COMPETITION_STATUS } from "@/utils/competition";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import { EVENT_STATUS } from "@/utils/event";
import { STAGE_STATUS } from "@/utils/stage";

export const defaultCompetitions: CompetitionResponseDTO[] = [
  {
    id: "comp-started-1",
    name: "Barcelona Spring Trial",
    description: "Opening trial of the season",
    country: "ES",
    address: "Carrer de Mallorca 1, Barcelona",
    status: COMPETITION_STATUS.STARTED,
    notifications: [],
    stages: [
      {
        id: "stage-1",
        name: "Day 1",
        dateFrom: 1_717_200_000_000,
        dateTo: 1_717_286_400_000,
        events: [
          {
            id: "event-1",
            name: "Agility Standard",
            discipline: { id: "disc-1", name: "Agility" },
            status: EVENT_STATUS.CREATED,
            rank: "1",
          },
        ],
        status: STAGE_STATUS.CREATED,
      },
    ],
  },
  {
    id: "comp-created-1",
    name: "Madrid Summer Cup",
    description: "Draft competition still being prepared",
    country: "ES",
    address: "Calle Gran Vía 5, Madrid",
    status: COMPETITION_STATUS.CREATED,
    notifications: [],
    stages: [],
  },
];

const toCreatedCompetition = (payload: IdNameDTO): CompetitionResponseDTO => ({
  id: payload.id,
  name: payload.name,
  description: "",
  country: "",
  address: "",
  status: COMPETITION_STATUS.CREATED,
  notifications: [],
  stages: [],
});

/**
 * Stateful `/secured/competitions` mocks so a post-flush reload reflects each
 * write. GET returns the live collection; POST appends a created competition
 * (built from the `{ id, name }` create payload); PUT merges the edit payload;
 * DELETE removes by id.
 */
const deletableCompetition: CompetitionResponseDTO = {
  id: "comp-deletable-1",
  name: "Valencia Winter Cup",
  description: "Created competition without stages (deletable)",
  country: "ES",
  address: "Avinguda del Port 1, Valencia",
  status: COMPETITION_STATUS.CREATED,
  notifications: [],
  stages: [],
};

// CREATED competition (no own delete button) carrying one editable/deletable
// stage (status != "created"), so stage edit/delete buttons are unambiguous.
const competitionWithStage: CompetitionResponseDTO = {
  id: "comp-with-stage-1",
  name: "Sevilla Autumn Trial",
  description: "Created competition with one stage",
  country: "ES",
  address: "Avenida de la Constitución 1, Sevilla",
  status: COMPETITION_STATUS.CREATED,
  notifications: [],
  stages: [
    {
      id: "stage-existing-1",
      name: "Existing Trial",
      dateFrom: 1_717_200_000_000,
      dateTo: 1_717_286_400_000,
      status: STAGE_STATUS.CREATED,
      events: [],
    },
  ],
};

// CREATED competition with a stage that already has one event, for event
// edit/delete flows on the stage detail page.
const competitionWithEvent: CompetitionResponseDTO = {
  id: "comp-with-event-1",
  name: "Bilbao Spring Trial",
  description: "Created competition with one stage and one event",
  country: "ES",
  address: "Gran Vía 1, Bilbao",
  status: COMPETITION_STATUS.CREATED,
  notifications: [],
  stages: [
    {
      id: "stage-with-event-1",
      name: "Event Trial",
      dateFrom: 1_717_200_000_000,
      dateTo: 1_717_286_400_000,
      status: STAGE_STATUS.CREATED,
      events: [
        {
          id: "event-existing-1",
          name: "Existing Event",
          discipline: { id: "obdx", name: "FCI Obedience" },
          status: EVENT_STATUS.CREATED,
          rank: "1",
        },
      ],
    },
  ],
};

type StageItem = NonNullable<CompetitionResponseDTO["stages"]>[number];

export const setupCompetitionsCrud = (page: Page) => {
  const competitions: CompetitionResponseDTO[] = [
    ...defaultCompetitions,
    deletableCompetition,
    competitionWithStage,
    competitionWithEvent,
  ].map((competition) => structuredClone(competition));
  const indexOf = (id: string | undefined) =>
    competitions.findIndex((competition) => competition.id === id);
  const competitionWithStageId = (stageId: string | undefined) =>
    competitions.find((competition) =>
      competition.stages?.some((stage) => stage.id === stageId),
    );
  const findStage = (stageId: string | undefined) =>
    competitionWithStageId(stageId)?.stages?.find(
      (stage) => stage.id === stageId,
    );
  const findStageWithEvent = (eventId: string | undefined) =>
    competitions
      .flatMap((competition) => competition.stages ?? [])
      .find((stage) => stage.events?.some((event) => event.id === eventId));

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: () => competitions,
      pathname: "/secured/competitions",
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: (_match, request) => {
        competitions.push(toCreatedCompetition(request.postDataJSON()));
        return "";
      },
      pathname: "/secured/competitions",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (match, request) => {
        const index = indexOf(match?.[1]);
        if (index !== -1) {
          competitions[index] = {
            ...competitions[index],
            ...request.postDataJSON(),
          };
        }
        return "";
      },
      pathname: "/secured/competitions/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "DELETE",
      payload: (match) => {
        const index = indexOf(match?.[1]);
        if (index !== -1) competitions.splice(index, 1);
        return "";
      },
      pathname: "/secured/competitions/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: (_match, request) => {
        const payload = request.postDataJSON();
        const competition = competitions.find(
          (entry) => entry.id === payload.competitionId,
        );
        const stage: StageItem = {
          id: payload.id,
          name: payload.name,
          dateFrom: payload.dateFrom ?? 0,
          dateTo: payload.dateTo ?? 0,
          events: [],
          status: STAGE_STATUS.CREATED,
        };
        competition?.stages?.push(stage);
        return "";
      },
      pathname: "/secured/stages",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (match, request) => {
        const competition = competitionWithStageId(match?.[1]);
        const stage = competition?.stages?.find((s) => s.id === match?.[1]);
        if (stage) Object.assign(stage, request.postDataJSON());
        return "";
      },
      pathname: "/secured/stages/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "DELETE",
      payload: (match) => {
        const competition = competitionWithStageId(match?.[1]);
        if (competition?.stages) {
          competition.stages = competition.stages.filter(
            (stage) => stage.id !== match?.[1],
          );
        }
        return "";
      },
      pathname: "/secured/stages/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: (_match, request) => {
        const payload = request.postDataJSON();
        const stage = findStage(payload.stageId);
        stage?.events?.push({
          id: payload.id,
          name: payload.name,
          discipline: { id: payload.disciplineId, name: "" },
          status: EVENT_STATUS.CREATED,
          rank: "1",
        });
        return "";
      },
      pathname: "/secured/events",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "DELETE",
      payload: (match) => {
        const stage = findStageWithEvent(match?.[1]);
        if (stage?.events) {
          stage.events = stage.events.filter(
            (event) => event.id !== match?.[1],
          );
        }
        return "";
      },
      pathname: "/secured/events/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (match, request) => {
        const stage = findStageWithEvent(match?.[1]);
        const event = stage?.events?.find((entry) => entry.id === match?.[1]);
        if (event) event.name = request.postDataJSON().name;
        return "";
      },
      pathname: "/secured/obdx/events/*",
      status: 204,
    }),
  ]);
};
