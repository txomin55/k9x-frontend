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
  stages?: PostCompetitionStage[];
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competition[] | null;
}

export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface PostCompetitionStage {
  dateFrom?: number;
  dateTo?: number;
  id?: string;
  name?: string;
}

export type Competitions = Competition;
export type CompetitionStage = Stage;

export interface Notification {
  date: number;
  id: string;
  text: string;
}

export interface StageEventScore {
  exerciseId: string;
  id: string;
  score: number;
}

export interface PostStageEventScore {
  exerciseId?: string;
  id?: string;
  score?: number;
}

export interface StageExercise {
  id: string;
  order: number;
  text: string;
}

export interface PostStageExercise {
  id?: string;
  order?: number;
  text?: string;
}

export interface StageEventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface PostStageEventConfiguration {
  federation?: string;
  id?: string;
  name?: string;
  version?: number;
}

export interface StageJudge {
  collectorEmail: string;
  name: string;
}

export interface PostStageJudge {
  collectorEmail?: string;
  name?: string;
}

export interface StageCompetitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: StageEventScore[];
}

export interface PostStageCompetitor {
  finalScore?: number;
  id?: string;
  identity?: string;
  name?: string;
  owner?: string;
  scores?: PostStageEventScore[];
}

export interface StageEvent {
  competitors: StageCompetitor[];
  configuration: StageEventConfiguration;
  discipline: string;
  exercises: StageExercise[];
  id: string;
  judges: StageJudge[];
  name: string;
  status: string;
}

export interface PostStageEvent {
  competitors?: PostStageCompetitor[];
  configuration?: PostStageEventConfiguration;
  discipline?: string;
  exercises?: PostStageExercise[];
  id?: string;
  judges?: PostStageJudge[];
  name?: string;
  status?: string;
}

export interface Stage {
  dateFrom: number;
  dateTo: number;
  events: StageEvent[];
  id: string;
  name: string;
}

export interface ApiStage {
  competitionId: string;
  dateFrom: number;
  dateTo: number;
  events: ApiStageEvent[];
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

export type ApiStageEvent = StageEvent;
export type ApiPostStageEvent = PostStageEvent;
export type ApiStageCompetitor = StageCompetitor;
export type ApiPostStageCompetitor = PostStageCompetitor;
export type ApiStageEventScore = StageEventScore;
export type ApiPostStageEventScore = PostStageEventScore;
export type ApiStageExercise = StageExercise;
export type ApiPostStageExercise = PostStageExercise;
export type ApiStageEventConfiguration = StageEventConfiguration;
export type ApiPostStageEventConfiguration = PostStageEventConfiguration;
export type ApiStageJudge = StageJudge;
export type ApiPostStageJudge = PostStageJudge;
