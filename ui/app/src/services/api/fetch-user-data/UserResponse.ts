import type { UserProfile } from "@/services/api/fetch-user-data/fetchUserData.types";
import type { User } from "@/services/api/fetch-user-data/UserResponse.types";

export type { User } from "@/services/api/fetch-user-data/UserResponse.types";

export default (data: UserProfile): User => ({
  email: data.email,
  image: data.image,
  initials: data.name.slice(0, 2),
  name: data.name,
  news: [],
});
