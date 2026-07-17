import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface CompetitionNotificationDetailResponseDTO {
  date: number;
  id: string;
  text: string;
}

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

export interface CompetitionResponseDTO {
  country: string;
  description: string;
  id: string;
  address: string;
  name: string;
  notifications: CompetitionNotificationDetailResponseDTO[];
  stages: CompetitionStageDetailResponseDTO[];
  status: string;
}

export interface UpdateCompetitionRequestDTO {
  country: string;
  description: string;
  address: string;
  name: string;
}

export interface CompetitionRollbackPayload {
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
}
