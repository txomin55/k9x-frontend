import Card from "@lib/components/molecules/card/Card";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import { For, Suspense } from "solid-js";
import "./styles.css";
import { CompetitionStage } from "@/services/fetch_competitions/fetchCompetitions";

interface CompetitionCardProps {
  id: string;
  country: string;
  name: string;
  status: string;
  description: string;
  stages: CompetitionStage[];
}

export default ({
  country,
  name,
  description,
  status,
  stages,
}: CompetitionCardProps) => {
  const normalizedCountry = () => country?.trim().toLowerCase();

  return (
    <Card
      topLeft={
        <div class="competition-card__main-info">
          <div class="competition-card__country-flag">
            <Suspense fallback={<span>--N/A</span>}>
              <span class={`fi fi-${normalizedCountry()}`} />
            </Suspense>
          </div>
          <span class="text-heading-sm">{name}</span>
        </div>
      }
      topRight={
        <div class="competition-card__status">
          <span>{status}</span>
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
              <AtomButton type={BUTTON_TYPES.ACCENT}>--+ Info</AtomButton>
            </div>
          )}
        </For>
      }
    />
  );
};
