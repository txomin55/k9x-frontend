import type { CompetitionStage } from "@/services/fetch_competitions/fetchCompetitions.types";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description: string;
  id: string;
  name: string;
  stages: CompetitionStage[];
  status: string;
}
