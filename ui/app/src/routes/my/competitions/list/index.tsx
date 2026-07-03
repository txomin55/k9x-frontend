import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import CompetitionCard from "@/components/routes/my/competitions/list/competition-card/CompetitionCard";
import { useCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { isOffline } from "@/utils/local-first/localFirstPolicy";

export const Route = createFileRoute("/my/competitions/list/")({
	component: MyCompetitionsIndexPage,
});

function MyCompetitionsIndexPage() {
	const navigate = useNavigate();
	const i18n = useI18n();
	const fetchedCompetitions = useCompetitions({
		refetchOnMount: !isOffline(),
		gcTime: 2 * 60 * 1000,
	});
	const [nameFilter, setNameFilter] = createSignal("");

	const filteredCompetitions = createMemo(() => {
		const matches = buildNameMatcher(nameFilter());
		return (fetchedCompetitions.data ?? []).filter((competition) =>
			matches(competition.name),
		);
	});

	return (
		<Page>
			<Suspense
				fallback={
					<span>{i18n.t("MY.COMPETITIONS.LIST.LOADING_COMPETITIONS")}</span>
				}
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
					</Show>
				</Show>
			</Suspense>
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
