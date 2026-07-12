import type { Page } from "@playwright/test";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import type { DisciplineFederationConfigurationResponseDTO } from "@/services/secured/configurations/configurations.types";
import type { EventDetailRawResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { COMPETITION_STATUS } from "@/utils/competition";
import { defaultDogs } from "@test/api-mocks/dogs";
import { defaultJudges } from "@test/api-mocks/judges";
import { defaultAwards } from "@test/api-mocks/awards";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import { COMPETITOR_STATUS } from "@/utils/event";

export const EVENT_DETAIL_ID = "event-detail-1";
export const EVENT_DETAIL_STAGE_ID = "stage-detail-1";
export const EVENT_DETAIL_COMPETITION_ID = "comp-detail-1";

const FEDERATION = { id: "fed-1", name: "Fed One", country: "ES" };
const CONFIGURATION_ID = "config-1";

const judgeName = (id: string) =>
  defaultJudges.find((judge) => judge.id === id)?.name ?? id;
const dogById = (id: string) => defaultDogs.find((dog) => dog.id === id);
const awardById = (id: string) =>
  defaultAwards.find((award) => award.id === id);

const buildRawEvent = (eventStatus: string): EventDetailRawResponseDTO => {
  const [seedDog] = defaultDogs;
  return {
    obdx: {
      id: EVENT_DETAIL_ID,
      name: "Detail Event",
      status: eventStatus,
      discipline: { id: "obdx", name: "FCI Obedience" },
      stage: { id: EVENT_DETAIL_STAGE_ID, name: "Detail Stage" },
      enrollmentDeadline: 1_717_200_000_000,
      scoreCalculation: "AVG",
      awards: [],
      configuration: {
        federation: FEDERATION,
        id: CONFIGURATION_ID,
        name: "Config One",
      },
      judges: [
        {
          id: "judge-1",
          name: judgeName("judge-1"),
          collectorEmail: "alpha@k9x.test",
        },
      ],
      exercises: [
        {
          id: "conf-ex-1",
          name: "Heel work",
          position: 1,
          tags: ["base"],
          judges: [
            {
              id: "judge-1",
              name: judgeName("judge-1"),
            },
          ],
        },
      ],
      competitors: [
        {
          dog: { id: seedDog.id, name: seedDog.name },
          position: 1,
          team: seedDog.team,
          identity: seedDog.identity,
          owner: seedDog.owner,
          handler: seedDog.handler,
          country: seedDog.country.id,
          status: "ENROLLED",
          breed: seedDog.breed,
        },
      ],
    },
  };
};

const configurations: DisciplineFederationConfigurationResponseDTO = {
  obdx: {
    federations: [
      {
        info: FEDERATION,
        configurations: [
          {
            id: CONFIGURATION_ID,
            name: "Config One",
            exercises: [
              { id: "conf-ex-1", name: "Heel work" },
              { id: "conf-ex-2", name: "Recall" },
            ],
          },
        ],
      },
    ],
  },
};

// The competition cache must contain the event's stage so `updateApiEvent` can
// resolve its context (competition + stage) when committing the optimistic edit.
const buildCompetitions = (): CompetitionResponseDTO[] => [
  {
    id: EVENT_DETAIL_COMPETITION_ID,
    name: "Detail Competition",
    description: "",
    country: "ES",
    address: "",
    status: COMPETITION_STATUS.CREATED,
    notifications: [],
    stages: [
      {
        id: EVENT_DETAIL_STAGE_ID,
        name: "Detail Stage",
        dateFrom: 4_102_444_800_000,
        dateTo: 4_102_531_200_000,
        status: "CREATED",
        events: [
          {
            id: EVENT_DETAIL_ID,
            name: "Detail Event",
            discipline: { id: "obdx", name: "FCI Obedience" },
            status: "CREATED",
            rank: "1",
          },
        ],
      },
    ],
  },
];
// The PUT payload carries the full event (UpdateEventRequestDTO). Rebuild the
// raw obdx arrays from it (looking up judge names and dog details) so a
// post-flush reload reflects every sub-entity change.
const applyEventUpdate = (
  event: EventDetailRawResponseDTO,
  payload: {
    name: string;
    enrollmentDeadline: number;
    scoreCalculation: string;
    awards?: string[];
    judges?: { id: string; collectorEmail: string }[];
    exercises?: {
      id: string;
      name: string;
      position: number;
      tags: string[];
      judgesIds: string[];
    }[];
    competitors?: { dogId: string; position: number; accepted: boolean }[];
  },
) => {
  const previous = event.obdx;

  event.obdx = {
    ...previous,
    name: payload.name,
    enrollmentDeadline: payload.enrollmentDeadline,
    scoreCalculation: payload.scoreCalculation,
    awards: (payload.awards ?? []).map((id) => ({
      id,
      name: awardById(id)?.name ?? id,
    })),
    judges: (payload.judges ?? []).map((judge) => ({
      id: judge.id,
      collectorEmail: judge.collectorEmail,
      name: judgeName(judge.id),
    })),
    exercises: (payload.exercises ?? []).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      position: exercise.position,
      tags: exercise.tags,
      judges: exercise.judgesIds.map((id) => ({ id, name: judgeName(id) })),
    })),
    competitors: (payload.competitors ?? []).map((competitor) => {
      const existing = previous.competitors.find(
        (entry) => entry.dog.id === competitor.dogId,
      );
      const dog = dogById(competitor.dogId);
      return {
        dog: {
          id: competitor.dogId,
          name: dog?.name ?? existing?.dog.name ?? "",
        },
        position: competitor.position,
        team: dog?.team ?? existing?.team ?? "",
        identity: dog?.identity ?? existing?.identity ?? "",
        owner: dog?.owner ?? existing?.owner ?? "",
        handler: dog?.handler ?? existing?.handler ?? "",
        country: dog?.country.id ?? existing?.country ?? "",
        status:
          existing?.status ??
          (competitor.accepted
            ? COMPETITOR_STATUS.ENROLLED
            : COMPETITOR_STATUS.PENDING_ENROLL_ACCEPT),
        breed: dog?.breed ?? existing?.breed ?? { id: "", name: "" },
      };
    }),
  };
};

/**
 * Stateful event-detail mocks covering name, judges, exercises and competitors.
 * GET returns the live raw event; PUT `/secured/obdx/events/*` rebuilds the raw
 * arrays from the payload; PUT `.../not-competing` flips a competitor's status.
 */
export const setupEventDetailCrud = (
  page: Page,
  options?: { eventStatus?: string },
) => {
  const event = buildRawEvent(options?.eventStatus ?? "STARTED");
  const competitions = buildCompetitions();

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: () => competitions,
      pathname: "/secured/competitions",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: () => event,
      pathname: "/secured/events/*",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: () => defaultJudges,
      pathname: "/secured/judges",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: configurations,
      pathname: "/secured/disciplines/*/configurations",
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (_match, request) => {
        const payload = request.postDataJSON();
        const target = event.obdx.competitors.find(
          (entry) => entry.dog.id === payload.dogId,
        );
        if (target) {
          target.status = payload.notCompeting ? "NOT_COMPETING" : "ENROLLED";
          target.notCompeting = payload.notCompeting;
        }
        return "";
      },
      pathname: "/secured/obdx/events/*/not-competing",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (_match, request) => {
        applyEventUpdate(event, request.postDataJSON());
        return "";
      },
      pathname: "/secured/obdx/events/*",
      status: 204,
    }),
  ]);
};
