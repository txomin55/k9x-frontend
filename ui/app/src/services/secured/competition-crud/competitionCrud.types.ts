import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import type {
  CompetitionSource,
  StageNotificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

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
  notifications: StageNotificationResponseDTO[];
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
  source?: CompetitionSource;
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

/** Ids and names only, for pickers: competition -> trial -> event, all of them not deleted. */
export interface SelectableStageResponseDTO {
  id: string;
  name: string;
  events: IdNameDTO[];
}

export interface SelectableCompetitionResponseDTO {
  id: string;
  name: string;
  stages: SelectableStageResponseDTO[];
}
