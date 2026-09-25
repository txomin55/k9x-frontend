import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import { createMemo, Show } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useCountries } from "@/services/secured/country-crud/countryCrud";
import { useI18n } from "@/stores/i18n/i18n";
import { useAuthUser } from "@/stores/auth/auth";
import { STAGE_STATUS } from "@/utils/stage";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import "./styles.css";

const STATUS_VALUES = [
  STAGE_STATUS.CREATED,
  STAGE_STATUS.TO_START,
  STAGE_STATUS.STARTED,
  STAGE_STATUS.FINISHED,
];

type StagesFiltersProps = {
  name: string;
  country: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  onNameChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
};

export default function StagesFilters(props: StagesFiltersProps) {
  const user = useAuthUser();

  return (
    <Show when={Boolean(user())}>
      <StagesFiltersFields {...props} />
    </Show>
  );
}

/**
 * Kobalte reads an empty option value as "nothing selected" and swaps the trigger for the
 * placeholder, so the "all" entries need a value of their own inside the select.
 */
const ALL_OPTION_VALUE = "__ALL__";

/** Split out so the filters' queries only run once the login gate above lets them through. */
function StagesFiltersFields(props: StagesFiltersProps) {
  const i18n = useI18n();
  const device = useDeviceType();
  const isMobile = () => device() === "mobile";

  const countriesQuery = useCountries({ refetchOnMount: false });

  // Every country, not just the ones on screen: the country travels in the request, so a country with no
  // trial in the loaded range is still a valid question. A memo, so the flags are created under this
  // component and not whenever the select happens to read its options.
  const countryOptions = createMemo<AtomSelectOption[]>(() => [
    { label: i18n.t("COMMON.COUNTRY_FIELD.ALL"), value: ALL_OPTION_VALUE },
    ...(countriesQuery.data ?? []).map(({ id, name }) => {
      const code = id.toLowerCase();
      return {
        label: name,
        value: code,
        preLabel: <CountryFlag country={code} alt={`${code} flag`} />,
      };
    }),
  ]);

  const selectedCountry = () =>
    countryOptions().find(
      (option) => option.value === props.country.toLowerCase(),
    ) ?? countryOptions()[0];

  const statusOptions: AtomSelectOption[] = [
    { label: i18n.t("STAGES.FILTERS.ALL_STATUSES"), value: ALL_OPTION_VALUE },
    ...STATUS_VALUES.map((value) => ({
      label: i18n.t(`COMMON.STATUS.${value}`),
      value,
    })),
  ];

  const selectedStatus = () =>
    statusOptions.find((option) => option.value === props.status) ??
    statusOptions[0];

  const fromAllOption = (value: string | undefined) =>
    !value || value === ALL_OPTION_VALUE ? "" : value;

  const fields = (
    <>
      <AtomInput
        type="search"
        label={i18n.t("STAGES.FILTERS.NAME")}
        value={props.name}
        onChange={props.onNameChange}
      />
      <div class="stages-filters__inline">
        <AtomSelect
          label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
          placeholder={i18n.t("COMMON.COUNTRY_FIELD.SELECT_COUNTRY")}
          options={countryOptions()}
          value={selectedCountry()}
          onChange={(option) =>
            props.onCountryChange(fromAllOption(option?.value))
          }
        />
        <AtomSelect
          label={i18n.t("STAGES.FILTERS.STATUS")}
          placeholder={i18n.t("STAGES.FILTERS.SELECT_STATUS")}
          options={statusOptions}
          value={selectedStatus()}
          onChange={(option) =>
            props.onStatusChange(fromAllOption(option?.value))
          }
        />
      </div>
      <div class="stages-filters__inline">
        <AtomInput
          type="date"
          label={i18n.t("STAGES.FILTERS.DATE_FROM")}
          value={props.dateFrom}
          onChange={props.onDateFromChange}
        />
        <AtomInput
          type="date"
          label={i18n.t("STAGES.FILTERS.DATE_TO")}
          value={props.dateTo}
          onChange={props.onDateToChange}
        />
      </div>
    </>
  );

  return (
    <div class="stages-filters">
      <Show when={isMobile()} fallback={fields}>
        <AtomCollapsible
          trigger={
            <span class="text-caption-lg">
              {i18n.t("STAGES.FILTERS.TITLE")}
            </span>
          }
          content={<div class="stages-filters__mobile-content">{fields}</div>}
        />
      </Show>
    </div>
  );
}
