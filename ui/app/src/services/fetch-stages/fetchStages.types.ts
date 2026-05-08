export interface StageEventSummaryResponseDTO {
  competitors?: number;
  discipline: string | IdNameDTO;
  id: string;
  name: string;
  status: string;
}

export interface StageSummaryResponseDTO {
  country?: string;
  dateFrom?: number;
  dateTo?: number;
  description?: string;
  events?: StageEventSummaryResponseDTO[];
  id: string;
  location?: CompetitionLocationDetailResponseDTO;
  name: string;
  status: string;
  organizer: string;
}

export interface CompetitionLocationDetailResponseDTO {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface StageDetailResponseDTO {
  dateFrom?: number;
  dateTo?: number;
  events?: StageEventDetailResponseDTO[];
  id: string;
  address?: string;
  name: string;
  notifications?: CompetitionNotificationDetailResponseDTO[] | [];
  organizer: string;
}

export interface StageEventDetailResponseDTO {
  competitors?: any[];
  discipline?: string | IdNameDTO;
  id: string;
  name: string;
}

export interface CompetitionNotificationDetailResponseDTO {
  date?: number;
  id: string;
  text?: string;
}

export interface StageEventClassificationScoreResponseDTO {
  judge: IdNameDTO;
  value: number;
  scoreRating: number;
}

export interface StageEventClassificationExerciseScoresResponseDTO {
  exercise: IdNameDTO;
  scores: StageEventClassificationScoreResponseDTO[];
  exerciseScore?: number;
  scoreRating?: number;
  totalScore?: number;
  tags?: string[];
}

export interface StageEventClassificationResponseDTO {
  event: IdNameDTO;
  discipline: IdNameDTO;
  stage: IdNameDTO;
  configuration: IdNameDTO;
  lastUpdated: number;
  competitors: StageEventClassificationItemResponseDTO[];
}

export interface StageEventClassificationItemResponseDTO {
  country?: string;
  dog: IdNameDTO;
  exercises: StageEventClassificationExerciseScoresResponseDTO[];
  owner: string;
  position: number;
  scoreRating?: number;
  status: string;
  team: string;
  totalScore?: number;
}

export type StageEnrollRollbackPayload = {
  previousStage: StageDetailResponseDTO | null;
  previousStages: StageSummaryResponseDTO[] | null;
  stageId: string;
};

export type EnrollStageEventRequestDTO = {
  country: string;
  dogId: string;
  eventId: string;
  identifier: string;
  owner: string;
  team: string;
};

export interface IdNameDTO {
  id: string;
  name: string;
}
