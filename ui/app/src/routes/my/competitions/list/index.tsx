import AtomButton, {
	BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, { type ColumnDef } from "@lib/components/atoms/table/AtomTable";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import eyeIcon from "@/assets/miscelaneous/eye.svg";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import CompetitionCard from "@/components/routes/my/competitions/list/competition-card/CompetitionCard";
import { useCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

export const Route = createFileRoute("/my/competitions/list/")({
	component: MyCompetitionsRoute,
});

function MyCompetitionsRoute() {
	return (
		<Suspense
			fallback={
				<Page>
					<CardListSkeleton count={4} />
				</Page>
			}
		>
			<MyCompetitionsIndexPage />
		</Suspense>
	);
}

function MyCompetitionsIndexPage() {
	const navigate = useNavigate();
	const i18n = useI18n();
	const user = useAuthUser();
	const fetchedCompetitions = useCompetitions({
		refetchOnMount: !isOffline(),
		gcTime: 2 * 60 * 1000,
		enabled: () => Boolean(user()),
	});
	const [nameFilter, setNameFilter] = createSignal("");
	const [view, setView] = createSignal<string>(VIEW.LIST);
	const tableFill = useViewportFillHeight();
	const device = useDeviceType();

	const filteredCompetitions = createMemo(() => {
		const matches = buildNameMatcher(nameFilter());
		return (fetchedCompetitions.data ?? []).filter((competition) =>
			matches(competition.name),
		);
	});

	const openDetail = (id: string) =>
		navigate({ to: "/my/competitions/$id", params: { id } });

	const columns = createMemo<ColumnDef<CompetitionResponseDTO, any>[]>(() => {
		const cols: ColumnDef<CompetitionResponseDTO, any>[] = [
			{
				accessorKey: "name",
				header: i18n.t("MY.COMPETITIONS.LIST.NAME"),
				cell: (info) => (
					<div class="list-table__name">
						<CountryFlag country={info.row.original.country} />
						<span>{info.row.original.name}</span>
					</div>
				),
			},
			{
				id: "status",
				accessorFn: (competition) => competition.status,
				header: i18n.t("MY.COMPETITIONS.LIST.STATUS"),
				enableSorting: false,
				cell: (info) => <StatusBadge status={info.row.original.status} />,
			},
		];

		if (device() !== "mobile") {
			cols.push({
				id: "address",
				accessorKey: "address",
				header: i18n.t("MY.COMPETITIONS.LIST.ADDRESS"),
				cell: (info) => info.getValue<string>(),
			});
		}

		cols.push({
			id: "actions",
			header: () => null,
			enableSorting: false,
			cell: (info) => (
				<div class="list-table__actions">
					<AtomButton
						type={BUTTON_TYPES.ACCENT}
						onClick={() => openDetail(info.row.original.id)}
					>
						<AtomSvgIcon
							src={eyeIcon}
							alt={i18n.t("MY.COMPETITIONS.LIST.VIEW_DETAIL")}
							tinted
						/>
					</AtomButton>
				</div>
			),
		});

		return cols;
	});

	const listContent = () => (
		<div class="competitions-list card-list">
			<For each={filteredCompetitions()}>
				{(competition) => (
					<CompetitionCard
						id={competition.id}
						status={competition.status}
						name={competition.name}
						description={competition.description}
						country={competition.country}
						stages={competition.stages}
						address={competition?.address}
					/>
				)}
			</For>
		</div>
	);

	const tableContent = () => (
		<div
			class="competitions-list__table"
			ref={tableFill.ref}
			style={{ height: `${tableFill.height()}px` }}
		>
			<AtomTable<CompetitionResponseDTO>
				data={filteredCompetitions()}
				columns={columns()}
				getRowId={(row) => row.id}
			/>
		</div>
	);

	const controls = createMemo(() => [
		{
			value: VIEW.LIST,
			text: i18n.t("MY.COMPETITIONS.LIST.LIST"),
			content: listContent,
		},
		{
			value: VIEW.TABLE,
			text: i18n.t("MY.COMPETITIONS.LIST.TABLE"),
			content: tableContent,
		},
	]);

	return (
		<Page>
			<Show
				when={
					fetchedCompetitions.data?.length ||
					(!fetchedCompetitions.isPending && !fetchedCompetitions.isFetching)
				}
				fallback={<CardListSkeleton count={4} />}
			>
				<Show
					when={fetchedCompetitions.data?.length}
					fallback={
						<span>{i18n.t("MY.COMPETITIONS.LIST.NO_COMPETITIONS")}</span>
					}
				>
					<NameFilter
						label={i18n.t("MY.COMPETITIONS.LIST.NAME_FILTER")}
						value={nameFilter()}
						onChange={setNameFilter}
					/>
					<Show
						when={filteredCompetitions().length}
						fallback={<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>}
					>
						<AtomSegmentedControl
							title={i18n.t("MY.COMPETITIONS.LIST.VIEW_BY")}
							control={view()}
							onControlChange={setView}
							controls={controls()}
						/>
					</Show>
				</Show>
			</Show>
			<FloatingToggleCircle
				onClick={() =>
					navigate({
						to: "/my/competitions/$id",
						params: { id: "new" },
					})
				}
				nonToggledText="+"
			/>
		</Page>
	);
}
