import { For } from "solid-js";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import caciobIcon from "@/assets/escarapela-caciob.svg";
import rcaciobIcon from "@/assets/escarapela-rcaciob.svg";
import cacobIcon from "@/assets/escarapela-cacob.svg";
import rcacobIcon from "@/assets/escarapela-rcacob.svg";
import "./styles.css";

const AWARD_ICONS: Record<string, string> = {
  caciob: caciobIcon,
  rcaciob: rcaciobIcon,
  cacob: cacobIcon,
  rcacob: rcacobIcon,
};

type AwardBadgesProps = {
  awards: IdNameDTO[];
};

export default function AwardBadges(props: AwardBadgesProps) {
  return (
    <For each={props.awards.filter((award) => AWARD_ICONS[award.id])}>
      {(award) => (
        <span class="award-badge">
          <AtomSvgIcon src={AWARD_ICONS[award.id]} alt={award.name} />
        </span>
      )}
    </For>
  );
}
