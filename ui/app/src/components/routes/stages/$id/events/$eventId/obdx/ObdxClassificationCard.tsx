import Card from "@lib/components/molecules/card/Card";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import type { TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import ObdxCompetitorHeader from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader";
import ObdxClassificationContent from "@/components/routes/stages/$id/events/$eventId/obdx/ObdxClassificationContent";
import PinButton from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/pin-button/PinButton";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

type ObdxClassificationProps = {
  competitor: StageEventClassificationItemResponseDTO;
  trend?: TrendDirection;
  pinned: boolean;
  pinDisabled: boolean;
  onTogglePin: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ObdxClassificationCard(props: ObdxClassificationProps) {
  return (
    <Card
      topLeft={
        <ObdxCompetitorHeader
          competitor={props.competitor}
          trend={props.trend}
        />
      }
      topRight={
        <PinButton
          pinned={props.pinned}
          disabled={props.pinDisabled}
          onToggle={props.onTogglePin}
        />
      }
      content={
        <ObdxClassificationContent
          competitor={props.competitor}
          open={props.open}
          onOpenChange={props.onOpenChange}
        />
      }
    />
  );
}
