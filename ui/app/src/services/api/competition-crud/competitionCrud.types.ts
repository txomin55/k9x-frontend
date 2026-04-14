import { Federation } from "@/services/api/configurations/configurations.types";

export interface CompetitionLocationDetail {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CompetitionNotificationDetail {
  date: number;
  id: string;
  text: string;
}

export interface EventExerciseDetail {
  id: string;
  order: number;
  name: string;
  tags: string[];
}

export interface EventConfigurationDetail {
  federation?: Federation;
  id: string;
  name: string;
}

export interface EventJudgeDetail {
  collectorEmail: string;
  id: string;
}

export interface EventCompetitorDetail {
  dogId: string;
  identity: string;
  name: string;
  owner: string;
  team: string;
  country: string;
  breed: string;
  order: number;
}

export interface EventDetail {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetail;
  discipline: string;
  exercises: EventExerciseDetail[];
  id: string;
  stageId: string;
  judges: EventJudgeDetail[];
  name: string;
  status: string;
}

export interface EventConfiguration {
  federation?: Federation;
  id?: string;
  name?: string;
}

export interface EventJudge {
  id: string;
  collectorEmail?: string;
}

export interface EventCompetitor {
  order?: number;
  dogId?: string;
  team?: string;
  identity?: string;
  owner?: string;
  country?: string;
}

export interface CreateEventRequest {
  id: string;
  name: string;
  stageId: string;
  discipline: string;
}

export interface UpdateEventRequest {
  competitors?: EventCompetitor[];
  configurationId?: string;
  exercises?: EventExerciseDetail[];
  judges?: EventJudge[];
  name: string;
}

export interface EventEditorDraft {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetail;
  discipline: string;
  exercises: EventExerciseDetail[];
  id: string;
  judges: EventJudgeDetail[];
  name: string;
  stageId: string;
  status: string;
}

export interface CompetitionDetail {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocationDetail;
  name: string;
  notifications?: CompetitionNotificationDetail[];
  stages?: CompetitionStageDetail[];
  status: string;
}

export interface CreateCompetitionRequest {
  country?: string;
  description?: string;
  id: string;
  location?: CompetitionLocationDetail;
  name: string;
}

export interface UpdateCompetitionRequest {
  country: string;
  description?: string;
  location?: CompetitionLocationDetail;
  name: string;
}

export interface CompetitionStageDetail {
  dateFrom: number;
  dateTo: number;
  events: EventDetail[];
  id: string;
  name: string;
}

export interface CreateStageRequest {
  competitionId: string;
  dateFrom?: number;
  dateTo?: number;
  events?: EventDetail[];
  id: string;
  name: string;
}

export interface UpdateStageRequest {
  dateFrom: number;
  dateTo: number;
  name: string;
}

export interface StageEditorModel {
  competitionId: string;
  dateFrom: number;
  dateTo: number;
  events: EventDetail[];
  id: string;
  name: string;
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
}

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
  previousStage: StageEditorModel | null;
}

export interface ApiEventRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
  previousEvent: EventDetail | null;
  stageId: string;
}
