export interface CompetitionLocationWeb {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompetitionNotificationsWeb {
  date: number;
  id: string;
  text: string;
}

export interface EventScoresWeb {
  exerciseId: string;
  id: string;
  score: number;
}

export interface EventExercisesWeb {
  id: string;
  order: number;
  text: string;
}

export interface EventConfigurationWeb {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface StageJudgesWeb {
  collectorEmail: string;
  name: string;
}

export interface EventCompetitorsWeb {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: EventScoresWeb[];
}

export interface GetEventApiWeb {
  competitors: EventCompetitorsWeb[];
  configuration: EventConfigurationWeb;
  discipline: string;
  exercises: EventExercisesWeb[];
  id: string;
  judges: StageJudgesWeb[];
  name: string;
  status: string;
}

export interface CompetitionStageApiWeb {
  dateFrom: number;
  dateTo: number;
  events: GetEventApiWeb[];
  id: string;
  name: string;
}

export interface GetCompetitionApiWeb {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocationWeb;
  name: string;
  notifications?: CompetitionNotificationsWeb[];
  stages?: CompetitionStageApiWeb[];
  status: string;
}

export interface PostCompetitionApiWeb {
  id?: string;
  name?: string;
}

export interface PostStageApiWeb {
  competitionId?: string;
  id?: string;
  name?: string;
}

export interface PutCompetitionApiWeb {
  country?: string;
  description?: string;
  id?: string;
  location?: CompetitionLocationWeb;
  name?: string;
  stages?: PostStageApiWeb[];
}

export interface PutStageApiWeb {
  competitionId?: string;
  dateFrom?: number;
  dateTo?: number;
  id?: string;
  name?: string;
}

export interface PostStageEventScoreWeb {
  exerciseId?: string;
  id?: string;
  score?: number;
}

export interface PostEventExercisesWeb {
  id?: string;
  order?: number;
  text?: string;
}

export interface PostEventConfigurationWeb {
  federation?: string;
  id?: string;
  name?: string;
  version?: number;
}

export interface PostStageJudgesWeb {
  collectorEmail?: string;
  name?: string;
}

export interface PostEventCompetitorsWeb {
  finalScore?: number;
  id?: string;
  identity?: string;
  name?: string;
  owner?: string;
  scores?: PostStageEventScoreWeb[];
}

export interface PostEventApiWeb {
  id: string;
  name: string;
  stageId: string;
}

export interface PutEventApiWeb {
  competitors: PostEventCompetitorsWeb[];
  configuration: PostEventConfigurationWeb;
  discipline: string;
  exercises: PostEventExercisesWeb[];
  id: string;
  judges: PostStageJudgesWeb[];
  name: string;
  stageId: string;
  status: string;
}

export interface EventResponse extends GetEventApiWeb {
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
  location?: CompetitionLocationWeb;
  name: string;
  notifications?: CompetitionNotificationsWeb[];
  stages?: Stage[];
  status: string;
}

export interface PostCompetition {
  country?: string;
  description?: string;
  id?: string;
  location?: CompetitionLocationWeb;
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
  competitors?: PostEventCompetitorsWeb[];
  configuration?: PostEventConfigurationWeb;
  discipline?: string;
  exercises?: PostEventExercisesWeb[];
  id?: string;
  judges?: PostStageJudgesWeb[];
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

export type CompetitionLocation = CompetitionLocationWeb;
export type Competitions = Competition;
export type CompetitionStage = Stage;
export type Notification = CompetitionNotificationsWeb;
export type StageEventScore = EventScoresWeb;
export type PostStageEventScore = PostStageEventScoreWeb;
export type StageExercise = EventExercisesWeb;
export type PostStageExercise = PostEventExercisesWeb;
export type StageEventConfiguration = EventConfigurationWeb;
export type PostStageEventConfiguration = PostEventConfigurationWeb;
export type StageJudge = StageJudgesWeb;
export type PostStageJudge = PostStageJudgesWeb;
export type StageCompetitor = EventCompetitorsWeb;
export type PostStageCompetitor = PostEventCompetitorsWeb;
export type StageEvent = EventResponse;
export type PostStageEvent = EventMutationPayload;
export type CreateApiEvent = PostEventApiWeb;
export type UpdateApiEvent = PutEventApiWeb;
