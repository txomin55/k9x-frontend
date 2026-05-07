import { FederationConfiguration } from "@/services/secured/configurations/configurations.types";
import { CompetitionDetail } from "@/services/secured/competition-crud/competitionCrud.types";

export interface CreateEventRequest {
  id: string;
  name: string;
  stageId: string;
  disciplineId: string;
}

export interface UpdateEventRequest {
  competitors?: EventCompetitor[];
  configurationId?: string;
  exercises?: EventExercise[];
  judges?: EventJudgeDetail[];
  name: string;
}

export interface EventCompetitor {
  order?: number;
  dogId: string;
  team?: string;
  identity?: string;
  owner?: string;
  country?: string;
  status?: string;
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
  status: string;
}

export interface EventConfigurationDetail {
  federation: FederationConfiguration;
  id: string;
  name: string;
}

export interface Discipline {
  id: string;
  name: string;
}

export interface EventDetail {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetail;
  discipline: Discipline;
  exercises: EventExerciseDetail[];
  id: string;
  stageId: string;
  judges: EventJudgeDetail[];
  name: string;
  status: string;
}

export interface EventExerciseDetail extends EventExercise {
  name: string;
}

export interface EventExercise {
  id: string;
  name: string;
  order: number;
  tags: string[];
}

export interface EventJudgeDetail {
  collectorEmail: string;
  id: string;
}

export interface EventEditorDraft {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetail;
  discipline: Discipline;
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
