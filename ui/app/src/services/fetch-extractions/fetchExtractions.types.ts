import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface ExtractionLogEventResponseDTO {
  id: string;
  name: string;
  discipline: IdNameDTO;
  competitors: number;
  rank?: string;
}

export interface ExtractionLogStageResponseDTO {
  id: string;
  name: string;
  competitionName: string;
  country: string;
  dateFrom: number;
  dateTo: number;
  events: ExtractionLogEventResponseDTO[];
}

/**
 * The trials whose extraction was loaded on one UTC day. `date` is the start of that day: the day the data
 * was imported into k9x, not the day the trial was held.
 */
export interface ExtractionLogDayResponseDTO {
  date: number;
  stages: ExtractionLogStageResponseDTO[];
}
