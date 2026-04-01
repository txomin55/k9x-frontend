export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface PublicCompetitionNotification {
  date: number;
  id: string;
  text: string;
}

export interface PublicEventScore {
  exerciseId: string;
  id: string;
  score: number;
}

export interface PublicEventExercise {
  id: string;
  order: number;
  text: string;
}

export interface PublicEventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface PublicStageJudge {
  collectorEmail: string;
  name: string;
}

export interface PublicEventCompetitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: PublicEventScore[];
}

export interface PublicEventDetail {
  competitors: PublicEventCompetitor[];
  configuration: PublicEventConfiguration;
  discipline: string;
  exercises: PublicEventExercise[];
  id: string;
  judges: PublicStageJudge[];
  name: string;
  status: string;
}

export interface PublicCompetitionStage {
  dateFrom: number;
  dateTo: number;
  events: PublicEventDetail[];
  id: string;
  name: string;
}

export interface PublicCompetitionDetail {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  notifications?: PublicCompetitionNotification[];
  stages?: PublicCompetitionStage[];
  status: string;
}

export interface CreateCompetitionRequest {
  id?: string;
  name?: string;
}

export interface CreateStageRequest {
  competitionId?: string;
  id?: string;
  name?: string;
}

export interface UpdateCompetitionRequest {
  country?: string;
  description?: string;
  id?: string;
  location?: CompetitionLocation;
  name?: string;
  stages?: CreateStageRequest[];
}

export interface UpdateStageRequest {
  competitionId?: string;
  dateFrom?: number;
  dateTo?: number;
  id?: string;
  name?: string;
}

export interface EventScore {
  exerciseId?: string;
  id?: string;
  score?: number;
}

export interface EventExercise {
  id?: string;
  order?: number;
  text?: string;
}

export interface EventConfiguration {
  federation?: string;
  id?: string;
  name?: string;
  version?: number;
}

export interface StageJudge {
  collectorEmail?: string;
  name?: string;
}

export interface EventCompetitor {
  finalScore?: number;
  id?: string;
  identity?: string;
  name?: string;
  owner?: string;
  scores?: EventScore[];
}

export interface CreateEventRequest {
  id: string;
  name: string;
  stageId: string;
}

export interface UpdateEventRequest {
  competitors: EventCompetitor[];
  configuration: EventConfiguration;
  discipline: string;
  exercises: EventExercise[];
  id: string;
  judges: StageJudge[];
  name: string;
  stageId: string;
  status: string;
}

export interface EventResponse extends PublicEventDetail {
  stageId: string;
}

export interface PostCompetitionStage {
  dateFrom?: number;
  dateTo?: number;
  id?: string;
  name?: string;
}

export interface Competition {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  notifications?: PublicCompetitionNotification[];
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

export interface Stage {
  dateFrom: number;
  dateTo: number;
  events: EventResponse[];
  id: string;
  name: string;
}

export interface StageMutationPayload {
  competitionId?: string;
  dateFrom?: number;
  dateTo?: number;
  events?: EventMutationPayload[];
  id?: string;
  name?: string;
}

export interface EventMutationPayload {
  competitors?: EventCompetitor[];
  configuration?: EventConfiguration;
  discipline?: string;
  exercises?: EventExercise[];
  id?: string;
  judges?: StageJudge[];
  name?: string;
  stageId?: string;
  status?: string;
}

export interface StageEditorModel {
  competitionId: string;
  dateFrom: number;
  dateTo: number;
  events: EventResponse[];
  id: string;
  name: string;
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competition[] | null;
}

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competition[] | null;
  previousStage: StageEditorModel | null;
}

export interface ApiEventRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: Competition | null;
  previousCompetitions: Competition[] | null;
  previousEvent: EventResponse | null;
  stageId: string;
}

export type Competitions = Competition;
export type CompetitionStage = Stage;
export type Notification = PublicCompetitionNotification;
export type StageEventScore = PublicEventScore;
export type PostStageEventScore = EventScore;
export type StageExercise = PublicEventExercise;
export type PostStageExercise = EventExercise;
export type StageEventConfiguration = PublicEventConfiguration;
export type PostStageEventConfiguration = EventConfiguration;
export type PostStageJudge = StageJudge;
export type StageCompetitor = PublicEventCompetitor;
export type PostStageCompetitor = EventCompetitor;
export type StageEvent = EventResponse;
export type PostStageEvent = EventMutationPayload;
