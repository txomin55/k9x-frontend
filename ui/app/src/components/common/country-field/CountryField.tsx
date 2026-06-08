import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import i18n from "i18next";
import type { JSX } from "solid-js";

export const COUNTRY_OPTIONS = [
  { label: "COMMON.COUNTRY_FIELD.PORTUGAL", value: "pt" },
  { label: "COMMON.COUNTRY_FIELD.SPAIN", value: "es" },
  { label: "COMMON.COUNTRY_FIELD.FRANCE", value: "fr" },
  { label: "COMMON.COUNTRY_FIELD.ITALY", value: "it" },
  { label: "COMMON.COUNTRY_FIELD.UNITED_KINGDOM", value: "gb" },
] as const;

const createCountrySelectOptions = (): AtomSelectOption[] =>
  COUNTRY_OPTIONS.map(({ label, value }) => ({
    label: i18n.t(label),
    value,
    preLabel: <CountryFlag country={value} alt={`${value} flag`} />,
  }));

export const getCountryOption = (
  country: string,
  options: AtomSelectOption[],
) =>
  options.find(
    (option) => option.value === country || option.label === country,
  ) ?? null;

type CountryFieldProps = {
  disabled?: boolean;
  onChange?: (value: AtomSelectOption) => void;
  value: string;
  errorMessage?: JSX.Element;
  validationState?: "valid" | "invalid";
};

export default function CountryField(props: CountryFieldProps) {
  const options = createCountrySelectOptions();

  return (
    <AtomSelect
      label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
      onChange={props.onChange}
      options={options}
      value={getCountryOption(props.value, options)}
      disabled={props.disabled}
      errorMessage={props.errorMessage}
      validationState={props.validationState}
    />
  );
}
