export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompetitionNotificationDetail {
  date: number;
  id: string;
  text: string;
}

export interface EventScoreDetail {
  exerciseId: string;
  id: string;
  score: number;
}

export interface EventExerciseDetail {
  id: string;
  order: number;
  text: string;
}

export interface EventConfigurationDetail {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface EventJudgeDetail {
  collectorEmail: string;
  id: string;
}

export interface EventCompetitorDetail {
  finalScore: number;
  dogId: string;
  identity: string;
  name: string;
  owner: string;
  team: string;
  country: string;
  breed: string;
  order: number;
  scores: EventScoreDetail[];
}

interface EventDetail {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetail;
  discipline: string;
  exercises: EventExerciseDetail[];
  id: string;
  judges: EventJudgeDetail[];
  name: string;
  status: string;
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

export interface EventJudge {
  id: string;
  collectorEmail?: string;
}

export interface EventCompetitor {
  finalScore?: number;
  order?: number;
  dogId?: string;
  team?: string;
  identity?: string;
  owner?: string;
  country?: string;
  scores?: EventScore[];
}

export interface CreateEventRequest {
  id: string;
  name: string;
  stageId: string;
  discipline: string;
}

export interface UpdateEventRequest {
  competitors: EventCompetitor[];
  configuration: EventConfiguration;
  exercises: EventExercise[];
  id: string;
  judges: EventJudge[];
  name: string;
  stageId: string;
}

export interface EventResponse extends EventDetail {
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
  notifications?: CompetitionNotificationDetail[];
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
  exercises?: EventExercise[];
  id?: string;
  judges?: EventJudge[];
  name?: string;
  stageId?: string;
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
