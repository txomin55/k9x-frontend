import type { Competitions } from "@/services/fetch_competitions/fetchCompetitions";
import type { Competition } from "@/services/competition_crud/competitionCrudTypes";

export interface ApiStage {
  competitionId: string;
  dateFrom: number;
  dateTo: number;
  discipline: string;
  events: ApiStageEvent[];
  federation: string;
  id: string;
  name: string;
}

export interface ApiPostStage {
  competitionId?: string;
  dateFrom?: number;
  dateTo?: number;
  discipline?: string;
  events?: ApiPostStageEvent[];
  federation?: string;
  id?: string;
  name?: string;
}

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competitions[] | null;
  previousStage: ApiStage | null;
}

export interface ApiStageEvent {
  competitors: ApiStageCompetitor[];
  configuration: ApiStageEventConfiguration;
  discipline: string;
  exercises: ApiStageExercise[];
  id: string;
  judges: ApiStageJudge[];
  name: string;
  status: string;
}

export interface ApiPostStageEvent {
  competitors?: ApiPostStageCompetitor[];
  configuration?: ApiPostStageEventConfiguration;
  discipline?: string;
  exercises?: ApiPostStageExercise[];
  id?: string;
  judges?: ApiPostStageJudge[];
  name?: string;
  status?: string;
}

export interface ApiStageCompetitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: ApiStageEventScore[];
}

export interface ApiPostStageCompetitor {
  finalScore?: number;
  id?: string;
  identity?: string;
  name?: string;
  owner?: string;
  scores?: ApiPostStageEventScore[];
}

export interface ApiStageEventScore {
  exerciseId: string;
  id: string;
  score: number;
}

export interface ApiPostStageEventScore {
  exerciseId?: string;
  id?: string;
  score?: number;
}

export interface ApiStageExercise {
  id: string;
  order: number;
  text: string;
}

export interface ApiPostStageExercise {
  id?: string;
  order?: number;
  text?: string;
}

export interface ApiStageEventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface ApiPostStageEventConfiguration {
  federation?: string;
  id?: string;
  name?: string;
  version?: number;
}

export interface ApiStageJudge {
  collectorEmail: string;
  name: string;
}

export interface ApiPostStageJudge {
  collectorEmail?: string;
  name?: string;
}
