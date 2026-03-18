import { api } from "@/stores/api";

export default async (data) => {
  const client = api();
  if (!client) throw new Error("API client is not initialized");
  return client.login(null, data);
};
