import { useLocation, useNavigate } from "@tanstack/solid-router";
import { createEffect, Index, Show } from "solid-js";
import { useDogs } from "@/services/fetch_dogs/fetchDogs";
import { AppRoutePath } from "@/components/router/paths";
import StageCard from "@/components/routes/index/stage_card/StageCard";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export default function IndexRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const fetchedDogs = useDogs({
    staleTime: 30 * 1000,
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  createEffect(async () => {
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
    <div class="Landing">
      <Show when={fetchedDogs.data}>
        <Index each={fetchedDogs.data}>{() => <StageCard />}</Index>
      </Show>
    </div>
  );
}
