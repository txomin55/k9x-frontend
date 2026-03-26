import type { UserModel } from "@/services/fetch_user_data/fetchUserData.types";
import type { User } from "@/services/fetch_user_data/UserResponse.types";

export type { User } from "@/services/fetch_user_data/UserResponse.types";

export default (data: UserModel): User => ({
  getName: () => data.name,
  getImage: () => data.image,
  getEmail: () => data.email,
  getInitials: () => data.name.slice(0, 2),
  getNews: () => [],
});
