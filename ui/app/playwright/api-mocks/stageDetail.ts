import type { StageDetailResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export const defaultStageDetail: StageDetailResponseDTO = {
  id: "stage-older",
  name: "Sevilla Summer Trial",
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
      enrollmentOpened: false,
      enrollmentDeadline: 0,
      discipline: { id: "disc-1", name: "Agility" },
      configuration: { id: "config-1", name: "Standard" },
      competitors: [
        {
          dog: { id: "dog-1", name: "Rex" },
          owner: "Ana Perez",
          team: "Team Alpha",
          country: "ES",
          breed: "Border Collie",
        },
        {
          dog: { id: "dog-2", name: "Luna" },
          owner: "Marc Soler",
          team: "Team Beta",
          country: "FR",
          breed: "Australian Shepherd",
        },
      ],
    },
  ],
};
