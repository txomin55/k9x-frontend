import Card from "@lib/components/molecules/card/Card";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { Index } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import type { StageCardProps } from "@/components/routes/index/stage_card/StageCard.types";
import "./styles.css";

export default function StageCard(props: StageCardProps) {
  return (
    <Card
      topLeft={
        <div class="stage-card__main-info">
          <div class="stage-card__country-flag">
            <CountryFlag country={props.country} alt={`${props.name} flag`} />
          </div>
          <span class="text-heading-sm">{props.name}</span>
        </div>
      }
      topRight={
        <div class="stage-card__notifications">
          <span>--Bell</span>
        </div>
      }
      subHeader={
        <div class="stage-card__meta">
          <span class="stage-card__address text-caption-md">
            {props.address}
          </span>
          <span class="stage-card__date text-caption-sm">
            {`${new Date(props.from).toDateString()} - ${new Date(props.to).toDateString()}`}
          </span>
        </div>
      }
      description={
        props.description ? (
          <span class="stage-card__description text-body-md">
            {props.description}
          </span>
        ) : undefined
      }
      content={
        <Index each={props.events}>
          {(event) => (
            <div class="stage-card__events-content">
              <div>
                <span>{event().name}</span>
                <span>{event().competitors}</span>
              </div>
              <div>
                <AtomButton type={BUTTON_TYPES.ACCENT}>--+ Info</AtomButton>
                <AtomButton type={BUTTON_TYPES.PRIMARY}>
                  --Ver clasificacion
                </AtomButton>
              </div>
            </div>
          )}
        </Index>
      }
    />
  );
}
