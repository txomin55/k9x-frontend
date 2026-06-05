import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import type { TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";

export type ObdxCompetitorHeaderProps = {
  competitor: StageEventClassificationItemResponseDTO;
  trend?: TrendDirection;
};
