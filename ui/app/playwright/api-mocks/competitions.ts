import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { COMPETITION_STATUS } from "@/utils/competition";

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
          },
        ],
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
