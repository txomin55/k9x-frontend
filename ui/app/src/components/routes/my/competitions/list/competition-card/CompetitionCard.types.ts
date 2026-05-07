import { CompetitionStageDetailResponseDTO } from "@/services/secured/stage-crud/stageCrud.types";

export interface CompetitionCardProps {
  address?: string;
  country: string;
  description?: string;
  id: string;
  name: string;
  stages?: CompetitionStageDetailResponseDTO[];
  status: string;
}
