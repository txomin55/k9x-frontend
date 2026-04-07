import type { User } from "@/services/api/fetch-user-data/UserResponse.types";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};
