import { FederationConfiguration } from "@/services/api/configurations/configurations.types";
import { CompetitionDetail } from "@/services/api/competition-crud/competitionCrud.types";

export interface CreateEventRequest {
  id: string;
  name: string;
  stageId: string;
}

export interface UpdateEventRequest {
  competitors?: EventCompetitor[];
  configurationId?: string;
  exercises?: EventExerciseDetail[];
  judges?: EventJudge[];
  name: string;
}

export interface EventCompetitor {
  order?: number;
  dogId?: string;
  team?: string;
  identity?: string;
  owner?: string;
  country?: string;
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

export interface EventConfiguration {
  federation?: FederationConfiguration;
  id?: string;
  name?: string;
}

export interface EventConfigurationDetail {
  federation?: FederationConfiguration;
  id: string;
  name: string;
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

export interface EventExerciseDetail {
  id: string;
  order: number;
  name: string;
  tags: string[];
}

export interface EventJudge {
  id: string;
  collectorEmail?: string;
}

export interface EventJudgeDetail {
  collectorEmail: string;
  id: string;
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

export interface ApiEventRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
  previousEvent: EventDetail | null;
  stageId: string;
}
