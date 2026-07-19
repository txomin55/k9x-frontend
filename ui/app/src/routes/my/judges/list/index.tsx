import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, { type ColumnDef } from "@lib/components/atoms/table/AtomTable";
import { createFileRoute } from "@tanstack/solid-router";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
	Suspense,
} from "solid-js";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import JudgeCard from "@/components/routes/my/judges/list/judge-card/JudgeCard";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import JudgeForm from "@/components/routes/my/judges/list/judge-form/JudgeForm";
import {
	createJudge,
	deleteJudge,
	updateJudge,
	useCreatedJudges,
} from "@/services/secured/judge-crud/judgeCrud";
import type { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import "./styles.css";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { generateEntityId } from "@/utils/id/generateEntityId";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

export const Route = createFileRoute("/my/judges/list/")({
	component: MyJudgesRoute,
});

function MyJudgesRoute() {
	return (
		<Suspense
			fallback={
				<Page>
					<div class="judges-list card-list">
						<CardListSkeleton count={6} />
					</div>
				</Page>
			}
		>
			<MyJudgesListPage />
		</Suspense>
	);
}

function MyJudgesListPage() {
	const i18n = useI18n();
	const buildJudgeDraft = (): JudgeResponseDTO => ({
		id: generateEntityId("judge"),
		name: i18n.t("MY.JUDGES.LIST.DEFAULT_JUDGE"),
		country: "",
	});
	const user = useAuthUser();
	const judgesQuery = useCreatedJudges({
		refetchOnMount: !isOffline(),
		gcTime: 2 * 60 * 1000,
		enabled: () => Boolean(user()),
	});

	const [judgeParam, setJudgeParam] = useSearchParam("judge", "", "push");
	const [draftJudge, setDraftJudge] = createSignal<JudgeResponseDTO>(
		buildJudgeDraft(),
	);
	const [nameFilter, setNameFilter] = createSignal("");
	const [view, setView] = createSignal<string>(VIEW.LIST);
	const tableFill = useViewportFillHeight();

	const filteredJudges = createMemo(() => {
		const matches = buildNameMatcher(nameFilter());
		return (judgesQuery.data ?? []).filter((judge) => matches(judge.name));
	});

	const isDialogOpen = () => !!judgeParam();
	const editingJudgeId = () =>
		judgeParam() && judgeParam() !== "new" ? judgeParam() : null;

	const openCreateDialog = () => {
		setDraftJudge(buildJudgeDraft());
		setJudgeParam("new");
	};
	const handleCloseDialog = () => {
		setJudgeParam("");
	};

	const openEditDialog = (judge: JudgeResponseDTO) => {
		setDraftJudge(() => ({
			id: judge.id,
			name: judge.name,
			country: judge.country,
		}));
		setJudgeParam(judge.id);
	};

	createEffect(() => {
		const id = editingJudgeId();
		if (!id) return;
		const judge = judgesQuery.data?.find((entry) => entry.id === id);
		if (judge && draftJudge().id !== judge.id) {
			setDraftJudge(() => ({
				id: judge.id,
				name: judge.name,
				country: judge.country,
			}));
		}
	});

	const handleSave = () => {
		const payload = draftJudge();
		const currentEditingJudgeId = editingJudgeId();

		if (currentEditingJudgeId) {
			updateJudge(currentEditingJudgeId, {
				name: payload.name,
				country: payload.country,
			});
		} else {
			createJudge(payload);
		}

		handleCloseDialog();
	};

	const columns = createMemo<ColumnDef<JudgeResponseDTO, any>[]>(() => [
		{
			accessorKey: "name",
			header: i18n.t("MY.JUDGES.LIST.NAME"),
			cell: (info) => (
				<div class="list-table__name">
					<CountryFlag country={info.row.original.country} />
					<span>{info.row.original.name}</span>
				</div>
			),
		},
		{
			id: "actions",
			header: () => null,
			enableSorting: false,
			cell: (info) => (
				<div class="list-table__actions">
					<ConfirmActionButton
						text={info.row.original.name}
						onConfirm={() => deleteJudge(info.row.original.id)}
					>
						<AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
							<AtomSvgIcon
								src={trashIcon}
								alt={i18n.t("MY.JUDGES.JUDGE_CARD.DELETE")}
								tinted
							/>
						</AtomButton>
					</ConfirmActionButton>
					<AtomButton
						type={BUTTON_TYPES.ACCENT}
						onClick={() => openEditDialog(info.row.original)}
					>
						<AtomSvgIcon
							src={pencilIcon}
							alt={i18n.t("MY.JUDGES.JUDGE_CARD.EDIT")}
							tinted
						/>
					</AtomButton>
				</div>
			),
		},
	]);

	const listContent = () => (
		<div class="judges-list card-list">
			<For each={filteredJudges()}>
				{(judge) => (
					<JudgeCard
						judge={judge}
						onEdit={() => openEditDialog(judge)}
						onDelete={() => deleteJudge(judge.id)}
					/>
				)}
			</For>
		</div>
	);

	const tableContent = () => (
		<div
			class="judges-list__table"
			ref={tableFill.ref}
			style={{ height: `${tableFill.height()}px` }}
		>
			<AtomTable<JudgeResponseDTO>
				data={filteredJudges()}
				columns={columns()}
				getRowId={(row) => row.id}
			/>
		</div>
	);

	const controls = createMemo(() => [
		{
			value: VIEW.LIST,
			text: i18n.t("MY.JUDGES.LIST.LIST"),
			content: listContent,
		},
		{
			value: VIEW.TABLE,
			text: i18n.t("MY.JUDGES.LIST.TABLE"),
			content: tableContent,
		},
	]);

	return (
		<Page>
			<AtomDialog
				title={
					editingJudgeId()
						? i18n.t("MY.JUDGES.LIST.EDIT_JUDGE")
						: i18n.t("MY.JUDGES.LIST.NEW_JUDGE")
				}
				content={
					<JudgeForm
						draft={draftJudge}
						onDraftChange={(updater) =>
							setDraftJudge((current) => updater(current))
						}
						onCancel={handleCloseDialog}
						onSave={handleSave}
					/>
				}
				open={isDialogOpen()}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						handleCloseDialog();
					}
				}}
				trigger={<span aria-hidden />}
			/>

			<Show
				when={
					judgesQuery.data?.length ||
					(!judgesQuery.isPending && !judgesQuery.isFetching)
				}
				fallback={
					<div class="judges-list card-list">
						<CardListSkeleton count={6} />
					</div>
				}
			>
				<Show
					when={judgesQuery.data?.length}
					fallback={<p>{i18n.t("MY.JUDGES.LIST.NO_JUDGES_AVAILABLE_YET")}</p>}
				>
					<NameFilter
						label={i18n.t("MY.JUDGES.LIST.NAME_FILTER")}
						value={nameFilter()}
						onChange={setNameFilter}
					/>
					<Show
						when={filteredJudges().length}
						fallback={<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>}
					>
						<AtomSegmentedControl
							title={i18n.t("MY.JUDGES.LIST.VIEW_BY")}
							control={view()}
							onControlChange={setView}
							controls={controls()}
						/>
					</Show>
				</Show>
			</Show>

			<FloatingToggleCircle onClick={openCreateDialog} nonToggledText="+" />
		</Page>
	);
}
