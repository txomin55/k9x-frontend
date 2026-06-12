import type { TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";

export type PositionBadgeProps = {
  position: number;
  tied: boolean;
  live: boolean;
  trend?: TrendDirection;
};
