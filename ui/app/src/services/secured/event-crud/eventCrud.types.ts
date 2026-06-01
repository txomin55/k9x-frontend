import { FederationConfigurationResponseDTO } from "@/services/secured/configurations/configurations.types";
import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface CreateEventRequestDTO {
  id: string;
  name: string;
  stageId: string;
  disciplineId: string;
}

export interface UpdateEventRequestDTO {
  competitors?: EventCompetitorRequestDTO[];
  configurationId?: string;
  exercises?: EventExerciseRequestDTO[];
  judges?: EventJudgeDetailRequestDTO[];
  name: string;
}

export interface EventCompetitorResponseDTO {
  dog: IdNameDTO;
  position?: number;
  team?: string;
  identity?: string;
  owner?: string;
  country?: string;
  status?: string;
}

export interface EventCompetitorRequestDTO {
  dogId: string;
  position: number;
  accepted: boolean;
}

export interface EventCompetitorDetail {
  dogId: string;
  identity: string;
  name: string;
  owner: string;
  team: string;
  country: string;
  breed: string;
  position: number;
  accepted: boolean;
  status: string;
}

export interface EventConfigurationDetailResponseDTO {
  federation: FederationConfigurationResponseDTO;
  id: string;
  name: string;
}

export interface Discipline {
  id: string;
  name: string;
}

export interface ObdxEventDetailResponseDTO {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetailResponseDTO;
  discipline: Discipline;
  exercises: EventExerciseDetailResponseDTO[];
  id: string;
  stage: IdNameDTO;
  judges: EventJudgeDetailResponseDTO[];
  name: string;
  status: string;
}

export interface EventDetailResponseDTO extends ObdxEventDetailResponseDTO {
  obdx: ObdxEventDetailResponseDTO;
}

export interface EventExerciseDetailResponseDTO extends EventExerciseRequestDTO {
  name: string;
}

export interface EventExerciseRequestDTO {
  id: string;
  name: string;
  position: number;
  tags: string[];
}

export interface EventJudgeDetailResponseDTO {
  collectorEmail: string;
  id: string;
  name?: string;
}

export interface EventJudgeDetailRequestDTO {
  collectorEmail: string;
  id: string;
}

export interface EventEditorDraft {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetailResponseDTO;
  discipline: Discipline;
  exercises: EventExerciseDetailResponseDTO[];
  id: string;
  judges: EventJudgeDetailResponseDTO[];
  name: string;
  stageId: string;
  status: string;
}

export interface ApiEventRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
  previousEvent: EventDetailResponseDTO | null;
  stageId: string;
}

export const normalizeEventDetailResponse = (
  event: EventDetailResponseDTO | { obdx: ObdxEventDetailResponseDTO },
): EventDetailResponseDTO => {
  const obdx = "obdx" in event ? event.obdx : (event as EventDetailResponseDTO);

  return {
    ...obdx,
    obdx,
  };
};
