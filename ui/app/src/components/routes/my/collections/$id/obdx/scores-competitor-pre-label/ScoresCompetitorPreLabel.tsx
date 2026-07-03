import { EventCompetitorResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import collectedIcon from "@/assets/collected.svg";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import "./styles.css";

interface ScoresCompetitorPreLabelProps {
  competitor: EventCompetitorResponseDTO;
  seen: boolean;
}

export default (props: ScoresCompetitorPreLabelProps) => {
  return (
    <div class="scores-competitor-pre-label" style={{ position: "relative" }}>
      <div
        classList={{
          "scores-competitor-pre-label__seen--hidden": !props.seen,
        }}
      >
        <AtomSvgIcon src={collectedIcon} alt="" />
      </div>
      <CountryFlag
        country={props.competitor.country}
        alt={`${props.competitor.country} flag`}
        width={21}
        height={21}
      />
    </div>
  );
};
