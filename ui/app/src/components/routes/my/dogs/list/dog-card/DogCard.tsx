import { Show } from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import type { DogCardProps } from "@/components/routes/my/dogs/list/dog-card/DogCard.types";
import "./styles.css";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";

export default function DogCard(props: DogCardProps) {
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
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>--Delete</AtomButton>
          </ConfirmActionButton>
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onEdit}>
            --Edit
          </AtomButton>
        </div>
      }
    />
  );
}
