import type { CompetitionStage } from "@/services/api/competition_crud/competitionCrudTypes";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description?: string;
  id: string;
  name: string;
  stages?: CompetitionStage[];
  status: string;
}
