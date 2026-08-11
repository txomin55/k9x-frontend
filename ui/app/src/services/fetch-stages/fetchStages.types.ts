import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface StageEventSummaryResponseDTO {
  competitors: number;
  discipline: IdNameDTO;
  id: string;
  name: string;
  status: string;
  enrollmentOpened: boolean;
  enrollmentDeadline: number;
  awards: IdNameDTO[];
  rank: string;
}

export interface StageSummaryResponseDTO {
  /** Whether any event of the trial is included in a ranking. */
  includesRankings?: boolean;
  country: string;
  dateFrom: number;
  dateTo: number;
  competitionName: string;
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
  competitionName: string;
  events: StageEventDetailResponseDTO[];
  id: string;
  address: string;
  name: string;
  notifications: StageNotificationResponseDTO[];
  organizer: string;
  status?: string;
}

export interface StageEventDetailCompetitorResponseDTO {
  dog: IdNameDTO;
  owner: string;
  handler: string;
  team: string;
  country: string;
  breed: IdNameDTO;
  verified: boolean;
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
  awards: IdNameDTO[];
  rank: string;
}

export interface StageNotificationResponseDTO {
  timestamp: number;
  eventIds: string[];
  content: string;
}

export interface StageEventClassificationScoreResponseDTO {
  judge: IdNameDTO;
  value: number;
  scoreRating: number;
  applies: boolean;
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
  scoreCalculation: string;
  judges: IdNameDTO[];
}
export interface StageEventClassificationResponseDTO {
  event: IdNameDTO;
  competitionName: string;
  discipline: IdNameDTO;
  rank: string;
  stage: IdNameDTO;
  configuration: IdNameDTO;
  lastUpdated: number;
  status: string;
  obdx?: ObdxStageEventClassificationResponseDTO;
}

export interface StageEventClassificationItemResponseDTO {
  country: IdNameDTO;
  dog: IdNameDTO;
  exercises: StageEventClassificationExerciseScoresResponseDTO[];
  owner: string;
  handler: string;
  position: number;
  competitorNumber: number;
  scoreRating: number;
  status: string;
  team: string;
  totalScore: number;
  tied: boolean;
  startOrder: number;
  bih: boolean;
  reserve: boolean;
  notCompeting?: boolean;
  awards: IdNameDTO[];
  qualification: string;
}

export type StageEnrollRollbackPayload = {
  previousStage: StageDetailResponseDTO | null;
  previousStages: StageSummaryResponseDTO[] | null;
  stageId: string;
};

export type EnrollStageEventRequestDTO = {
  dogIdentification: string;
  eventId: string;
  bih: boolean;
  primer: string;
};
