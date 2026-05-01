import { UserProfile } from "@/services/secured/fetch-user-data/fetchUserData.types";

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
};
