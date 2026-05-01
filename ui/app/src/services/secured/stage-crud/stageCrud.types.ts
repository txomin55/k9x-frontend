import { CompetitionDetail } from "@/services/secured/competition-crud/competitionCrud.types";
import { EventDetail } from "@/services/secured/event-crud/eventCrud.types";

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

export interface ApiStageRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
  previousStage: StageEditorModel | null;
}
