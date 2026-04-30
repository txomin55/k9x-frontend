import { UserProfile } from "@/services/api/fetch-user-data/fetchUserData.types";

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
};
