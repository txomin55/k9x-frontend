import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { COUNTRY_OPTIONS } from "@/components/common/country-field/CountryField";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useI18n } from "@/stores/i18n/i18n";
import { STAGE_STATUS } from "@/utils/stage";
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
	const i18n = useI18n();

	const countryOptions: AtomSelectOption[] = [
		{ label: i18n.t("COMMON.COUNTRY_FIELD.ALL"), value: "" },
		...COUNTRY_OPTIONS.map(({ label, value }) => ({
			label: i18n.t(label),
			value,
			preLabel: <CountryFlag country={value} alt={`${value} flag`} />,
		})),
	];

	const selectedCountry = () =>
		countryOptions.find((option) => option.value === props.country) ??
		countryOptions[0];

	const statusOptions: AtomSelectOption[] = [
		{ label: i18n.t("STAGES.FILTERS.ALL_STATUSES"), value: "" },
		...STATUS_VALUES.map((value) => ({
			label: i18n.t(`COMMON.STATUS.${value}`),
			value,
		})),
	];

	const selectedStatus = () =>
		statusOptions.find((option) => option.value === props.status) ??
		statusOptions[0];

	return (
		<div class="stages-filters">
			<AtomInput
				type="search"
				label={i18n.t("STAGES.FILTERS.NAME")}
				value={props.name}
				onChange={props.onNameChange}
			/>
			<AtomSelect
				label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
				options={countryOptions}
				value={selectedCountry()}
				onChange={(option) => props.onCountryChange(option?.value ?? "")}
			/>
			<AtomSelect
				label={i18n.t("STAGES.FILTERS.STATUS")}
				options={statusOptions}
				value={selectedStatus()}
				onChange={(option) => props.onStatusChange(option?.value ?? "")}
			/>
			<div class="stages-filters__dates">
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
		</div>
	);
}
