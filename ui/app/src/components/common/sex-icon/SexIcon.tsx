import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { useI18n } from "@/stores/i18n/i18n";
import maleIcon from "@/assets/male.svg";
import femaleIcon from "@/assets/female.svg";
import type { DogSex } from "@/services/secured/dog-crud/dogCrud.types";
import { Show } from "solid-js";
import "./styles.css";

type SexIconProps = {
  sex?: DogSex;
};

export default function SexIcon(props: SexIconProps) {
  const i18n = useI18n();

  const icon = () => (props.sex === "MALE" ? maleIcon : femaleIcon);
  const label = () =>
    props.sex === "MALE"
      ? i18n.t("COMMON.SEX_ICON.MALE")
      : i18n.t("COMMON.SEX_ICON.FEMALE");

  return (
    <Show when={props.sex === "MALE" || props.sex === "FEMALE"}>
      <span class="sex-icon">
        <AtomSvgIcon src={icon()} alt={label()} />
      </span>
    </Show>
  );
}
