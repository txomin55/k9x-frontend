import { Show } from "solid-js";
import CountryFlag from "@/components/common/CountryFlag";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import "./styles.css";

const COUNTRY_SELECT_OPTIONS: AtomSelectOption[] = [
  { label: "Portugal", value: "pt" },
  { label: "Spain", value: "es" },
  { label: "France", value: "fr" },
  { label: "Italy", value: "it" },
  { label: "United Kingdom", value: "gb" },
];

type CompetitionInfoProps = {
  address: string;
  country: string;
  description: string;
  displayAddress?: string;
  displayDescription?: string;
  displayLatitude?: number;
  displayLongitude?: number;
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
  const selectedCountryOption =
    COUNTRY_SELECT_OPTIONS.find(
      (countryOption) => countryOption.value === props.country,
    ) ?? null;

  return (
    <div class="competition-info">
      <Show when={props.isEditing}>
        <div class="competition-info__form">
          <AtomInput
            label="--Title"
            name="name"
            value={props.title}
            onBlur={props.onCommit}
            onChange={props.onTitleChange}
          />
          <AtomSelect
            label="--Country"
            onChange={(value) => {
              props.onCountryChange(value?.value ?? "");
              props.onCommit();
            }}
            options={COUNTRY_SELECT_OPTIONS}
            value={selectedCountryOption}
          />
          <AtomTextArea
            label="--Description"
            name="description"
            value={props.description}
            onBlur={props.onCommit}
            onChange={props.onDescriptionChange}
          />
          <AtomInput
            label="--Address"
            name="address"
            value={props.address}
            onBlur={props.onCommit}
            onChange={props.onAddressChange}
          />
        </div>
      </Show>
      <Show when={!props.isEditing}>
        <div class="competition-info__view">
          <h1>--Title {props.title}</h1>
          <CountryFlag country={props.country} alt={`${props.title} flag`} />
          <span>--Status: {props.status}</span>
          <p>--Description {props.description}</p>

          <p>--Address {props.displayAddress}</p>
          <p>
            --Coords{" "}
            {`${props.displayLatitude ?? "--"} / ${props.displayLongitude ?? "--"}`}
          </p>
        </div>
      </Show>
    </div>
  );
}
