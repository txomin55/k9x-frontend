import type { CompetitionLocation } from "@/services/fetch_competitions/fetchCompetitions.types";

export interface Stage {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEvent[];
  id: string;
  location?: CompetitionLocation;
  name: string;
}

export interface StageEvent {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}
