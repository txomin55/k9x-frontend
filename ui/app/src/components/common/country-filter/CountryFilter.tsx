import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useCountries } from "@/services/secured/country-crud/countryCrud";
import { useI18n } from "@/stores/i18n/i18n";
import { createMemo } from "solid-js";
import "./styles.css";

/** The option that stands for "no country filter", told apart from a real country by its empty value. */
export const ANY_COUNTRY = "";

/**
 * Kobalte reads an empty option value as "nothing selected" and swaps the trigger for the
 * placeholder, so the "all countries" entry needs a value of its own inside the select.
 */
const ALL_OPTION_VALUE = "__ALL__";

type CountryFilterProps = {
  value: string;
  onChange: (country: string) => void;
};

/**
 * Country picker for a list: unlike the country field of a form, it carries an "all countries" entry,
 * because not filtering is a valid answer here.
 */
export default function CountryFilter(props: CountryFilterProps) {
  const i18n = useI18n();
  const countriesQuery = useCountries({ refetchOnMount: false });

  const options = createMemo<AtomSelectOption[]>(() => [
    { label: i18n.t("COMMON.COUNTRY_FIELD.ALL"), value: ALL_OPTION_VALUE },
    ...(countriesQuery.data ?? []).map(({ id, name }) => ({
      label: name,
      value: id,
      preLabel: <CountryFlag country={id} alt={`${id} flag`} />,
    })),
  ]);

  const selected = () =>
    options().find((option) => option.value === props.value) ?? options()[0];

  const toCountry = (value: string | undefined) =>
    !value || value === ALL_OPTION_VALUE ? ANY_COUNTRY : value;

  return (
    <div class="country-filter">
      <AtomSelect
        label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
        options={options()}
        value={selected()}
        onChange={(option) => props.onChange(toCountry(option?.value))}
      />
    </div>
  );
}
