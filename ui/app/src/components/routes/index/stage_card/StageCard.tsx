import Card from "@lib/components/molecules/card/Card";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import type { Grade } from "@/services/fetch_stages/fetchStages";
import { Index, Suspense } from "solid-js";
import "./styles.css";

interface StageCardProps {
  id: string;
  country: string;
  name: string;
  from: number;
  to: number;
  description: string;
  grades: Grade[];
}

export default ({
  country,
  name,
  from,
  to,
  description,
  grades,
}: StageCardProps) => {
  const normalizedCountry = () => country?.trim().toLowerCase();

  return (
    <Card
      topLeft={
        <div class="stage-card__main-info">
          <div class="stage-card__country-flag">
            <Suspense fallback={<span>--N/A</span>}>
              <span class={`fi fi-${normalizedCountry()}`} />
            </Suspense>
          </div>
          <span class="text-heading-sm">{name}</span>
        </div>
      }
      topRight={
        <div class="stage-card__notifications">
          <span>--Bell</span>
        </div>
      }
      subHeader={
        <span class="stage-card__date text-caption-sm">
          {new Date(from).toDateString()} - {new Date(to).toDateString()}
        </span>
      }
      description={
        <span class="stage-card__description text-body-md">{description}</span>
      }
      content={
        <Index each={grades}>
          {(grade) => (
            <div>
              <span>{grade().name}</span>
              <span>{grade().competitors}</span>
            </div>
          )}
        </Index>
      }
      actions={
        <>
          <AtomButton type={BUTTON_TYPES.ACCENT}>--+ Info</AtomButton>
          <AtomButton type={BUTTON_TYPES.PRIMARY}>
            --Ver clasificacion
          </AtomButton>
        </>
      }
    />
  );
};
