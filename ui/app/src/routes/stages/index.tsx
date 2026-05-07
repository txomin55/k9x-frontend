import { createFileRoute } from "@tanstack/solid-router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Suspense,
} from "solid-js";
import StageCard from "@/components/routes/stages/stage-card/StageCard";
import { useStages } from "@/services/fetch-stages/fetchStages";
import { useOffline } from "@/stores/network/network";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import StagesMap from "@/components/routes/stages/stages-map/StagesMap";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

export const Route = createFileRoute("/stages/")({
  component: StagesIndexPage,
});

const CONTROLS_KEYS = {
  LIST: "LIST",
  MAP: "MAP",
};

function StagesIndexPage() {
  const { isOffline } = useOffline();
  const i18n = useI18n();

  const fetchedStages = useStages({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const sortedStages = createMemo(() =>
    fetchedStages.data?.toSorted(
      (left, right) => (left.dateFrom ?? 0) - (right.dateFrom ?? 0),
    ),
  );

  const controls = createMemo(() => [
    {
      value: CONTROLS_KEYS.LIST,
      text: i18n.t("STAGES.INDEX.LIST"),
      content: (
        <For each={sortedStages()}>
          {(stage) => (
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
          )}
        </For>
      ),
    },
    {
      value: CONTROLS_KEYS.MAP,
      text: i18n.t("STAGES.INDEX.MAP"),
      disabled: isOffline(),
      content: <StagesMap stages={fetchedStages.data} />,
    },
  ]);

  const [controlValue, setControlValue] = createSignal(CONTROLS_KEYS.LIST);

  createEffect(() => {
    if (isOffline()) {
      setControlValue(CONTROLS_KEYS.LIST);
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
