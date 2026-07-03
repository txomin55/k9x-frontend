import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface StageEventSummaryResponseDTO {
  competitors: number;
  discipline: IdNameDTO;
  id: string;
  name: string;
  status: string;
  enrollmentOpened: boolean;
  enrollmentDeadline: number;
}

export interface StageSummaryResponseDTO {
  country: string;
  dateFrom: number;
  dateTo: number;
  description: string;
  events: StageEventSummaryResponseDTO[];
  id: string;
  location: CompetitionLocationDetailResponseDTO;
  name: string;
  status: string;
  organizer: string;
}

export interface CompetitionLocationDetailResponseDTO {
  address: string;
  latitude: number;
  longitude: number;
}

export interface StageDetailResponseDTO {
  dateFrom: number;
  dateTo: number;
  events: StageEventDetailResponseDTO[];
  id: string;
  address: string;
  name: string;
  notifications: CompetitionNotificationDetailResponseDTO[];
  organizer: string;
  status?: string;
}

export interface StageEventDetailCompetitorResponseDTO {
  dog: IdNameDTO;
  owner: string;
  handler: string;
  team: string;
  country: string;
  breed: string;
}

export interface StageEventDetailResponseDTO {
  competitors: StageEventDetailCompetitorResponseDTO[];
  discipline: IdNameDTO;
  configuration: IdNameDTO;
  id: string;
  name: string;
  status: string;
  enrollmentOpened: boolean;
  enrollmentDeadline: number;
}

export interface CompetitionNotificationDetailResponseDTO {
  date: number;
  id: string;
  text: string;
}

export interface StageEventClassificationScoreResponseDTO {
  judge: IdNameDTO;
  value: number;
  scoreRating: number;
}

export interface StageEventClassificationYellowCardResponseDTO {
  judge: IdNameDTO;
  timestamp: number;
}

export interface StageEventClassificationRedCardResponseDTO {
  judge: IdNameDTO;
  timestamp: number;
}

export interface StageEventClassificationExerciseScoresResponseDTO {
  exercise: IdNameDTO;
  scores: StageEventClassificationScoreResponseDTO[];
  exerciseScore: number;
  scoreRating: number;
  totalScore: number;
  tags: string[];
  yellowCards: StageEventClassificationYellowCardResponseDTO[];
  redCard: StageEventClassificationRedCardResponseDTO | null;
}

interface ObdxStageEventClassificationResponseDTO {
  competitors: StageEventClassificationItemResponseDTO[];
}
export interface StageEventClassificationResponseDTO {
  event: IdNameDTO;
  discipline: IdNameDTO;
  stage: IdNameDTO;
  configuration: IdNameDTO;
  lastUpdated: number;
  status: string;
  obdx?: ObdxStageEventClassificationResponseDTO;
}

export interface StageEventClassificationItemResponseDTO {
  country: string;
  dog: IdNameDTO;
  exercises: StageEventClassificationExerciseScoresResponseDTO[];
  identity: string;
  owner: string;
  handler: string;
  position: number;
  scoreRating: number;
  status: string;
  team: string;
  totalScore: number;
  tied: boolean;
  startOrder: number;
  bih: boolean;
  notCompeting?: boolean;
}

export type StageEnrollRollbackPayload = {
  previousStage: StageDetailResponseDTO | null;
  previousStages: StageSummaryResponseDTO[] | null;
  stageId: string;
};

export type EnrollStageEventRequestDTO = {
  dogId: string;
  eventId: string;
  bih: boolean;
};
