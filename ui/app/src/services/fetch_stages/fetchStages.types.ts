import type { CompetitionLocation } from "@/services/api/competition_crud/competitionCrudTypes";

export interface StageEventSummaryWeb {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}

export interface GetStageListWeb {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEventSummaryWeb[];
  id: string;
  location?: CompetitionLocation;
  name: string;
}

export type Stage = GetStageListWeb;
export type StageEvent = StageEventSummaryWeb;
