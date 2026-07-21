import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomTable, { type ColumnDef } from "@lib/components/atoms/table/AtomTable";
import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import type { ParentProps } from "solid-js";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Suspense,
  Switch,
  useContext
} from "solid-js";
import PageSeo from "@/components/common/page-seo/PageSeo";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import StageCard from "@/components/routes/stages/stage-card/StageCard";
import StageCardSkeleton from "@/components/routes/stages/stage-card/StageCardSkeleton";
import StageCardEventsContent from "@/components/routes/stages/stage-card/StageCardEventsContent";
import StagesFilters from "@/components/routes/stages/stages-filters/StagesFilters";
import StagesMap from "@/components/routes/stages/stages-map/StagesMap";
import { useStages } from "@/services/fetch-stages/fetchStages";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { enrollStageEvent } from "@/services/fetch-stages/stageEnroll";
import { useOwnedDogs } from "@/services/secured/dog-crud/dogCrud";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { useOffline } from "@/stores/network/network";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { isStageLive } from "@/utils/stage";
import {
  defaultStagesDateRange,
  formatUtcDateOnly,
  parseDateInputValue,
} from "@/utils/date";
import { isOffline as isOfflinePolicy } from "@/utils/local-first/localFirstPolicy";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import { AtomCombobox } from "@lib/components/atoms/combobox/AtomCombobox";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect";
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

const SKELETON_ROWS = Array.from(
  { length: 3 },
  () => ({}) as StageSummaryResponseDTO,
);

type EnrollDraft = {
  dogId: string;
  bih: boolean;
};

const createEmptyEnrollDraft = (): EnrollDraft => ({
  dogId: "",
  bih: false,
});

type EnrollHandler = (stageId: string, eventId: string) => void;

type StagesQuery = ReturnType<typeof useStages>;

const StagesDataContext = createContext<StagesQuery>();

function StagesDataProvider(props: ParentProps) {
  const { isOffline } = useOffline();

  const [dateFromFilter] = useSearchParam("from", "");
  const [dateToFilter] = useSearchParam("to", "");
  const defaultRange = defaultStagesDateRange();
  const fromMs = () => parseDateInputValue(dateFromFilter(), defaultRange.from);
  const toMs = () => parseDateInputValue(dateToFilter(), defaultRange.to);

  const query = useStages(fromMs, toMs, {
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });

  return (
    <StagesDataContext.Provider value={query}>
      {props.children}
    </StagesDataContext.Provider>
  );
}

function useStagesQuery(): StagesQuery {
  const query = useContext(StagesDataContext);
  if (!query) {
    throw new Error("useStagesQuery must be used within StagesDataProvider");
  }
  return query;
}

function useFilteredStages() {
  const user = useAuthUser();
  const isLoggedIn = () => !!user();

  const fetchedStages = useStagesQuery();

  const [nameFilter] = useSearchParam("name", "");
  const [countryFilter] = useSearchParam("country", "");
  const [statusFilter] = useSearchParam("status", "");
  const [dateFromFilter] = useSearchParam("from", "");
  const [dateToFilter] = useSearchParam("to", "");

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

  return { filteredStages, isPending: () => fetchedStages.isPending };
}

function StagesFiltersConnected(props: {
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
}) {
  const fetchedStages = useStagesQuery();

  const availableCountries = createMemo(() => {
    const stages = fetchedStages.data ?? [];
    return [
      ...new Set(
        stages
          .map((stage) => (stage.country ?? "").toLowerCase())
          .filter(Boolean),
      ),
    ];
  });

  return (
    <StagesFilters
      name={props.name}
      country={props.country}
      status={props.status}
      dateFrom={props.dateFrom}
      dateTo={props.dateTo}
      availableCountries={availableCountries()}
      onNameChange={props.onNameChange}
      onCountryChange={props.onCountryChange}
      onStatusChange={props.onStatusChange}
      onDateFromChange={props.onDateFromChange}
      onDateToChange={props.onDateToChange}
    />
  );
}

function StagesListView(props: { onEnroll: EnrollHandler }) {
  const i18n = useI18n();
  const user = useAuthUser();
  const { filteredStages } = useFilteredStages();

  return (
    <Show
      when={!(!!user() && filteredStages().length === 0)}
      fallback={<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>}
    >
      <div class="card-list">
        <For each={filteredStages()}>
          {(stage) => (
            <StageCard
              id={stage.id}
              country={stage.country ?? ""}
              name={stage.name}
              status={stage.status}
              from={stage.dateFrom ?? 0}
              to={stage.dateTo ?? 0}
              competitionName={stage.competitionName ?? ""}
              organizer={stage.organizer}
              address={stage?.location?.address}
              events={stage.events ?? []}
              onEnroll={(eventId) => props.onEnroll(stage.id, eventId)}
            />
          )}
        </For>
      </div>
    </Show>
  );
}

