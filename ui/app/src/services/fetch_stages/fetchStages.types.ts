import type { CompetitionLocation } from "@/services/api/competition_crud/competitionCrudTypes";

export interface PublicStageEventSummary {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}

export interface PublicStageSummary {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: PublicStageEventSummary[];
  id: string;
  location?: CompetitionLocation;
  name: string;
}

export type Stage = PublicStageSummary;
export type StageEvent = PublicStageEventSummary;
