import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useCountries } from "@/services/secured/country-crud/countryCrud";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import i18n from "i18next";
import { createMemo, type JSX } from "solid-js";

const createCountrySelectOptions = (
  countries: IdNameDTO[],
): AtomSelectOption[] =>
  countries.map(({ id, name }) => ({
    label: name,
    value: id,
    preLabel: <CountryFlag country={id} alt={`${id} flag`} />,
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
  const countriesQuery = useCountries({ refetchOnMount: false });
  const options = createMemo(() =>
    createCountrySelectOptions(countriesQuery.data ?? []),
  );

  return (
    <AtomSelect
      label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
      placeholder={i18n.t("COMMON.COUNTRY_FIELD.SELECT_COUNTRY")}
      onChange={props.onChange}
      options={options()}
      value={getCountryOption(props.value, options())}
      disabled={props.disabled}
      errorMessage={props.errorMessage}
      validationState={props.validationState}
    />
  );
}
