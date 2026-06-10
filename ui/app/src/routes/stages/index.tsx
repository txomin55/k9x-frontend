import { createFileRoute } from "@tanstack/solid-router";
import { createEffect, createMemo, For, Suspense } from "solid-js";
import StageCard from "@/components/routes/stages/stage-card/StageCard";
import { useStages } from "@/services/fetch-stages/fetchStages";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useOffline } from "@/stores/network/network";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomTable from "@lib/components/atoms/table/AtomTable";
import type { ColumnDef } from "@lib/components/atoms/table/AtomTable.types";
import StagesMap from "@/components/routes/stages/stages-map/StagesMap";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useI18n } from "@/stores/i18n/i18n";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "./styles.css";

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

  const fetchedStages = useStages({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const sortedStages = createMemo(
    () =>
      fetchedStages.data?.toSorted(
        (left, right) => (left.dateFrom ?? 0) - (right.dateFrom ?? 0),
      ) ?? [],
  );

  const renderStageCard = (stage: StageSummaryResponseDTO) => (
    <StageCard
      id={stage.id}
      country={stage.country ?? ""}
      name={stage.name}
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
      accessorKey: "name",
      header: i18n.t("STAGES.INDEX.NAME"),
      cell: (info) => info.getValue<string>(),
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
      content: <StagesMap stages={fetchedStages.data ?? []} />,
    },
  ]);

  const [controlValue, setControlValue] = useSearchParam(
    "view",
    CONTROLS_KEYS.LIST,
  );
  const [stageParam] = useSearchParam("stage", "");

  createEffect(() => {
    if (isOffline()) {
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
