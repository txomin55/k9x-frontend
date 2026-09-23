import { Show } from "solid-js";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import k9xLogo from "@/assets/miscelaneous/k9x-logo.svg";
import K9xScore from "@/components/routes/dogs/dog-card/K9xScore";
import type { PublicDog } from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

/**
 * A dog of the public directory. Nobody edits a dog they are only browsing, so the only action is the way
 * into its detail; the space the my-dogs card gives to edit and delete goes to the index instead.
 */
export default function PublicDogCard(props: {
  dog: PublicDog;
  onSeeDetails: () => void;
}) {
  const i18n = useI18n();

  return (
    <Card
      topLeft={
        <div class="public-dog-card__heading">
          <span class="public-dog-card__score">
            <K9xScore rank={props.dog.rank} />
            <img
              class="public-dog-card__score-icon"
              src={k9xLogo}
              alt={i18n.t("DOGS.INDEX.SCORE")}
            />
          </span>
          <span class="public-dog-card__name" title={props.dog.name}>
            {props.dog.name}
          </span>
        </div>
      }
      content={
        <div class="public-dog-card__facts text-body-sm">
          <div class="public-dog-card__fact">
            <CountryFlag
              country={props.dog.country?.id ?? ""}
              alt={props.dog.country?.name}
            />
            <span class="text-body-sm">{props.dog.breed?.name ?? ""}</span>
            <Show when={props.dog.sex}>
              <SexIcon sex={props.dog.sex!} />
            </Show>
          </div>
          <Show when={props.dog.handler}>
            <div class="public-dog-card__fact">
              <span class="public-dog-card__fact-label text-caption-sm">
                {i18n.t("DOGS.INDEX.HANDLER")}
              </span>
              <span class="text-body-sm">{props.dog.handler}</span>
            </div>
          </Show>
        </div>
      }
      actions={
        <div class="public-dog-card__actions">
          <AtomButton type={BUTTON_TYPES.PRIMARY} onClick={props.onSeeDetails}>
            {i18n.t("DOGS.INDEX.SEE_DETAILS")}
          </AtomButton>
        </div>
      }
    />
  );
}
