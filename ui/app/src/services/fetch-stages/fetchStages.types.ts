import type { CompetitionLocation } from "@/services/api/competition-crud/competitionCrud.types";

export interface StageEventSummary {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}

export interface StageSummary {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEventSummary[];
  id: string;
  location?: CompetitionLocation;
  name: string;
}

export type Stage = StageSummary;
export type StageEvent = StageEventSummary;
