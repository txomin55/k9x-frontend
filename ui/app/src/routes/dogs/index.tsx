import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import AtomTable, {
  type ColumnDef,
} from "@lib/components/atoms/table/AtomTable";
import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, Show, Suspense } from "solid-js";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import PageSeo from "@/components/common/page-seo/PageSeo";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import VirtualCardGrid from "@/components/common/virtual-card-grid/VirtualCardGrid";
import { countriesOf } from "@/components/routes/dogs/dogCountries";
import K9xScore from "@/components/routes/dogs/dog-card/K9xScore";
import PublicDogCard from "@/components/routes/dogs/dog-card/PublicDogCard";
import {
  loadMorePublicDogs,
  publicDogsPages,
  usePublicDogs,
} from "@/services/fetch-dogs/fetchDogs";
import type { PublicDog } from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import { useDebouncedValue } from "@/utils/debounce/useDebouncedValue";
import { useFillRemainingHeight } from "@/utils/layout/useFillRemainingHeight";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

/**
 * Kobalte reads an empty option value as "nothing selected" and swaps the trigger for the placeholder,
 * so the "all countries" entry needs a value of its own inside the select.
 */
const ALL_COUNTRIES = "__ALL__";

// Mirrors the card grid's CSS minimum column width, so virtualization wraps rows where the grid did.
const CARD_MIN_WIDTH_PX = 240;
// Short fragments match half the directory, so the search waits until the text says something.
const MIN_SEARCH_LENGTH = 3;

// Tall enough for a dog name wrapping to three lines, so every card is the same height whatever it holds.
const CARD_HEIGHT_PX = 220;
// On a phone the grid is a single column, but the card holds the same rows, so it keeps the same height.
const MOBILE_CARD_HEIGHT_PX = 220;
const TABLE_ROW_HEIGHT_PX = 56;
const FLOATING_PILL_CLEARANCE_PX = 72;

/**
 * Column widths for the table view. Only the name column grows: the rest are fixed so the layout does
 * not jump as virtualized rows scroll in and out, whatever fits on the current screen.
 */
const COLUMN_WIDTH = {
  score: 88,
  breed: 168,
  sex: 64,
  handler: 176,
} as const;

/**
 * Strips the sorting affordance off every column. The directory is always ordered by K9X index,
 * descending, and that order is the server's: it spans the whole directory, while a local sort would
 * only reshuffle the pages pulled so far and say nothing about the rest. The index also travels as a
 * string, so a local sort would put "9" above "742".
 *
 * Applied to the whole set rather than column by column so a column added later cannot reintroduce it.
 */
const unsortable = (columns: ColumnDef<PublicDog, any>[]) =>
  columns.map((column) => ({ ...column, enableSorting: false }));

export const Route = createFileRoute("/dogs/")({
  component: PublicDogsRoute,
});

function PublicDogsRoute() {
  return (
    <Suspense
      fallback={
        <Page>
          <div class="public-dogs card-list">
            <CardListSkeleton count={6} />
          </div>
        </Page>
      }
    >
      <PublicDogsPage />
    </Suspense>
  );
}

