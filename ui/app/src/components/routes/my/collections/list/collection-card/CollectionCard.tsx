import { CollectionCardProps } from "@/components/routes/my/collections/list/collection-card/CollectionCard.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomBadge, { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";

export default function CollectionCard(props: CollectionCardProps) {
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
            type={BADGE_TYPES.ACCENT}
            textValue={props.collection.status}
          >
            {props.collection.status}
          </AtomBadge>
          <p class="text-body-md">
            --Competition: {props.collection.competitionName}
          </p>
          <p class="text-body-md">--Stage: {props.collection.stageName}</p>
        </div>
      }
      actions={
        <div class="collection-card__actions">
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCollect}>
            --Collect
          </AtomButton>
        </div>
      }
    />
  );
}
