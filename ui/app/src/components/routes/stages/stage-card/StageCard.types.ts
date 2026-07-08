import type { StageEventSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export interface StageCardProps {
  address?: string;
  country: string;
  competitionName?: string;
  events: StageEventSummaryResponseDTO[];
  from: number;
  id: string;
  name: string;
  status?: string;
  to: number;
  organizer: string;
  onEnroll?: (eventId: string) => void;
}
