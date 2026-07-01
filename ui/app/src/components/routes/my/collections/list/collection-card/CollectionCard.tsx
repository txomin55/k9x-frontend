import { CollectionCardProps } from "@/components/routes/my/collections/list/collection-card/CollectionCard.types";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomBadge, { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";
import { useI18n } from "@/stores/i18n/i18n";

export default function CollectionCard(props: CollectionCardProps) {
  const i18n = useI18n();
  return (
    <Card
      topLeft={
        <div class="collection-card__heading">
          <span class="collection-card__name">
            {props.collection.eventName}
          </span>
        </div>
      }
      description={
        <div class="collection-card">
          <AtomBadge
            type={BADGE_TYPES.SUCCESS}
            textValue={props.collection.status}
          >
            {props.collection.status}
          </AtomBadge>
          <p class="text-body-md">
            {i18n.t("MY.COLLECTIONS.COLLECTION_CARD.COMPETITION")}:{" "}
            {props.collection.competitionName}
          </p>
          <p class="text-body-md">
            {i18n.t("MY.COLLECTIONS.COLLECTION_CARD.STAGE")}:{" "}
            {props.collection.stageName}
          </p>
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
