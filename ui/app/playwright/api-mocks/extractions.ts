import type { ExtractionLogDayResponseDTO } from "@/services/fetch-extractions/fetchExtractions.types";

export const defaultExtractionLog: ExtractionLogDayResponseDTO[] = [
  {
    date: 1_758_585_600_000,
    stages: [
      {
        id: "imported-latest",
        name: "Imported Spring Trial",
        competitionName: "CPC Spring Cup",
        country: "ES",
        dateFrom: 1_740_000_000_000,
        dateTo: 1_740_086_400_000,
        events: [
          {
            id: "imported-latest-event-1",
            name: "Obedience Class 3",
            competitors: 14,
            discipline: { id: "OBDX", name: "FCI Obedience" },
            rank: "A",
          },
        ],
      },
    ],
  },
  {
    date: 1_757_980_800_000,
    stages: [
      {
        id: "imported-older",
        name: "Imported Winter Trial",
        competitionName: "CPC Winter Cup",
        country: "ES",
        dateFrom: 1_736_000_000_000,
        dateTo: 1_736_086_400_000,
        events: [
          {
            id: "imported-older-event-1",
            name: "Obedience Class 1",
            competitors: 9,
            discipline: { id: "OBDX", name: "FCI Obedience" },
          },
        ],
      },
    ],
  },
];
