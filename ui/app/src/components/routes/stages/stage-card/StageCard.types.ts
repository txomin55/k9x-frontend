import type { StageEventSummary } from "@/services/fetch-stages/fetchStages.types";

export interface StageCardProps {
  address?: string;
  country: string;
  description?: string;
  events: StageEventSummary[];
  from: number;
  id: string;
  name: string;
  to: number;
  organizer: string;
}
