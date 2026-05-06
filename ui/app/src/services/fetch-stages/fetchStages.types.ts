export interface StageEventSummary {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
  status: string;
}

export interface StageSummary {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEventSummary[];
  id: string;
  location?: CompetitionLocationDetail;
  name: string;
  status: string;
  organizer: string;
}

export interface CompetitionLocationDetail {
  address: string;
  latitude: number;
  longitude: number;
}

export interface StageDetail {
  dateFrom: number;
  dateTo: number;
  events: StageEventDetail[];
  id: string;
  address: string;
  name: string;
  notifications?: CompetitionNotificationDetail[];
  organizer: string;
}

export interface StageEventDetail {
  competitors: any[];
  discipline: string;
  id: string;
  name: string;
}

export interface CompetitionNotificationDetail {
  date: number;
  id: string;
  text: string;
}

export interface StageEventClassificationJudge {
  id: string;
  name: string;
}

export interface StageEventClassificationScore {
  judge: StageEventClassificationJudge;
  value: number;
}

export interface StageEventClassificationExercise {
  id: string;
  name: string;
}

export interface StageEventClassificationExerciseScores {
  exercise: StageEventClassificationExercise;
  scores: StageEventClassificationScore[];
}

export interface StageEventClassificationDog {
  id: string;
  name: string;
}

export interface StageEventClassificationItem {
  country: string;
  dog: StageEventClassificationDog;
  exercises: StageEventClassificationExerciseScores[];
  owner: string;
  team: string;
}

export type StageEnrollRollbackPayload = {
  previousStage: StageDetail | null;
  previousStages: StageSummary[] | null;
  stageId: string;
};

export type EnrollStageEventRequest = {
  country: string;
  dogId: string;
  eventId: string;
  identifier: string;
  owner: string;
  stageId: string;
  team: string;
};
