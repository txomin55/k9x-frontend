import { Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import CountryField from "@/components/common/country-field/CountryField";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type CompetitionInfoProps = {
  address: string;
  country: string;
  description: string;
  displayAddress?: string;
  displayDescription?: string;
  isEditing: boolean;
  onAddressChange: (value: string) => void;
  onCommit: () => void;
  onCountryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  status?: string;
  title: string;
};

export default function CompetitionInfo(props: CompetitionInfoProps) {
  const i18n = useI18n();
  return (
    <div class="competition-info">
      <Show when={props.isEditing}>
        <div class="competition-info__form">
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.COMPETITION_INFO.TITLE")}
            name="name"
            value={props.title}
            onBlur={props.onCommit}
            onChange={props.onTitleChange}
          />
          <CountryField
            onChange={(value) => {
              props.onCountryChange(value?.value ?? "");
              props.onCommit();
            }}
            value={props.country}
          />
          <AtomTextArea
            label={i18n.t("MY.COMPETITIONS.COMPETITION_INFO.DESCRIPTION")}
            name="description"
            value={props.description}
            onBlur={props.onCommit}
            onChange={props.onDescriptionChange}
          />
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.COMPETITION_INFO.ADDRESS")}
            name="address"
            value={props.address}
            onBlur={props.onCommit}
            onChange={props.onAddressChange}
          />
        </div>
      </Show>
      <Show when={!props.isEditing}>
        <div class="competition-info__view">
          <h1>{i18n.t("MY.COMPETITIONS.COMPETITION_INFO.TITLE")} {props.title}</h1>
          <CountryFlag country={props.country} alt={`${props.title} flag`} />
          <span>{i18n.t("MY.COMPETITIONS.COMPETITION_INFO.STATUS")}: {props.status}</span>
          <p>{i18n.t("MY.COMPETITIONS.COMPETITION_INFO.DESCRIPTION")} {props.description}</p>

          <p>{i18n.t("MY.COMPETITIONS.COMPETITION_INFO.ADDRESS")} {props.displayAddress}</p>
        </div>
      </Show>
    </div>
  );
}
