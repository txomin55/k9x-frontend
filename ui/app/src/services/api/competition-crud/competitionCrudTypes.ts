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
  dogId: string;
  identity: string;
  name: string;
  owner: string;
  team: string;
  country: string;
  scores: PublicEventScore[];
}

interface PublicEventDetail {
  competitors: PublicEventCompetitor[];
  configuration: PublicEventConfiguration;
  discipline: string;
  exercises: PublicEventExercise[];
  id: string;
  judges: PublicStageJudge[];
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

export interface StageJudge {
  collectorEmail?: string;
  name?: string;
}

export interface EventCompetitor {
  finalScore?: number;
  dogId?: string;
  team?: string;
  identity?: string;
  name?: string;
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
  judges: StageJudge[];
  name: string;
  stageId: string;
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
  exercises?: EventExercise[];
  id?: string;
  judges?: StageJudge[];
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
