import type { Stage } from "@/services/api/competition-crud/competitionCrudTypes";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description?: string;
  id: string;
  name: string;
  stages?: Stage[];
  status: string;
}
