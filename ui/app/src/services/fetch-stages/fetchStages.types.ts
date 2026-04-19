export interface StageEvent {
  competitors: number;
  discipline: string;
  id: string;
  name: string;
}

export interface Stage {
  country: string;
  dateFrom: number;
  dateTo: number;
  description?: string;
  events: StageEvent[];
  id: string;
  location?: CompetitionLocationDetail;
  name: string;
}

export interface CompetitionLocationDetail {
  address?: string;
  latitude?: number;
  longitude?: number;
}
