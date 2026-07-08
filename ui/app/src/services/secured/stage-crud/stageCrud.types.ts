import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { EventDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface CompetitionStageEventDetailResponseDTO {
  id: string;
  name: string;
  discipline: IdNameDTO;
  status: string;
  rank: string;
}

export interface CompetitionStageDetailResponseDTO {
  dateFrom: number;
  dateTo: number;
  events: CompetitionStageEventDetailResponseDTO[];
  id: string;
  name: string;
  status: string;
}

export interface CreateStageRequestDTO {
  competitionId: string;
  dateFrom?: number;
  dateTo?: number;
  id: string;
  name: string;
}

export interface UpdateStageRequestDTO {
  dateFrom: number;
  dateTo: number;
  name: string;
}

export interface StageEditorModel {
  competitionId: string;
  dateFrom: number;
  dateTo: number;
  events: EventDetailResponseDTO[];
  id: string;
  name: string;
  status?: string;
}

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
  previousStage: StageEditorModel | null;
}
