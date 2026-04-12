import { Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import CountryField from "@/components/routes/my/competitions/$id/competition-info/CountryField";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import "./styles.css";

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
          <CountryField
            onChange={(value) => {
              props.onCountryChange(value?.value ?? "");
              props.onCommit();
            }}
            value={props.country}
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
