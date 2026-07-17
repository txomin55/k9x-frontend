import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { EventDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";

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
