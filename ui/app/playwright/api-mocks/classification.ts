import type { StageEventClassificationResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export const defaultClassification: StageEventClassificationResponseDTO = {
  event: { id: "stage-latest-event-1", name: "Agility Standard" },
  discipline: { id: "disc-1", name: "Agility" },
  stage: { id: "stage-latest", name: "Valencia Autumn Trial" },
  configuration: { id: "config-1", name: "Standard" },
  lastUpdated: 1_730_050_000_000,
  status: "COMPLETED",
  obdx: {
    competitors: [
      {
        position: 1,
        dog: { id: "dog-1", name: "Rex" },
        country: "ES",
        owner: "Ana Perez",
        handler: "Ana Perez",
        team: "Team Alpha",
        identity: "ES-001",
        scoreRating: 1,
        status: "COMPLETED",
        exercises: [],
        totalScore: 98,
        tied: false,
        startOrder: 1,
      },
      {
        position: 2,
        dog: { id: "dog-2", name: "Luna" },
        country: "FR",
        owner: "Marc Soler",
        handler: "Marc Soler",
        team: "Team Beta",
        identity: "FR-002",
        scoreRating: 1,
        status: "COMPLETED",
        exercises: [],
        totalScore: 95,
        tied: false,
        startOrder: 2,
      },
    ],
  },
};
