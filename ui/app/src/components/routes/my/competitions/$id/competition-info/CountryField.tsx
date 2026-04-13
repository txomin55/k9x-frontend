import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import CountryFlag from "@/components/common/country-flag/CountryFlag";

export const COUNTRY_SELECT_OPTIONS: AtomSelectOption[] = [
  {
    label: "--Portugal",
    value: "pt",
    preLabel: <CountryFlag country="pt" alt="pt flag" />,
  },
  {
    label: "--Spain",
    value: "es",
    preLabel: <CountryFlag country="es" alt="es flag" />,
  },
  {
    label: "--France",
    value: "fr",
    preLabel: <CountryFlag country="fr" alt="fr flag" />,
  },
  {
    label: "--Italy",
    value: "it",
    preLabel: <CountryFlag country="it" alt="it flag" />,
  },
  {
    label: "--United Kingdom",
    value: "gb",
    preLabel: <CountryFlag country="gb" alt="gb flag" />,
  },
];

export const getCountryOption = (country: string) =>
  COUNTRY_SELECT_OPTIONS.find(
    (option) => option.value === country || option.label === country,
  ) ?? null;

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
