import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useI18n } from "@/stores/i18n/i18n";
import ObdxExerciseSquares from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseSquares";
import ObdxExerciseDetailTable from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxExerciseDetailTable";
import TotalBlock from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/total-block/TotalBlock";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

type ObdxClassificationContentProps = {
  competitor: StageEventClassificationItemResponseDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ObdxClassificationContent(
  props: ObdxClassificationContentProps,
) {
  const { t } = useI18n();

  return (
    <div class="obdx-clf__body">
      <div class="obdx-clf__squares-total">
        <ObdxExerciseSquares exercises={props.competitor.exercises} />
        <TotalBlock value={props.competitor.totalScore ?? null} layout="inline" />
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
  );
}
