import type { UserProfileResponseDTO } from "@/services/secured/fetch-user-data/fetchUserData.types";

export const organizerUser: UserProfileResponseDTO = {
  email: "organizer@k9x.test",
  image: "https://example.com/organizer.png",
  name: "Olivia Organizer",
  organizer: true,
};

export const competitorUser: UserProfileResponseDTO = {
  email: "competitor@k9x.test",
  image: "https://example.com/competitor.png",
  name: "Carlos Competitor",
  organizer: false,
};

export const mockUser = organizerUser;
