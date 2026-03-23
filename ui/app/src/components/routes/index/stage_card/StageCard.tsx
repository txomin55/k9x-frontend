import Card from "@lib/components/molecules/card/Card";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import "./styles.css";

export default () => {
  return (
    <Card
      topLeft={
        <div class="stage-card__main-info">
          <div class="stage-card__country-flag">
            <span class="fi fi-es" />
          </div>
          <span class="text-heading-sm">Campeonato Regional 2026</span>
        </div>
      }
      topRight={
        <div class="stage-card__notifications">
          <span>--Bell</span>
        </div>
      }
      subHeader={
        <span class="stage-card__date text-caption-sm">Desde - Hasta</span>
      }
      description={
        <p class="stage-card__description text-body-md">
          Torneo clasificatorio de alta intensidad para categorías senior.
        </p>
      }
      content={
        <div>
          <span>--GRADOS</span>
        </div>
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
