import { CompetitionStageDetailResponseDTO } from "@/services/secured/stage-crud/stageCrud.types";

export interface CompetitionNotificationDetailResponseDTO {
  date: number;
  id: string;
  text: string;
}

export interface CompetitionResponseDTO {
  country: string;
  description: string;
  id: string;
  address: string;
  name: string;
  notifications: CompetitionNotificationDetailResponseDTO[];
  stages?: CompetitionStageDetailResponseDTO[];
  status: string;
}

export interface UpdateCompetitionRequestDTO {
  country: string;
  description?: string;
  address?: string;
  name: string;
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
}
