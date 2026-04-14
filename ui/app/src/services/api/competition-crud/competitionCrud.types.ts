import { CompetitionStageDetail } from "@/services/api/stage-crud/stageCrud.types";

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
  id: string;
  name: string;
}

export interface UpdateCompetitionRequest {
  country: string;
  description?: string;
  location?: CompetitionLocationDetail;
  name: string;
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: CompetitionDetail | null;
  previousCompetitions: CompetitionDetail[] | null;
}
