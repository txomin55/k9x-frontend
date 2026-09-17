import type { UserProfileResponseDTO } from "@/services/secured/fetch-user-data/fetchUserData.types";

const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export const organizerUser: UserProfileResponseDTO = {
  email: "organizer@k9x.test",
  image: TRANSPARENT_PNG,
  name: "Olivia Organizer",
  notificationsEnabled: true,
  organizer: true,
  subscriptions: { eventIds: [] },
};

export const competitorUser: UserProfileResponseDTO = {
  email: "competitor@k9x.test",
  image: TRANSPARENT_PNG,
  name: "Carlos Competitor",
  notificationsEnabled: true,
  organizer: false,
  subscriptions: { eventIds: [] },
};

export const mockUser = organizerUser;
