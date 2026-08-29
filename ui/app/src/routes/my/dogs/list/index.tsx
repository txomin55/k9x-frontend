import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, {
  type ColumnDef,
} from "@lib/components/atoms/table/AtomTable";
import { createFileRoute } from "@tanstack/solid-router";
import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import CountryFilter, {
  ANY_COUNTRY,
} from "@/components/common/country-filter/CountryFilter";
import Page from "@/components/common/page/Page";
import DogCard from "@/components/routes/my/dogs/list/dog-card/DogCard";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import DogForm from "@/components/routes/my/dogs/list/dog-form/DogForm";
import OwnDogForm from "@/components/global/app-shell/layout/navigation/OwnDogForm";
import {
  createDog,
  deleteDog,
  dogsSearchPages,
  loadMoreDogs,
  loadMoreDogsSearch,
  myDogsPages,
  updateDog,
  useDogs,
  useDogsSearch,
} from "@/services/secured/dog-crud/dogCrud";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import {
  buildNameContainsMatcher,
  isSameCountry,
} from "@/utils/filter/nameFilter";
import { useDebouncedValue } from "@/utils/debounce/useDebouncedValue";
import VirtualCardGrid from "@/components/common/virtual-card-grid/VirtualCardGrid";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { useFillRemainingHeight } from "@/utils/layout/useFillRemainingHeight";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

// Mirrors the card grid's CSS minimum column width, so virtualization wraps rows where the grid did.
const CARD_MIN_WIDTH_PX = 240;
// Short fragments match half the kennel, so the search waits until the text says something.
const MIN_NAME_SEARCH_LENGTH = 3;

// Tall enough for a dog name wrapping to three lines, so every card is the same height whatever it holds.
const CARD_HEIGHT_PX = 210;
// On a phone the grid is a single column, so the cards are compact enough to show more than two at once.
const MOBILE_CARD_HEIGHT_PX = 180;
const TABLE_ROW_HEIGHT_PX = 56;
// Room to scroll the last row clear of the floating "new dog" button.
const FLOATING_BUTTON_CLEARANCE_PX = 72;

/**
 * Column widths for the table view. Only the name column grows: the rest are fixed so the layout does
 * not jump as virtualized rows scroll in and out, whatever fits on the current screen.
 */
