import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { ColumnDef } from "@lib/components/atoms/table/AtomTable.types";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, For, Show, Suspense } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import StageCard from "@/components/routes/stages/stage-card/StageCard";
import StagesFilters from "@/components/routes/stages/stages-filters/StagesFilters";
import StagesMap from "@/components/routes/stages/stages-map/StagesMap";
import { useStages } from "@/services/fetch-stages/fetchStages";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { useOffline } from "@/stores/network/network";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isStageLive } from "@/utils/stage";
import "./styles.css";

const DAY_MS = 24 * 60 * 60 * 1000;

export const Route = createFileRoute("/stages/")({
	component: StagesIndexPage,
});

const CONTROLS_KEYS = {
	LIST: "LIST",
	TABLE: "TABLE",
	MAP: "MAP",
};

function StagesIndexPage() {
	const { isOffline } = useOffline();
	const i18n = useI18n();
	const user = useAuthUser();
	const isLoggedIn = () => !!user();

	const fetchedStages = useStages({
		refetchOnMount: !isOffline(),
		gcTime: 5 * 60 * 1000,
	});

	const [nameFilter, setNameFilter] = useSearchParam("name", "");
	const [countryFilter, setCountryFilter] = useSearchParam("country", "");
	const [statusFilter, setStatusFilter] = useSearchParam("status", "");
	const [dateFromFilter, setDateFromFilter] = useSearchParam("from", "");
	const [dateToFilter, setDateToFilter] = useSearchParam("to", "");

	const filteredStages = createMemo(() => {
		const stages = fetchedStages.data ?? [];
		if (!isLoggedIn()) return stages;

		const matchesName = buildNameMatcher(nameFilter());
		const country = countryFilter().toLowerCase();
		const status = statusFilter();
		const fromTs = dateFromFilter()
			? new Date(dateFromFilter()).getTime()
			: null;
		const toTs = dateToFilter()
			? new Date(dateToFilter()).getTime() + DAY_MS - 1
			: null;

		return stages.filter((stage) => {
			if (!matchesName(stage.name)) return false;
			if (country && (stage.country ?? "").toLowerCase() !== country) {
				return false;
			}
			if (status && stage.status !== status) return false;
			const date = stage.dateFrom ?? 0;
			if (fromTs !== null && date < fromTs) return false;
			if (toTs !== null && date > toTs) return false;
			return true;
		});
	});

	const sortedStages = createMemo(
		() =>
			filteredStages().toSorted(
				(left, right) => (left.dateFrom ?? 0) - (right.dateFrom ?? 0),
			) ?? [],
	);

	const renderStageCard = (stage: StageSummaryResponseDTO) => (
		<StageCard
			id={stage.id}
			country={stage.country ?? ""}
			name={stage.name}
			status={stage.status}
			from={stage.dateFrom ?? 0}
			to={stage.dateTo ?? 0}
			description={stage.description ?? ""}
			organizer={stage.organizer}
			address={stage?.location?.address}
			events={stage.events ?? []}
		/>
	);

	const columns = createMemo<ColumnDef<StageSummaryResponseDTO>[]>(() => [
		{
			accessorKey: "country",
			header: i18n.t("STAGES.INDEX.COUNTRY"),
			enableSorting: false,
			cell: (info) => (
				<CountryFlag country={info.getValue<string>()} width={20} height={20} />
			),
		},
		{
			id: "name_status",
			accessorFn: (stage) => stage,
			header: i18n.t("STAGES.INDEX.NAME"),
			cell: (info) => {
				const stage = info.getValue<StageSummaryResponseDTO>();
				return (
					<div>
						<span>{stage.name}</span>
						<Show when={stage.status && isStageLive(stage.status)}>
							<StatusBadge status={stage.status!} dotMode />
						</Show>
					</div>
				);
			},
		},
		{
			id: "dateFrom",
			accessorFn: (stage) => stage.dateFrom ?? 0,
			header: i18n.t("STAGES.INDEX.DATE_FROM"),
			cell: (info) => new Date(info.getValue<number>()).toLocaleDateString(),
		},
		{
			id: "expander",
			header: () => null,
			enableSorting: false,
			cell: (info) => (
				<button
					type="button"
					class="stages-table__expander"
					aria-label={
						info.row.getIsExpanded()
							? i18n.t("STAGES.INDEX.CLOSE")
							: i18n.t("STAGES.INDEX.SEE_DETAIL")
					}
					aria-expanded={info.row.getIsExpanded()}
					onClick={info.row.getToggleExpandedHandler()}
				>
					{info.row.getIsExpanded() ? "▾" : "▸"}
				</button>
			),
		},
	]);

	const controls = createMemo(() => [
		{
			value: CONTROLS_KEYS.LIST,
			text: i18n.t("STAGES.INDEX.LIST"),
			content: <For each={sortedStages()}>{renderStageCard}</For>,
		},
		{
			value: CONTROLS_KEYS.TABLE,
			text: i18n.t("STAGES.INDEX.TABLE"),
			content: (
				<div class="stages-table">
					<AtomTable<StageSummaryResponseDTO>
						data={sortedStages()}
						columns={columns()}
						getRowCanExpand={() => true}
						renderSubComponent={(row) => renderStageCard(row.original)}
					/>
				</div>
			),
		},
		{
			value: CONTROLS_KEYS.MAP,
			text: i18n.t("STAGES.INDEX.MAP"),
			disabled: isOffline(),
			content: <StagesMap stages={sortedStages()} />,
		},
	]);

	const [controlValue, setControlValue] = useSearchParam(
		"view",
		CONTROLS_KEYS.LIST,
	);
	const [stageParam] = useSearchParam("stage", "");

	createEffect(() => {
		if (isOffline() && controlValue() === CONTROLS_KEYS.MAP) {
			setControlValue(CONTROLS_KEYS.LIST);
		}
	});

	createEffect(() => {
		if (stageParam() && controlValue() !== CONTROLS_KEYS.MAP && !isOffline()) {
			setControlValue(CONTROLS_KEYS.MAP);
		}
	});

	return (
		<div class="stages">
			<Suspense fallback={<span>{i18n.t("STAGES.INDEX.LOADING_STAGES")}</span>}>
				<Show when={isLoggedIn()}>
					<StagesFilters
						name={nameFilter()}
						country={countryFilter()}
						status={statusFilter()}
						dateFrom={dateFromFilter()}
						dateTo={dateToFilter()}
						onNameChange={setNameFilter}
						onCountryChange={setCountryFilter}
						onStatusChange={setStatusFilter}
						onDateFromChange={setDateFromFilter}
						onDateToChange={setDateToFilter}
					/>
					<Show when={!sortedStages().length}>
						<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>
					</Show>
				</Show>
				<AtomSegmentedControl
					title={i18n.t("STAGES.INDEX.STAGES_BY")}
					control={controlValue()}
					onControlChange={setControlValue}
					controls={controls()}
				/>
			</Suspense>
		</div>
	);
}
