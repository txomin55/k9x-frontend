import type { Page } from "@playwright/test";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import type {
  DisciplineFederationConfigurationResponseDTO
} from "@/services/secured/configurations/configurations.types";
import type { EventDetailRawResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { COMPETITION_STATUS } from "@/utils/competition";
import { defaultDogs } from "@test/api-mocks/dogs";
import { defaultJudges } from "@test/api-mocks/judges";
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

const buildRawEvent = (eventStatus: string): EventDetailRawResponseDTO => {
  const [seedDog] = defaultDogs;
  return {
    obdx: {
      id: EVENT_DETAIL_ID,
      name: "Detail Event",
      status: eventStatus,
      discipline: { id: "obdx", name: "FCI OBEDIENCE" },
      stage: { id: EVENT_DETAIL_STAGE_ID, name: "Detail Stage" },
      enrollmentDeadline: 1_717_200_000_000,
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
        { id: "conf-ex-1", name: "Heel work", position: 1, tags: ["base"] },
      ],
      competitors: [
        {
          dog: { id: seedDog.id, name: seedDog.name },
          position: 1,
          team: seedDog.team,
          identity: seedDog.identifier,
          owner: seedDog.owner,
          handler: seedDog.handler,
          country: seedDog.country,
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
        dateFrom: 1_717_200_000_000,
        dateTo: 1_717_286_400_000,
        status: "CREATED",
        events: [
          {
            id: EVENT_DETAIL_ID,
            name: "Detail Event",
            discipline: { id: "obdx", name: "FCI OBEDIENCE" },
            status: "CREATED",
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
    judges?: { id: string; collectorEmail: string }[];
    exercises?: {
      id: string;
      name: string;
      position: number;
      tags: string[];
    }[];
    competitors?: { dogId: string; position: number; accepted: boolean }[];
  },
) => {
  const previous = event.obdx;

  event.obdx = {
    ...previous,
    name: payload.name,
    enrollmentDeadline: payload.enrollmentDeadline,
    judges: (payload.judges ?? []).map((judge) => ({
      id: judge.id,
      collectorEmail: judge.collectorEmail,
      name: judgeName(judge.id),
    })),
    exercises: payload.exercises ?? [],
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
        identity: dog?.identifier ?? existing?.identity ?? "",
        owner: dog?.owner ?? existing?.owner ?? "",
        handler: dog?.handler ?? existing?.handler ?? "",
        country: dog?.country ?? existing?.country ?? "",
        status:
          existing?.status ??
          (competitor.accepted
            ? COMPETITOR_STATUS.ENROLLED
            : COMPETITOR_STATUS.PENDING_ENROLL_ACCEPT),
        breed: dog?.breed ?? existing?.breed ?? "",
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
