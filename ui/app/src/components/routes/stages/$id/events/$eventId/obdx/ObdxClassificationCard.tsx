import Card from "@lib/components/molecules/card/Card";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import type { TrendDirection } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/classificationCard.utils";
import { useI18n } from "@/stores/i18n/i18n";
import ObdxCompetitorHeader from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader";
import ObdxExerciseSquares from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares";
import ObdxExerciseDetailTable from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable";
import PinButton from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/PinButton";
import TotalBlock from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/TotalBlock";
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
  const { t } = useI18n();

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
        <div class="obdx-clf__body">
          <div class="obdx-clf__squares-total">
            <ObdxExerciseSquares exercises={props.competitor.exercises} />
            <TotalBlock
              value={props.competitor.totalScore ?? null}
              layout="inline"
            />
          </div>
          <AtomCollapsible
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={
              props.open
                ? t("STAGES.CLASSIFICATION_CARD.CLOSE")
                : t("STAGES.CLASSIFICATION_CARD.SEE_DETAIL")
            }
            content={<ObdxExerciseDetailTable competitor={props.competitor} />}
          />
        </div>
      }
    />
  );
}
