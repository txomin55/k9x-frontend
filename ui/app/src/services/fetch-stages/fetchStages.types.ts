export interface StageEventSummary {
  competitors?: number;
  discipline: string;
  id: string;
  name: string;
  status: string;
}

export interface StageSummaryResponseDTO {
  country?: string;
  dateFrom?: number;
  dateTo?: number;
  description?: string;
  events?: StageEventSummary[];
  id: string;
  location?: CompetitionLocationDetail;
  name: string;
  status: string;
  organizer: string;
}

export interface CompetitionLocationDetail {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface StageDetailResponseDTO {
  dateFrom?: number;
  dateTo?: number;
  events?: StageEventDetail[];
  id: string;
  address?: string;
  name: string;
  notifications?: CompetitionNotificationDetail[] | [];
  organizer: string;
}

export interface StageEventDetail {
  competitors?: any[];
  discipline?: string;
  id: string;
  name: string;
}

export interface CompetitionNotificationDetail {
  date?: number;
  id: string;
  text?: string;
}

export interface StageEventClassificationScore {
  judge: IdNameResponseDto;
  value: number;
  scoreRating: number;
}

export interface StageEventClassificationExerciseScoresResponseDTO {
  exercise: IdNameResponseDto;
  scores: StageEventClassificationScore[];
  exerciseScore?: number;
  scoreRating?: number;
  totalScore?: number;
  tags?: string[];
}

export interface StageEventClassificationResponseDTO {
  event: IdNameResponseDto;
  discipline: IdNameResponseDto;
  stage: IdNameResponseDto;
  configuration: IdNameResponseDto;
  competitors: StageEventClassificationItem[];
}

export interface StageEventClassificationItem {
  country?: string;
  dog: IdNameResponseDto;
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

export interface IdNameResponseDto {
  id: string;
  name: string;
}
