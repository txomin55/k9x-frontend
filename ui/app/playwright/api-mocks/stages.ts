import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export const defaultStages: StageSummaryResponseDTO[] = [
  {
    id: "stage-latest",
    name: "Valencia Autumn Trial",
    description: "Most recent public trial",
    country: "ES",
    dateFrom: 1_730_000_000_000,
    dateTo: 1_730_086_400_000,
    status: "PUBLISHED",
    organizer: "Valencia K9 Club",
    location: {
      address: "Av. de les Corts Valencianes 1, Valencia",
      latitude: 39.47,
      longitude: -0.37,
    },
    events: [
      {
        id: "stage-latest-event-1",
        name: "Agility Standard",
        competitors: 12,
        status: "OPEN",
        discipline: { id: "disc-1", name: "Agility" },
      },
    ],
  },
  {
    id: "stage-older",
    name: "Sevilla Summer Trial",
    description: "Earlier public trial",
    country: "ES",
    dateFrom: 1_720_000_000_000,
    dateTo: 1_720_086_400_000,
    status: "PUBLISHED",
    organizer: "Sevilla K9 Club",
    location: {
      address: "Calle Betis 1, Sevilla",
      latitude: 37.38,
      longitude: -5.99,
    },
    events: [],
  },
];
