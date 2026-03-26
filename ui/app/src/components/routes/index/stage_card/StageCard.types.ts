import type { StageEvent } from "@/services/fetch_stages/fetchStages.types";

export interface StageCardProps {
  address?: string;
  country: string;
  description?: string;
  events: StageEvent[];
  from: number;
  id: string;
  name: string;
  to: number;
}
