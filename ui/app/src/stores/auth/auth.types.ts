import { UserProfileResponseDTO } from "@/services/secured/fetch-user-data/fetchUserData.types";

export type AuthState = {
  user: UserProfileResponseDTO | null;
  loading: boolean;
  error: Error | null;
};
