import { api } from "@/stores/api";

export default async () => await api().getDogs();
