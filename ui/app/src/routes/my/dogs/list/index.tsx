import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import { createFileRoute } from "@tanstack/solid-router";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
	Suspense,
} from "solid-js";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import DogCard from "@/components/routes/my/dogs/list/dog-card/DogCard";
import DogForm from "@/components/routes/my/dogs/list/dog-form/DogForm";
import {
	createDog,
	deleteDog,
	updateDog,
	useDogs,
} from "@/services/secured/dog-crud/dogCrud";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import "./styles.css";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isOffline } from "@/utils/local-first/localFirstPolicy";

export const Route = createFileRoute("/my/dogs/list/")({
	component: MyDogsListPage,
});

function MyDogsListPage() {
	const user = useAuthUser();
	const i18n = useI18n();

	const buildDogDraft = (isOrganizer: boolean): Dog => ({
		id: "",
		name: i18n.t("MY.DOGS.LIST.DEFAULT_DOG"),
		breed: i18n.t("MY.DOGS.LIST.DEFAULT_BREED"),
		owned: !isOrganizer,
		identity: "",
		image: "",
		owner: !isOrganizer ? (user()?.email ?? "") : "",
		handler: "",
		team: "",
		country: "",
		sex: "MALE",
		withersCm: 0,
		threeFciGenerationsConfirmed: false,
	});
	const dogsQuery = useDogs({
		refetchOnMount: !isOffline(),
		gcTime: 2 * 60 * 1000,
	});

	const [nameFilter, setNameFilter] = createSignal("");

	const myDogs = createMemo(() => {
		if (!dogsQuery.data) {
			return [];
		}

		const matches = buildNameMatcher(nameFilter());
		return dogsQuery.data.filter((dog) => matches(dog.name));
	});

	const [dogParam, setDogParam] = useSearchParam("dog", "", "push");
	const [draftDog, setDraftDog] = createSignal<Dog>(
		buildDogDraft(!!user()?.organizer),
	);

	const isDialogOpen = () => !!dogParam();
	const editingDogId = () =>
		dogParam() && dogParam() !== "new" ? dogParam() : null;

	const dogToDraft = (dog: Dog): Dog => ({
		id: dog.id,
		name: dog.name,
		image: dog.image,
		breed: dog.breed,
		identity: dog.identity,
		owner: dog.owner,
		handler: dog.handler,
		team: dog.team,
		country: dog.country,
		sex: dog.sex,
		withersCm: dog.withersCm,
		owned: dog.owned,
		threeFciGenerationsConfirmed: dog.threeFciGenerationsConfirmed,
	});

	const openCreateDialog = () => {
		setDraftDog(buildDogDraft(!!user()?.organizer));
		setDogParam("new");
	};

	const handleCloseDialog = () => {
		setDogParam("");
	};

	const openEditDialog = (dog: Dog) => {
		setDraftDog(() => dogToDraft(dog));
		setDogParam(dog.id);
	};

	createEffect(() => {
		const id = editingDogId();
		if (!id) return;
		const dog = dogsQuery.data?.find((entry) => entry.id === id);
		if (dog && draftDog().id !== dog.id) {
			setDraftDog(() => dogToDraft(dog));
		}
	});

	const handleSave = () => {
		const payload = draftDog();
		const currentEditingDogId = editingDogId();

		if (currentEditingDogId) {
			updateDog(currentEditingDogId, {
				name: payload.name,
				image: payload.image,
				breed: payload.breed,
				identity: payload.identity,
				owner: payload.owner,
				handler: payload.handler,
				team: payload.team,
				country: payload.country,
				sex: payload.sex,
				withersCm: payload.withersCm,
				threeFciGenerationsConfirmed: payload.threeFciGenerationsConfirmed,
			});
		} else {
			createDog(payload);
		}

		handleCloseDialog();
	};

	return (
		<Page>
			<AtomDialog
				title={
					editingDogId()
						? i18n.t("MY.DOGS.LIST.EDIT_DOG")
						: i18n.t("MY.DOGS.LIST.NEW_DOG")
				}
				content={
					<DogForm
						draft={draftDog}
						onDraftChange={(updater) =>
							setDraftDog((current) => ({
								...updater(current),
							}))
						}
						onCancel={handleCloseDialog}
						onSave={handleSave}
						isEditMode={!!editingDogId()}
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

			<Suspense fallback={<span>{i18n.t("MY.DOGS.LIST.LOADING_DOGS")}</span>}>
				<Show
					when={dogsQuery.data?.length}
					fallback={<p>{i18n.t("MY.DOGS.LIST.NO_DOGS_AVAILABLE_YET")}</p>}
				>
					<NameFilter
						label={i18n.t("MY.DOGS.LIST.NAME_FILTER")}
						value={nameFilter()}
						onChange={setNameFilter}
					/>
					<Show
						when={myDogs().length}
						fallback={<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>}
					>
						<div class="dogs-list">
							<For each={myDogs()}>
								{(dog) => (
									<DogCard
										dog={dog}
										onEdit={() => openEditDialog(dog)}
										onDelete={() => deleteDog(dog.id)}
									/>
								)}
							</For>
						</div>
					</Show>
				</Show>
			</Suspense>

			<FloatingToggleCircle onClick={openCreateDialog} nonToggledText="+" />
		</Page>
	);
}
