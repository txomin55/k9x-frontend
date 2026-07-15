import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { ColumnDef } from "@lib/components/atoms/table/AtomTable.types";
import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, createSignal, For, Show, Suspense } from "solid-js";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import DogCard from "@/components/routes/my/dogs/list/dog-card/DogCard";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import DogForm from "@/components/routes/my/dogs/list/dog-form/DogForm";
import OwnDogForm from "@/components/global/app-shell/layout/navigation/OwnDogForm";
import { createDog, deleteDog, updateDog, useDogs } from "@/services/secured/dog-crud/dogCrud";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

export const Route = createFileRoute("/my/dogs/list/")({
  component: MyDogsRoute,
});

function MyDogsRoute() {
  return (
    <Suspense
      fallback={
        <Page>
          <div class="dogs-list card-list">
            <CardListSkeleton count={6} />
          </div>
        </Page>
      }
    >
      <MyDogsListPage />
    </Suspense>
  );
}

function MyDogsListPage() {
  const user = useAuthUser();
  const i18n = useI18n();

  const buildDogDraft = (isOrganizer: boolean): Dog => ({
    id: "",
    name: i18n.t("MY.DOGS.LIST.DEFAULT_DOG"),
    breed: { id: "", name: i18n.t("MY.DOGS.LIST.DEFAULT_BREED") },
    owned: !isOrganizer,
    identity: "",
    image: "",
    owner: !isOrganizer ? (user()?.email ?? "") : "",
    handler: "",
    team: "",
    country: { id: "", name: "" },
    sex: "MALE",
    withersCm: 0,
    threeFciGenerationsConfirmed: false,
  });
  const dogsQuery = useDogs({
    refetchOnMount: !isOffline(),
    gcTime: 2 * 60 * 1000,
  });

  const [nameFilter, setNameFilter] = createSignal("");
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const tableFill = useViewportFillHeight();
  const device = useDeviceType();

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

  const [conflictingDogId, setConflictingDogId] = createSignal<string | null>(
    null,
  );
  const [ownershipDogId, setOwnershipDogId] = createSignal<string | null>(null);

  const handleTakeOwnership = () => {
    setOwnershipDogId(conflictingDogId());
    setConflictingDogId(null);
  };

  const handleSave = () => {
    const payload = draftDog();
    const currentEditingDogId = editingDogId();

    if (currentEditingDogId) {
      updateDog(currentEditingDogId, {
        name: payload.name,
        image: payload.image,
        breed: payload.breed.id,
        identity: payload.identity,
        owner: payload.owner,
        handler: payload.handler,
        team: payload.team,
        country: payload.country.id,
        sex: payload.sex,
        withersCm: payload.withersCm,
        threeFciGenerationsConfirmed: payload.threeFciGenerationsConfirmed,
      });
    } else {
      createDog(payload, () => setConflictingDogId(payload.id));
    }

    handleCloseDialog();
  };

  const columns = createMemo<ColumnDef<Dog, any>[]>(() => {
    const cols: ColumnDef<Dog, any>[] = [
      {
        accessorKey: "name",
        header: i18n.t("MY.DOGS.LIST.NAME"),
        cell: (info) => (
          <div class="list-table__name">
            <CountryFlag country={info.row.original.country.id} />
            <span>{info.row.original.name}</span>
          </div>
        ),
      },
    ];

    if (device() !== "mobile") {
      cols.push(
        {
          id: "sex",
          header: i18n.t("MY.DOGS.LIST.SEX"),
          enableSorting: false,
          cell: (info) => <SexIcon sex={info.row.original.sex} />,
        },
        {
          id: "breed",
          accessorFn: (dog) => dog.breed.name,
          header: i18n.t("MY.DOGS.LIST.BREED"),
          cell: (info) => info.row.original.breed.name,
        },
      );
    }

    if (device() === "laptop") {
      cols.push(
        {
          id: "handler",
          accessorKey: "handler",
          header: i18n.t("MY.DOGS.LIST.HANDLER"),
          cell: (info) => info.getValue<string>(),
        },
        {
          id: "withers",
          accessorKey: "withersCm",
          header: i18n.t("MY.DOGS.LIST.HEIGHT"),
          cell: (info) => {
            const value = info.getValue<number | null>();
            return value == null ? "-" : `${value} cm`;
          },
        },
      );
    }

    cols.push({
      id: "actions",
      header: () => null,
      enableSorting: false,
      cell: (info) => (
        <div class="list-table__actions">
          <ConfirmActionButton
            text={info.row.original.name}
            onConfirm={() => deleteDog(info.row.original.id)}
          >
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
              <AtomSvgIcon
                src={trashIcon}
                alt={i18n.t("MY.DOGS.DOG_CARD.DELETE")}
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
              alt={i18n.t("MY.DOGS.DOG_CARD.EDIT")}
              tinted
            />
          </AtomButton>
        </div>
      ),
    });

    return cols;
  });

  const listContent = () => (
    <div class="dogs-list card-list">
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
  );

  const tableContent = () => (
    <div
      class="dogs-list__table"
      ref={tableFill.ref}
      style={{ height: `${tableFill.height()}px` }}
    >
      <AtomTable<Dog>
        data={myDogs()}
        columns={columns()}
        getRowId={(row) => row.id}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("MY.DOGS.LIST.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("MY.DOGS.LIST.TABLE"),
      content: tableContent,
    },
  ]);

  return (
    <Page>
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
          <AtomSegmentedControl
            title={i18n.t("MY.DOGS.LIST.VIEW_BY")}
            control={view()}
            onControlChange={setView}
            controls={controls()}
          />
        </Show>
      </Show>

      <AtomDialog
        size="wide"
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

      <AtomDialog
        title={i18n.t("MY.DOGS.LIST.DOG_ALREADY_EXISTS_TITLE")}
        content={
          <div class="dogs-list-conflict-dialog__actions">
            <AtomButton
              type={BUTTON_TYPES.ACCENT}
              onClick={() => setConflictingDogId(null)}
            >
              {i18n.t("MY.DOGS.LIST.CANCEL")}
            </AtomButton>
            <AtomButton onClick={handleTakeOwnership}>
              {i18n.t("MY.DOGS.LIST.TAKE_OWNERSHIP")}
            </AtomButton>
          </div>
        }
        open={!!conflictingDogId()}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setConflictingDogId(null);
          }
        }}
        trigger={<span aria-hidden />}
      />

      <AtomDialog
        title={i18n.t("MY.DOGS.LIST.TAKE_OWNERSHIP")}
        content={
          <OwnDogForm
            dogId={ownershipDogId() ?? ""}
            onClose={() => setOwnershipDogId(null)}
          />
        }
        open={!!ownershipDogId()}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOwnershipDogId(null);
          }
        }}
        trigger={<span aria-hidden />}
      />

      <FloatingToggleCircle onClick={openCreateDialog} nonToggledText="+" />
    </Page>
  );
}
