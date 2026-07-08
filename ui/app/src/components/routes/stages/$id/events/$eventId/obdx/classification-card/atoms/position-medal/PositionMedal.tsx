import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import type { PositionMedalProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal.types";
import escarapelaOro from "@/assets/awards/escarapela-oro.svg";
import escarapelaPlata from "@/assets/awards/escarapela-plata.svg";
import escarapelaBronce from "@/assets/awards/escarapela-bronce.svg";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

const MEDALS = {
  1: { src: escarapelaOro, key: "STAGES.CLASSIFICATION.MEDAL_GOLD" },
  2: { src: escarapelaPlata, key: "STAGES.CLASSIFICATION.MEDAL_SILVER" },
  3: { src: escarapelaBronce, key: "STAGES.CLASSIFICATION.MEDAL_BRONZE" },
} as const;

export default function PositionMedal(props: PositionMedalProps) {
  const i18n = useI18n();
  const medal = MEDALS[props.position];

  return (
    <span class="obdx-clf__position-medal">
      <AtomSvgIcon src={medal.src} alt={i18n.t(medal.key)} />
    </span>
  );
}
