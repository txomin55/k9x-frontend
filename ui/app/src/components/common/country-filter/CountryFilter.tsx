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
    { label: i18n.t("COMMON.COUNTRY_FIELD.ALL"), value: ANY_COUNTRY },
    ...(countriesQuery.data ?? []).map(({ id, name }) => ({
      label: name,
      value: id,
      preLabel: <CountryFlag country={id} alt={`${id} flag`} />,
    })),
  ]);

  const selected = () =>
    options().find((option) => option.value === props.value) ?? options()[0];

  return (
    <div class="country-filter">
      <AtomSelect
        label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
        options={options()}
        value={selected()}
        onChange={(option) => props.onChange(option?.value ?? ANY_COUNTRY)}
      />
    </div>
  );
}
