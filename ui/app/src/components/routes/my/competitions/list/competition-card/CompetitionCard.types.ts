import { CompetitionStageDetail } from "@/services/secured/stage-crud/stageCrud.types";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description?: string;
  id: string;
  name: string;
  stages?: CompetitionStageDetail[];
  status: string;
}
