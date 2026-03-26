import type { Competitions } from "@/services/fetch_competitions/fetchCompetitions";

export interface Competition {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  notifications?: Notification[];
  stages?: Stage[];
  status: string;
}

export interface PostCompetition {
  country?: string;
  description?: string;
  id?: string;
  location?: CompetitionLocation;
  name?: string;
  stages?: CompetitionStage[];
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competitions[] | null;
}

export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompetitionStage {
  dateFrom?: number;
  dateTo?: number;
  id?: string;
  name?: string;
}

export interface Notification {
  date: number;
  id: string;
  text: string;
}

export interface Stage {
  dateFrom: number;
  dateTo: number;
  events: Event[];
  id: string;
  name: string;
}

export interface Event {
  competitors?: Competitor[];
  configuration?: EventConfiguration;
  discipline: string;
  exercises: Exercise[];
  id: string;
  judges?: Judge[];
  name: string;
  status: string;
}

export interface Competitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: EventScore[];
}

export interface EventScore {
  exerciseId: string;
  id: string;
  score: number;
}

export interface EventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface Exercise {
  id: string;
  order: number;
  text: string;
}

export interface Judge {
  collectorEmail: string;
  name?: string;
}
