import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { EventDetail } from "@/services/secured/event-crud/eventCrud.types";

export interface CompetitionStageDetail {
  dateFrom: number;
  dateTo: number;
  events: EventDetail[];
  id: string;
  name: string;
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
  events: EventDetail[];
  id: string;
  name: string;
}

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
  previousStage: StageEditorModel | null;
}
