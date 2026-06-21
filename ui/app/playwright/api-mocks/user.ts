import type { UserProfileResponseDTO } from "@/services/secured/fetch-user-data/fetchUserData.types";

const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export const organizerUser: UserProfileResponseDTO = {
  email: "organizer@k9x.test",
  image: TRANSPARENT_PNG,
  name: "Olivia Organizer",
  organizer: true,
};

export const competitorUser: UserProfileResponseDTO = {
  email: "competitor@k9x.test",
  image: TRANSPARENT_PNG,
  name: "Carlos Competitor",
  organizer: false,
};

export const mockUser = organizerUser;
