import UserResponse from "@/services/fetch_user_data/UserResponse";
import { api } from "@/stores/api";

export default async () => {
  const rawUser = await api().getUserData();
  return UserResponse(rawUser);
};
