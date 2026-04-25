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
}

export interface CompetitionLocationDetail {
  address: string;
  latitude: number;
  longitude: number;
}

export interface GetStageResponse {
  dateFrom: number;
  dateTo: number;
  events: StageEventDetail[];
  id: string;
  address: string;
  name: string;
  notifications?: CompetitionNotificationDetail[];
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
