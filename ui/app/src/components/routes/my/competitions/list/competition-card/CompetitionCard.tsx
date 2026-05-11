import Card from "@lib/components/molecules/card/Card";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { useNavigate } from "@tanstack/solid-router";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import type {
  CompetitionCardProps
} from "@/components/routes/my/competitions/list/competition-card/CompetitionCard.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

export default function CompetitionCard(props: CompetitionCardProps) {
  const navigate = useNavigate();
  const i18n = useI18n();

  return (
    <Card
      topLeft={
        <div class="competition-card__main-info">
          <span class="text-heading-sm">{props.name}</span>
          <div class="competition-card__country-flag">
            <CountryFlag
              country={props.country}
              alt={`${props.country} flag`}
              height={32}
              width={32}
            />
          </div>
        </div>
      }
      topRight={
        <div class="competition-card__status">
          <span>{props.status}</span>
        </div>
      }
      subHeader={
        <div class="competition-card__meta">
          <span class="competition-card__address text-caption-md">
            {props.address}
          </span>
        </div>
      }
      description={
        <span class="competition-card__description text-body-md">
          {props.description}
        </span>
      }
      content={
        <div class="competition-card__stages-hint text-caption-sm">
          {i18n.t("MY.COMPETITIONS.COMPETITION_CARD.STAGES_ON_DETAIL")}
        </div>
      }
      actions={
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() =>
            navigate({
              href: `/my/competitions/${props.id}`,
            })
          }
        >
          {i18n.t("MY.COMPETITIONS.COMPETITION_CARD.INFO")}
        </AtomButton>
      }
    />
  );
}
