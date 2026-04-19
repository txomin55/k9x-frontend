import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import CountryFlag from "@/components/common/country-flag/CountryFlag";

export const COUNTRY_OPTIONS = [
  { label: "--Portugal", value: "pt" },
  { label: "--Spain", value: "es" },
  { label: "--France", value: "fr" },
  { label: "--Italy", value: "it" },
  { label: "--United Kingdom", value: "gb" },
] as const;

const createCountrySelectOptions = (): AtomSelectOption[] =>
  COUNTRY_OPTIONS.map(({ label, value }) => ({
    label,
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
  onChange: (value: AtomSelectOption) => void;
  value: string;
};

export default function CountryField(props: CountryFieldProps) {
  const options = createCountrySelectOptions();

  return (
    <AtomSelect
      label="--Country"
      onChange={props.onChange}
      options={options}
      value={getCountryOption(props.value, options)}
      disabled={props.disabled}
    />
  );
}
