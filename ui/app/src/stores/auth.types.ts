import type { User } from "@/services/fetch_user_data/UserResponse.types";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};
