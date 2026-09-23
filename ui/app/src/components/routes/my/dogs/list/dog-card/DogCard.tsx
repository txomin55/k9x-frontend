import { Show } from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import { useI18n } from "@/stores/i18n/i18n";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import "./styles.css";

type DogCardProps = {
  dog: Dog;
  onEdit: () => void;
  onDelete: () => void;
};

export default function DogCard(props: DogCardProps) {
  const i18n = useI18n();
  return (
    <Card
      topLeft={
        <span class="dog-card__name" title={props.dog.name}>
          {props.dog.name}
        </span>
      }
      content={
        <div class="dog-card__facts text-body-sm">
          <div class="dog-card__fact">
            <CountryFlag
              country={props.dog.country.id}
              alt={props.dog.country.name}
            />
            <span class="text-body-sm" title={props.dog.breed.name}>
              {props.dog.breed.name}
            </span>
            <SexIcon sex={props.dog.sex} />
          </div>
          <Show when={props.dog.handler}>
            <div class="dog-card__fact">
              <span class="dog-card__fact-label text-caption-sm">
                {i18n.t("MY.DOGS.LIST.HANDLER")}
              </span>
              <span class="text-body-sm" title={props.dog.handler}>
                {props.dog.handler}
              </span>
            </div>
          </Show>
        </div>
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
