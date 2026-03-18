import { api } from "@/stores/api";

export default async () => {
  const client = api();
  if (!client) throw new Error("API client is not initialized");
  return client.getDogs();
};
