import type { StageDetailResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export const defaultStageDetail: StageDetailResponseDTO = {
  id: "stage-older",
  name: "Sevilla Summer Trial",
  competitionName: "Earlier public trial",
  address: "Calle Betis 1, Sevilla",
  organizer: "Sevilla K9 Club",
  dateFrom: 1_720_000_000_000,
  dateTo: 1_720_086_400_000,
  notifications: [],
  events: [
    {
      id: "event-detail-1",
      name: "Agility Standard",
      status: "OPEN",
      enrollmentOpened: true,
      enrollmentDeadline: 1_730_000_000_000,
      discipline: { id: "disc-1", name: "Agility" },
      configuration: { id: "config-1", name: "Standard" },
      awards: [{ id: "caciob", name: "CACIOB" }],
      rank: "1",
      competitors: [
        {
          dog: { id: "dog-1", name: "Rex" },
          owner: "Ana Perez",
          handler: "Ana Perez",
          team: "Team Alpha",
          country: "ES",
          breed: "Border Collie",
        },
        {
          dog: { id: "dog-2", name: "Luna" },
          owner: "Marc Soler",
          handler: "Marc Soler",
          team: "Team Beta",
          country: "FR",
          breed: "Australian Shepherd",
        },
      ],
    },
  ],
};
