import type { Page } from "@playwright/test";
import type {
  CollectionResponseDTO,
  CollectionsResponseDTO,
  UpdateCollectionScoreRequestDTO,
} from "@/services/secured/collection-crud/collectionCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const SINGLE_JUDGE = { id: "judge-1", name: "Judge Alpha" };

export const defaultCollectionsList: CollectionsResponseDTO[] = [
  {
    competitionName: "Barcelona Spring Trial",
    stageName: "Day 1",
    eventName: "Obedience Open",
    eventId: "event-1",
    status: "STARTED",
    judges: [SINGLE_JUDGE],
  },
];

// Detail returns data for a single judge (one column to fill).
export const defaultCollectionDetail: CollectionResponseDTO = {
  discipline: { id: "disc-1", name: "Obedience" },
  configuration: {
    allowedValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    description: "Allowed values 1-10",
  },
  obdx: {
    competitors: [
      {
        competitor: {
          dog: { id: "dog-1", name: "Rex" },
          position: 1,
          team: "Team Alpha",
          identity: "ES-001",
          owner: "Ana Perez",
          country: "ES",
          status: "ENROLLED",
          breed: "Border Collie",
          notCompeting: false,
        },
        exercises: [
          {
            exercise: { id: "ex-1", name: "Heel work", position: 1 },
            collectionScores: [{ judge: SINGLE_JUDGE, score: null }],
          },
        ],
      },
    ],
  },
};

const applyScore = (
  detail: CollectionResponseDTO,
  { dogId, exerciseId, judgeId, score }: UpdateCollectionScoreRequestDTO,
) => {
  const target = detail.obdx.competitors
    .filter((entry) => entry.competitor.dog.id === dogId)
    .flatMap((entry) => entry.exercises)
    .filter((entry) => entry.exercise.id === exerciseId)
    .flatMap((entry) => entry.collectionScores)
    .find((entry) => entry.judge.id === judgeId);
  if (target) target.score = score;
};

/**
 * Stateful collections mocks: the score PUT persists into the detail so a
 * post-flush reload reflects it. The detail returns a single judge.
 */
export const setupCollectionScoring = (page: Page) => {
  const detail: CollectionResponseDTO = structuredClone(defaultCollectionDetail);

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: defaultCollectionsList,
      pathname: "/secured/collections",
    }),
    setRouteResponses(page, {
      method: "GET",
      payload: () => detail,
      pathname: "/secured/events/*/collections",
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (_match, request) => {
        applyScore(detail, request.postDataJSON());
        return "";
      },
      pathname: "/secured/obdx/events/*/score",
      status: 204,
    }),
  ]);
};
