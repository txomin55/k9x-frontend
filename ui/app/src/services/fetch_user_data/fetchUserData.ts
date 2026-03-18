import UserResponse from "@/services/fetch_user_data/UserResponse";
import { api } from "@/stores/api";

export default async () => {
  const client = api();
  if (!client) throw new Error("API client is not initialized");
  const rawUser = await client.getUserData();
  return UserResponse(rawUser);
};
