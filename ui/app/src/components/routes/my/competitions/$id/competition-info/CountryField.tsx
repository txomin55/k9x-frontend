import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";

export const COUNTRY_SELECT_OPTIONS: AtomSelectOption[] = [
  { label: "--Portugal", value: "pt" },
  { label: "--Spain", value: "es" },
  { label: "--France", value: "fr" },
  { label: "--Italy", value: "it" },
  { label: "--United Kingdom", value: "gb" },
];

export const getCountryOption = (country: string) =>
  COUNTRY_SELECT_OPTIONS.find(
    (option) => option.value === country || option.label === country,
  ) ?? null;

export const getCountryLabel = (country: string) =>
  getCountryOption(country)?.label ?? country;

type CountryFieldProps = {
  disabled?: boolean;
  onChange: (value: AtomSelectOption) => void;
  value: string;
};

export default function CountryField(props: CountryFieldProps) {
  return (
    <AtomSelect
      label="--Country"
      onChange={props.onChange}
      options={COUNTRY_SELECT_OPTIONS}
      value={getCountryOption(props.value)}
      disabled={props.disabled}
    />
  );
}