const COLUMN_WIDTH = {
  sex: 64,
  breed: 168,
  handler: 176,
  withers: 96,
  actions: 112,
} as const;

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
    identification: "",
    name: i18n.t("MY.DOGS.LIST.DEFAULT_DOG"),
    breed: { id: "", name: i18n.t("MY.DOGS.LIST.DEFAULT_BREED") },
    owned: !isOrganizer,
    origin: "",
    license: "",
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
  const [countryFilter, setCountryFilter] = createSignal(ANY_COUNTRY);
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const tableFill = useFillRemainingHeight();
  const listFill = useFillRemainingHeight();
  const device = useDeviceType();

  // The name travels in the request, so it only reaches the query once the typing settles, and only
  // once it is long enough to narrow anything down.
  const debouncedName = useDebouncedValue(() => nameFilter().trim());
  const searchedName = () =>
    debouncedName().length >= MIN_NAME_SEARCH_LENGTH ? debouncedName() : "";
  // Either filter is enough to narrow the list: both travel in the same request.
  const dogSearch = () => ({
    name: searchedName(),
    country: countryFilter(),
  });
  const isSearching = () => !!searchedName() || !!countryFilter();
  const searchQuery = useDogsSearch(dogSearch);

  const myDogs = createMemo(() => {
    if (isSearching()) {
      // Dogs created or edited on this device live as local drafts, which the API knows nothing about,
      // so the same match the server applied is re-applied over the merged list.
      const matches = buildNameContainsMatcher(searchedName());
      const country = countryFilter();

      return (searchQuery.data ?? []).filter(
        (dog) => matches(dog.name) && isSameCountry(dog.country.id, country),
      );
    }

    return dogsQuery.data ?? [];
  });

  const pages = () => (isSearching() ? dogsSearchPages : myDogsPages);
  const hasMore = () => pages().hasMore();
  const isLoadingMore = () => pages().state().isLoadingMore;

  // Both views stay mounted while the other one is shown, and the hidden one reaches "the end of the
  // list" on its own, so only the view on screen is allowed to pull the next page.
  const loadMoreFrom = (fromView: string) => () => {
    if (view() !== fromView) return;

    void (isSearching() ? loadMoreDogsSearch(dogSearch()) : loadMoreDogs());
  };

  const [dogParam, setDogParam] = useSearchParam("dog", "", "push");
  const [draftDog, setDraftDog] = createSignal<Dog>(
    buildDogDraft(!!user()?.organizer),
  );

  const isDialogOpen = () => !!dogParam();
  const editingDogId = () =>
    dogParam() && dogParam() !== "new" ? dogParam() : null;

  const dogToDraft = (dog: Dog): Dog => ({
    identification: dog.identification,
    name: dog.name,
    image: dog.image,
    breed: dog.breed,
    origin: dog.origin,
    // every dog created before the column existed comes back with a null license
    license: dog.license ?? "",
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
    setDogParam(dog.identification);
  };

  createEffect(() => {
    const id = editingDogId();
    if (!id) return;
    const dog = myDogs().find((entry) => entry.identification === id);
    if (dog && draftDog().identification !== dog.identification) {
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
        origin: payload.origin,
        license: payload.license,
        owner: payload.owner,
        handler: payload.handler,
        team: payload.team,
        country: payload.country.id,
        sex: payload.sex,
        withersCm: payload.withersCm,
        threeFciGenerationsConfirmed: payload.threeFciGenerationsConfirmed,
      });
    } else {
      createDog(payload, () => setConflictingDogId(payload.identification));
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
          size: COLUMN_WIDTH.sex,
          enableSorting: false,
          cell: (info) => <SexIcon sex={info.row.original.sex} />,
        },
        {
          id: "breed",
          size: COLUMN_WIDTH.breed,
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
          size: COLUMN_WIDTH.handler,
          accessorKey: "handler",
          header: i18n.t("MY.DOGS.LIST.HANDLER"),
          cell: (info) => info.getValue<string>(),
        },
        {
          id: "withers",
          size: COLUMN_WIDTH.withers,
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
      size: COLUMN_WIDTH.actions,
      enableSorting: false,
      cell: (info) => (
        <div class="list-table__actions">
          <ConfirmActionButton
            text={info.row.original.name}
            onConfirm={() => deleteDog(info.row.original.identification)}
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
    <div ref={listFill.ref}>
      <VirtualCardGrid
        class="dogs-list"
        items={myDogs()}
        height={listFill.height()}
        minColumnWidth={CARD_MIN_WIDTH_PX}
        rowHeight={
          device() === "mobile" ? MOBILE_CARD_HEIGHT_PX : CARD_HEIGHT_PX
        }
        endSpacing={FLOATING_BUTTON_CLEARANCE_PX}
        hasMore={hasMore()}
        isLoadingMore={isLoadingMore()}
        onLoadMore={loadMoreFrom(VIEW.LIST)}
        loadingMoreMessage={i18n.t("MY.DOGS.LIST.LOADING_MORE")}
      >
        {(dog) => (
          <DogCard
            dog={dog}
            onEdit={() => openEditDialog(dog)}
            onDelete={() => deleteDog(dog.identification)}
          />
        )}
      </VirtualCardGrid>
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
        getRowId={(row) => row.identification}
        virtualized
        estimateRowHeight={TABLE_ROW_HEIGHT_PX}
        fixedLayout
        hasMore={hasMore()}
        isLoadingMore={isLoadingMore()}
        loadingMoreMessage={i18n.t("MY.DOGS.LIST.LOADING_MORE")}
        onLoadMore={loadMoreFrom(VIEW.TABLE)}
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
        <div class="dogs-list__filters">
          <NameFilter
            label={i18n.t("MY.DOGS.LIST.NAME_FILTER")}
            value={nameFilter()}
            onChange={setNameFilter}
          />
          <CountryFilter
            value={countryFilter()}
            onChange={setCountryFilter}
          />
        </div>
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

      {/* Dialog triggers and the floating button are overlays: kept out of the page flow so
          they add neither height nor a flex gap to the column the list has to fit in. */}
      <div class="dogs-list__overlays">
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
              dogIdentification={ownershipDogId() ?? ""}
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
      </div>
    </Page>
  );
}