function StagesTableView(props: { onEnroll: EnrollHandler }) {
  const i18n = useI18n();
  const { filteredStages } = useFilteredStages();

  const columns = createMemo<ColumnDef<StageSummaryResponseDTO>[]>(() => [
    {
      accessorKey: "country",
      header: i18n.t("STAGES.INDEX.COUNTRY"),
      enableSorting: false,
      cell: (info) => <CountryFlag country={info.getValue<string>()} />,
    },
    {
      id: "name_status",
      accessorFn: (stage) => stage,
      header: i18n.t("STAGES.INDEX.NAME"),
      cell: (info) => {
        const stage = info.getValue<StageSummaryResponseDTO>();
        return (
          <div class="stages-table__name-cell">
            <div class="stages-table__name-row">
              <span class="text-heading-xs">{stage.name}</span>
              <Show when={stage.status && isStageLive(stage.status)}>
                <StatusBadge status={stage.status!} dotMode />
              </Show>
            </div>
            <Show when={stage.competitionName}>
              <span class="stages-table__name-caption text-caption-md">
                {stage.competitionName}
              </span>
            </Show>
          </div>
        );
      },
    },
    {
      id: "dateFrom",
      accessorFn: (stage) => stage.dateFrom ?? 0,
      header: i18n.t("STAGES.INDEX.DATE_FROM"),
      cell: (info) => (
        <span class="text-caption-md">
          {formatUtcDateOnly(info.getValue<number>())}
        </span>
      ),
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

  return (
    <div class="stages-table">
      <AtomTable<StageSummaryResponseDTO>
        data={filteredStages()}
        columns={columns()}
        getRowCanExpand={() => true}
        expandOnRowClick
        renderSubComponent={(row) => (
          <StageCardEventsContent
            id={row.original.id}
            events={row.original.events ?? []}
            onEnroll={(eventId) => props.onEnroll(row.original.id, eventId)}
          />
        )}
      />
    </div>
  );
}

function StagesTableSkeleton() {
  const i18n = useI18n();

  const skeletonColumns = createMemo<ColumnDef<StageSummaryResponseDTO>[]>(
    () => [
      {
        id: "country",
        header: i18n.t("STAGES.INDEX.COUNTRY"),
        enableSorting: false,
        cell: () => (
          <AtomSkeleton
            variant="rectangular"
            width="var(--unit-6)"
            height="var(--unit-4)"
            radius="var(--radius-sm)"
          />
        ),
      },
      {
        id: "name_status",
        header: i18n.t("STAGES.INDEX.NAME"),
        enableSorting: false,
        cell: () => <AtomSkeleton width="70%" />,
      },
      {
        id: "dateFrom",
        header: i18n.t("STAGES.INDEX.DATE_FROM"),
        enableSorting: false,
        cell: () => <AtomSkeleton width="4rem" />,
      },
      {
        id: "expander",
        header: () => null,
        enableSorting: false,
        cell: () => null,
      },
    ],
  );

  return (
    <div class="stages-table">
      <AtomTable<StageSummaryResponseDTO>
        data={SKELETON_ROWS}
        columns={skeletonColumns()}
        getRowCanExpand={() => false}
      />
    </div>
  );
}

function StagesMapSkeleton() {
  return (
    <div class="stages-map-wrapper">
      <AtomSkeleton
        variant="rectangular"
        width="100%"
        height="100%"
        radius="var(--radius-sm)"
      />
    </div>
  );
}

function StagesMapView(props: { onEnroll: EnrollHandler }) {
  const { filteredStages } = useFilteredStages();

  return (
    <div class="stages-map-wrapper">
      <StagesMap stages={filteredStages()} onEnroll={props.onEnroll} />
    </div>
  );
}

function EnrollDialog(props: {
  stageId: string;
  eventId: string;
  onClose: () => void;
}) {
  const i18n = useI18n();
  const navigate = useNavigate();

  const fetchedStages = useStagesQuery();
  const dogsQuery = useOwnedDogs({
    refetchOnMount: !isOfflinePolicy(),
    gcTime: 5 * 60 * 1000,
  });

  const dogOptions = createMemo<AtomSelectOption[]>(() =>
    (dogsQuery.data ?? []).map((dog) => ({
      label: dog.handler ? `${dog.name} (${dog.handler})` : dog.name,
      value: dog.id,
    })),
  );

  const eventName = createMemo(
    () =>
      (fetchedStages.data ?? [])
        .find((stage) => String(stage.id) === String(props.stageId))
        ?.events.find((event) => String(event.id) === String(props.eventId))
        ?.name ?? "",
  );

  const [enrollDraft, setEnrollDraft] = createSignal<EnrollDraft>(
    createEmptyEnrollDraft(),
  );

  const updateEnrollDraft = (updater: (current: EnrollDraft) => EnrollDraft) =>
    setEnrollDraft((current) => updater(current));

  const selectedDog = (dogId: string) =>
    (dogsQuery.data ?? []).find((dog) => dog.id === dogId);

  const handleEnroll = async () => {
    await enrollStageEvent(props.stageId, {
      ...enrollDraft(),
      eventId: props.eventId,
    });

    props.onClose();
  };

  return (
    <AtomDialog
      closeButtonText={i18n.t("STAGES.INFO.CLOSE_DIALOG")}
      content={
        <div class="stage-info__enroll-form">
          <AtomCombobox
            label={i18n.t("STAGES.INFO.DOG")}
            onChange={(option) =>
              updateEnrollDraft((current) => ({
                ...current,
                dogId: option?.value ?? "",
              }))
            }
            options={dogOptions()}
            placeholder={i18n.t("STAGES.INFO.SELECT_A_DOG")}
            value={
              dogOptions().find(
                (option) => option.value === enrollDraft().dogId,
              ) ?? null
            }
          >
            <Show when={dogOptions().length === 0}>
              <AtomButton
                type={BUTTON_TYPES.GHOST}
                onClick={() => navigate({ to: "/my/dogs" })}
              >
                {i18n.t("STAGES.INFO.CREATE_DOG")}
              </AtomButton>
            </Show>
          </AtomCombobox>

          <Show
            when={
              selectedDog(enrollDraft().dogId) &&
              selectedDog(enrollDraft().dogId)?.sex !== "MALE"
            }
          >
            <AtomCheckbox
              label={i18n.t("STAGES.INFO.BIH")}
              checked={enrollDraft().bih}
              setChecked={(value) =>
                updateEnrollDraft((current) => ({
                  ...current,
                  bih: value,
                }))
              }
            />
          </Show>

          <div class="stage-info__enroll-form-actions">
            <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onClose}>
              {i18n.t("STAGES.INFO.CANCEL")}
            </AtomButton>
            <AtomButton onClick={handleEnroll}>
              {i18n.t("STAGES.INFO.ENROLL")}
            </AtomButton>
          </div>
        </div>
      }
      onOpenChange={(open) => {
        if (!open) {
          props.onClose();
        }
      }}
      open
      title={`${i18n.t("STAGES.INFO.ENROLL_IN")} ${eventName()}`}
    />
  );
}

function StagesIndexPage() {
  const { isOffline } = useOffline();
  const i18n = useI18n();
  const user = useAuthUser();
  const isLoggedIn = () => !!user();

  const [selectedStageId, setSelectedStageId] = useSearchParam(
    "enrollStage",
    "",
    "push",
  );
  const [selectedEventId, setSelectedEventId] = useSearchParam(
    "enroll",
    "",
    "push",
  );
  const enrollDialogOpen = () => !!selectedStageId() && !!selectedEventId();

  const openEnrollDialog: EnrollHandler = (stageId, eventId) => {
    setSelectedStageId(stageId);
    setSelectedEventId(eventId);
  };

  const closeEnrollDialog = () => {
    setSelectedStageId("");
    setSelectedEventId("");
  };

  const [nameFilter, setNameFilter] = useSearchParam("name", "");
  const [countryFilter, setCountryFilter] = useSearchParam("country", "");
  const [statusFilter, setStatusFilter] = useSearchParam("status", "");
  const [dateFromFilter, setDateFromFilter] = useSearchParam("from", "");
  const [dateToFilter, setDateToFilter] = useSearchParam("to", "");

  const controls = createMemo(() => [
    {
      value: CONTROLS_KEYS.LIST,
      text: i18n.t("STAGES.INDEX.LIST"),
      content: null,
    },
    {
      value: CONTROLS_KEYS.TABLE,
      text: i18n.t("STAGES.INDEX.TABLE"),
      content: null,
    },
    {
      value: CONTROLS_KEYS.MAP,
      text: i18n.t("STAGES.INDEX.MAP"),
      disabled: isOffline(),
      content: null,
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
    <StagesDataProvider>
      <div class="stages">
        <PageSeo
          title={i18n.t("STAGES.INDEX.META_TITLE")}
          description={i18n.t("STAGES.INDEX.META_DESCRIPTION")}
        />
        <Show when={isLoggedIn()}>
          <StagesFiltersConnected
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
        </Show>
        <AtomSegmentedControl
          title={i18n.t("STAGES.INDEX.STAGES_BY")}
          control={controlValue()}
          onControlChange={setControlValue}
          controls={controls()}
        />
        <Switch>
          <Match when={controlValue() === CONTROLS_KEYS.TABLE}>
            <Suspense fallback={<StagesTableSkeleton />}>
              <StagesTableView onEnroll={openEnrollDialog} />
            </Suspense>
          </Match>
          <Match when={controlValue() === CONTROLS_KEYS.MAP}>
            <Suspense fallback={<StagesMapSkeleton />}>
              <StagesMapView onEnroll={openEnrollDialog} />
            </Suspense>
          </Match>
          <Match when={true}>
            <Suspense
              fallback={
                <div class="card-list">
                  <StageCardSkeleton count={3} />
                </div>
              }
            >
              <StagesListView onEnroll={openEnrollDialog} />
            </Suspense>
          </Match>
        </Switch>
        <Show when={enrollDialogOpen()}>
          <EnrollDialog
            stageId={selectedStageId()}
            eventId={selectedEventId()}
            onClose={closeEnrollDialog}
          />
        </Show>
      </div>
    </StagesDataProvider>
  );
}
