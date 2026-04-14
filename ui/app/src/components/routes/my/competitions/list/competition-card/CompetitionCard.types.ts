import type { CompetitionStageDetail } from "@/services/api/competition-crud/competitionCrud.types";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description?: string;
  id: string;
  name: string;
  stages?: CompetitionStageDetail[];
  status: string;
}
