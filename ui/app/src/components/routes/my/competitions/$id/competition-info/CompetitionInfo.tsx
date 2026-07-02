import { createSignal, Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import CountryField from "@/components/common/country-field/CountryField";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { useI18n } from "@/stores/i18n/i18n";
import {
  MIN_TEXT_LENGTH,
  type TextFieldError,
  validateRequiredSelection,
  validateRequiredText
} from "@/utils/validation/textField";
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

  const [titleTouched, setTitleTouched] = createSignal(false);
  const [countryTouched, setCountryTouched] = createSignal(false);

  const titleError = () => validateRequiredText(props.title);
  const countryError = () => validateRequiredSelection(props.country);

  const errorMessage = (error: TextFieldError) => {
    if (error === "REQUIRED") return i18n.t("COMMON.VALIDATION.REQUIRED");
    if (error === "MIN_LENGTH")
      return i18n.t("COMMON.VALIDATION.MIN_LENGTH", { min: MIN_TEXT_LENGTH });
    return undefined;
  };

  return (
    <div class="competition-info">
      <Show when={props.isEditing}>
        <div class="competition-info__form">
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.COMPETITION_INFO.TITLE")}
            name="name"
            value={props.title}
            onBlur={() => {
              setTitleTouched(true);
              props.onCommit();
            }}
            onChange={props.onTitleChange}
            validationState={
              titleTouched() && titleError() ? "invalid" : undefined
            }
            errorMessage={
              titleTouched() ? errorMessage(titleError()) : undefined
            }
          />
          <CountryField
            onChange={(value) => {
              setCountryTouched(true);
              props.onCountryChange(value?.value ?? "");
              props.onCommit();
            }}
            value={props.country}
            validationState={
              countryTouched() && countryError() ? "invalid" : undefined
            }
            errorMessage={
              countryTouched() ? errorMessage(countryError()) : undefined
            }
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
            description={i18n.t(
              "MY.COMPETITIONS.COMPETITION_INFO.ADDRESS_HINT",
            )}
          />
        </div>
      </Show>
      <Show when={!props.isEditing}>
        <div class="competition-info__view">
          <span class="text-heading-sm">{props.title}</span>

          <div class="competition-info__view--status">
            <CountryFlag country={props.country} alt={`${props.title} flag`} />
            <Show when={props.status}>
              {(status) => <StatusBadge status={status()} />}
            </Show>
          </div>

          <span>
            {i18n.t("MY.COMPETITIONS.COMPETITION_INFO.DESCRIPTION")}{" "}
            {props.description}
          </span>

          <span class="text-caption-lg">
            {i18n.t("MY.COMPETITIONS.COMPETITION_INFO.ADDRESS")}{" "}
            {props.displayAddress}
          </span>
        </div>
      </Show>
    </div>
  );
}
