import { useLocation, useNavigate } from "@tanstack/solid-router";
import { For, onMount, Suspense } from "solid-js";
import { AppRoutePath } from "@/components/router/paths";
import StageCard from "@/components/routes/index/stage_card/StageCard";
import { useStages } from "@/services/fetch_stages/fetchStages";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedStages = useStages({
    staleTime: 30 * 1000,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

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
      <Suspense fallback={<span>--Loading stages</span>}>
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
      </Suspense>
    </div>
  );
}
