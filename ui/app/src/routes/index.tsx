import { createFileRoute, useLocation, useNavigate } from "@tanstack/solid-router";
import { createSignal, For, Match, onMount, Suspense, Switch } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import StageCard from "@/components/routes/index/stage_card/StageCard";
import { useStages } from "@/services/fetch-stages/fetchStages";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export const Route = createFileRoute("/")({
  component: IndexRoutePage,
});

const CONTROLS_KEYS = {
  LIST: "LIST",
  MAP: "MAP",
};

const CONTROLS = [
  {
    value: CONTROLS_KEYS.LIST,
    text: "--List",
  },
  {
    value: CONTROLS_KEYS.MAP,
    text: "--Map",
  },
];

function IndexRoutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedStages = useStages({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const [control, setControl] = createSignal(CONTROLS_KEYS.LIST);

  onMount(async () => {
    const search = location().searchStr;
    if (!search) return;

    const params = new URLSearchParams(search);
    if (params.get("code")) {
      globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
      await navigate({
        to: AppRoutePath.AUTH_CALLBACK as never,
        replace: true,
      });
    }
  });

  return (
    <div class="home">
      <AtomSegmentedControl
        title="--Stages by"
        defaultValue={CONTROLS_KEYS.LIST}
        controls={CONTROLS}
        onControlChange={setControl}
      />

      <Suspense fallback={<span>--Loading stages</span>}>
        <Switch>
          <Match when={control() === CONTROLS_KEYS.LIST}>
            <For each={fetchedStages.data}>
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
          </Match>
          <Match when={control() === CONTROLS_KEYS.MAP}>
            <p>--MAP MODE</p>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}