function PublicDogsPage() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const device = useDeviceType();
  const listFill = useFillRemainingHeight();
  const tableFill = useFillRemainingHeight();

  const [nameFilter, setNameFilter] = createSignal("");
  const [handlerFilter, setHandlerFilter] = createSignal("");
  const [countryFilter, setCountryFilter] = createSignal("");
  const [view, setView] = createSignal<string>(VIEW.LIST);

  // The text filters travel in the request, so they only reach the query once the typing settles, and
  // only once they are long enough to narrow anything down.
  const debouncedName = useDebouncedValue(() => nameFilter().trim());
  const debouncedHandler = useDebouncedValue(() => handlerFilter().trim());
  const longEnough = (value: string) =>
    value.length >= MIN_SEARCH_LENGTH ? value : "";

  const search = () => ({
    name: longEnough(debouncedName()),
    handler: longEnough(debouncedHandler()),
    country: countryFilter(),
  });

  const dogsQuery = usePublicDogs(search);
  const dogs = () => dogsQuery.data ?? [];

  /**
   * "Nothing matches" is only true once the request is done. The data proxy collapses "still loading" and
   * "really empty" into the same empty list, so an empty one only means empty when nothing is in flight —
   * and on the first tick the query is pending with the fetch not even started, so `isFetching` alone
   * would let the label through for a frame.
   */
  const isResolved = () => !dogsQuery.isPending && !dogsQuery.isFetching;

  const hasMore = () => publicDogsPages.hasMore();
  const isLoadingMore = () => publicDogsPages.state().isLoadingMore;

  // Both views stay mounted while the other one is shown, and the hidden one reaches "the end of the
  // list" on its own, so only the view on screen is allowed to pull the next page.
  const loadMoreFrom = (fromView: string) => () => {
    if (view() !== fromView) return;

    void loadMorePublicDogs(search());
  };

  const countryOptions = createMemo<AtomSelectOption[]>(() => [
    { label: i18n.t("COMMON.COUNTRY_FIELD.ALL"), value: ALL_COUNTRIES },
    ...countriesOf(dogs()).map(({ id, name }) => ({
      label: name,
      value: id,
      preLabel: <CountryFlag country={id} alt={`${id} flag`} />,
    })),
  ]);

  const selectedCountry = () =>
    countryOptions().find((option) => option.value === countryFilter()) ??
    countryOptions()[0];

  /**
   * Index and name, with the country's flag beside it, are on screen at every width; the rest of the dog is added as the screen
   * grows. Every column is built sort-proof by {@link unsortable}, so the order on screen is always
   * the server's.
   */
  const columns = createMemo<ColumnDef<PublicDog, any>[]>(() => {
    const cols: ColumnDef<PublicDog, any>[] = [
      {
        id: "score",
        size: COLUMN_WIDTH.score,
        header: i18n.t("DOGS.INDEX.SCORE"),
        cell: (info) => <K9xScore rank={info.row.original.rank} compact />,
      },
      {
        id: "name",
        accessorKey: "name",
        header: i18n.t("DOGS.INDEX.NAME"),
        cell: (info) => (
          <div class="list-table__name">
            <CountryFlag
              country={info.row.original.country?.id}
              alt={info.row.original.country?.name}
            />
            <Link
              class="list-table__link"
              to="/dogs/$identification"
              params={{ identification: info.row.original.identification }}
              title={info.row.original.name}
            >
              {info.row.original.name}
            </Link>
          </div>
        ),
      },
    ];

    // Breed and sex describe the dog, the handler says who is behind it: with room for only one more
    // column, a tablet gets the handler.
    if (device() === "laptop") {
      cols.push(
        {
          id: "breed",
          size: COLUMN_WIDTH.breed,
          header: i18n.t("DOGS.INDEX.BREED"),
          cell: (info) => info.row.original.breed?.name ?? "",
        },
        {
          id: "sex",
          size: COLUMN_WIDTH.sex,
          header: i18n.t("DOGS.INDEX.SEX"),
          cell: (info) => <SexIcon sex={info.row.original.sex ?? undefined} />,
        },
      );
    }

    if (device() !== "mobile") {
      cols.push({
        id: "handler",
        size: COLUMN_WIDTH.handler,
        header: i18n.t("DOGS.INDEX.HANDLER"),
        cell: (info) => info.row.original.handler,
      });
    }

    return unsortable(cols);
  });

  const listContent = () => (
    <div ref={listFill.ref}>
      <VirtualCardGrid
        class="public-dogs"
        items={dogs()}
        height={listFill.height()}
        minColumnWidth={CARD_MIN_WIDTH_PX}
        rowHeight={
          device() === "mobile" ? MOBILE_CARD_HEIGHT_PX : CARD_HEIGHT_PX
        }
        endSpacing={FLOATING_PILL_CLEARANCE_PX}
        hasMore={hasMore()}
        isLoadingMore={isLoadingMore()}
        onLoadMore={loadMoreFrom(VIEW.LIST)}
        loadingMoreMessage={i18n.t("DOGS.INDEX.LOADING_MORE")}
      >
        {(dog) => (
          <PublicDogCard
            dog={dog}
            onSeeDetails={() =>
              void navigate({
                to: "/dogs/$identification",
                params: { identification: dog.identification },
              })
            }
          />
        )}
      </VirtualCardGrid>
    </div>
  );

  const tableContent = () => (
    <div
      class="public-dogs__table"
      ref={tableFill.ref}
      style={{ height: `${tableFill.height()}px` }}
    >
      <AtomTable<PublicDog>
        data={dogs()}
        columns={columns()}
        getRowId={(row) => row.identification}
        virtualized
        estimateRowHeight={TABLE_ROW_HEIGHT_PX}
        fixedLayout
        hasMore={hasMore()}
        isLoadingMore={isLoadingMore()}
        loadingMoreMessage={i18n.t("DOGS.INDEX.LOADING_MORE")}
        onLoadMore={loadMoreFrom(VIEW.TABLE)}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("DOGS.INDEX.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("DOGS.INDEX.TABLE"),
      content: tableContent,
    },
  ]);

  return (
    <Page>
      <PageSeo
        title={i18n.t("DOGS.INDEX.META_TITLE")}
        description={i18n.t("DOGS.INDEX.META_DESCRIPTION")}
      />
      <div class="public-dogs__filters">
        <NameFilter
          label={i18n.t("DOGS.INDEX.NAME_FILTER")}
          value={nameFilter()}
          onChange={setNameFilter}
        />
        <NameFilter
          label={i18n.t("DOGS.INDEX.HANDLER_FILTER")}
          value={handlerFilter()}
          onChange={setHandlerFilter}
        />
        <div class="country-filter">
          <AtomSelect
            label={i18n.t("COMMON.COUNTRY_FIELD.COUNTRY")}
            options={countryOptions()}
            value={selectedCountry()}
            onChange={(option) =>
              setCountryFilter(
                !option?.value || option.value === ALL_COUNTRIES
                  ? ""
                  : option.value,
              )
            }
          />
        </div>
      </div>

      {/* Dogs first: a background refetch must not pull the skeleton over a list that is already on
          screen. A later search keeps the previous results, so only the very first load has nothing to
          show and gets the skeleton. */}
      <Show
        when={dogs().length || isResolved()}
        fallback={
          <div class="public-dogs card-list">
            <CardListSkeleton count={6} />
          </div>
        }
      >
        <Show
          when={dogs().length}
          fallback={
            <p class="public-dogs__empty">{i18n.t("DOGS.INDEX.NO_DOGS")}</p>
          }
        >
          <AtomSegmentedControl
            title={i18n.t("DOGS.INDEX.VIEW_BY")}
            control={view()}
            onControlChange={setView}
            controls={controls()}
          />
        </Show>
      </Show>
    </Page>
  );
}
