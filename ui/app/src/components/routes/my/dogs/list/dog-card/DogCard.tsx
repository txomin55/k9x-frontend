import { Show } from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import type { DogCardProps } from "@/components/routes/my/dogs/list/dog-card/DogCard.types";
import "./styles.css";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useI18n } from "@/stores/i18n/i18n";

export default function DogCard(props: DogCardProps) {
  const i18n = useI18n();
  return (
    <Card
      topLeft={
        <div class="dog-card__heading">
          <span class="dog-card__name">{props.dog.name}</span>
        </div>
      }
      topRight={<span class="dog-card__breed">{props.dog.breed}</span>}
      description={<span class="text-body-md">{props.dog.id}</span>}
      content={
        <Show when={props.dog.image}>
          <img
            class="dog-card__image"
            src={props.dog.image}
            alt={`Dog ${props.dog.name}`}
          />
        </Show>
      }
      actions={
        <div class="dog-card__actions">
          <ConfirmActionButton text={props.dog.name} onConfirm={props.onDelete}>
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
              {i18n.t("MY.DOGS.DOG_CARD.DELETE")}
            </AtomButton>
          </ConfirmActionButton>
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onEdit}>
            {i18n.t("MY.DOGS.DOG_CARD.EDIT")}
          </AtomButton>
        </div>
      }
    />
  );
}
