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
import { useOffline } from "@/stores/network";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import StagesMap from "@/components/routes/stages/stages-map/StagesMap";
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

  const fetchedStages = useStages({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const sortedStages = createMemo(() =>
    fetchedStages.data?.toSorted(
      (left, right) => left.dateFrom - right.dateFrom,
    ),
  );

  const controls = createMemo(() => [
    {
      value: CONTROLS_KEYS.LIST,
      text: "--List",
      content: (
        <For each={sortedStages()}>
          {(stage) => (
            <StageCard
              id={stage.id}
              country={stage.country}
              name={stage.name}
              from={stage.dateFrom}
              to={stage.dateTo}
              description={stage.description}
              address={stage?.location?.address}
              events={stage.events}
            />
          )}
        </For>
      ),
    },
    {
      value: CONTROLS_KEYS.MAP,
      text: "--Map",
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
      <Suspense fallback={<span>--Loading stages</span>}>
        <AtomSegmentedControl
          title="--Stages by"
          control={controlValue()}
          onControlChange={setControlValue}
          controls={controls()}
        />
      </Suspense>
    </div>
  );
}
