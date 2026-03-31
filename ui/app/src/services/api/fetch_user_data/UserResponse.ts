import type { UserModel } from "@/services/api/fetch_user_data/fetchUserData.types";
import type { User } from "@/services/api/fetch_user_data/UserResponse.types";

export type { User } from "@/services/api/fetch_user_data/UserResponse.types";

export default (data: UserModel): User => ({
  email: data.email,
  image: data.image,
  initials: data.name.slice(0, 2),
  name: data.name,
  news: [],
});
