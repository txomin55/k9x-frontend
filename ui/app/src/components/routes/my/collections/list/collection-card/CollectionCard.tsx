import { CollectionCardProps } from "@/components/routes/my/collections/list/collection-card/CollectionCard.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import { useI18n } from "@/stores/i18n/i18n";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import "./styles.css";

export default function CollectionCard(props: CollectionCardProps) {
  const i18n = useI18n();
  return (
    <Card
      topLeft={
        <div class="collection-card__heading">
          <StatusBadge status={props.collection.status} />
          <DisciplineIcon disciplineId={props.collection.discipline.id} />
          <span class="collection-card__name">
            {props.collection.eventName}
          </span>
        </div>
      }
      description={
        <div class="collection-card">
          <span class="text-caption-sm">
            {i18n.t("MY.COLLECTIONS.COLLECTION_CARD.COMPETITION")}
            <span class="text-body-sm">{props.collection.competitionName}</span>
          </span>
          <span class="text-caption-sm">
            {i18n.t("MY.COLLECTIONS.COLLECTION_CARD.STAGE")}
            <span class="text-body-sm">{props.collection.stageName}</span>
          </span>
        </div>
      }
      actions={
        <div class="collection-card__actions">
          <AtomButton type={BUTTON_TYPES.PRIMARY} onClick={props.onCollect}>
            {i18n.t("MY.COLLECTIONS.COLLECTION_CARD.COLLECT")}
          </AtomButton>
        </div>
      }
    />
  );
}
