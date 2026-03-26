import Card from "@lib/components/molecules/card/Card";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import { useNavigate } from "@tanstack/solid-router";
import { For } from "solid-js";
import "./styles.css";
import CountryFlag from "@/components/common/CountryFlag";
import type { CompetitionCardProps } from "@/components/routes/my-competitions/competition-card/CompetitionCard.types";

export default ({
  id,
  country,
  name,
  description,
  status,
  stages,
  address,
}: CompetitionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      topLeft={
        <div class="competition-card__main-info">
          <div class="competition-card__country-flag">
            <CountryFlag country={country} alt={`${name} flag`} />
          </div>
          <span class="text-heading-sm">{name}</span>
        </div>
      }
      topRight={
        <div class="competition-card__status">
          <span>{status}</span>
        </div>
      }
      subHeader={
        <div class="competition-card__meta">
          <span class="competition-card__address text-caption-md">
            {address}
          </span>
        </div>
      }
      description={
        <span class="competition-card__description text-body-md">
          {description}
        </span>
      }
      content={
        <For each={stages}>
          {(stage) => (
            <div class="competition-card__stages">
              <div class="competition-card__stages--info">
                <span>{stage.name}</span>
                <span class="text-caption-sm">
                  {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                </span>
              </div>
            </div>
          )}
        </For>
      }
      actions={
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() =>
            navigate({
              href: `/my-competitions/${id}`,
            })
          }
        >
          --+ Info
        </AtomButton>
      }
    />
  );
};
