import { api } from "@/stores/api";

export default async (data) => await api().login(null, data);
