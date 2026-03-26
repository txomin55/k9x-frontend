import type { CompetitionLocation } from "@/services/competition_crud/competitionCrudTypes";

export type { CompetitionLocation };

export interface Competitions {
  country: string;
  description: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  stages: CompetitionStage[];
  status: string;
}

export interface CompetitionStage {
  dateFrom: number;
  dateTo: number;
  id: string;
  name: string;
}
