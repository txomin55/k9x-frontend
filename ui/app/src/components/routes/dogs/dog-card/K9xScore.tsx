import { Show } from "solid-js";
import { NO_K9X_INDEX } from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

/**
 * A dog's K9X index. A dog that has never competed has no index at all, which is a different answer
 * from a low one, so it is shown as a dash instead of a number that would read as a bad score.
 */
export default function K9xScore(props: { rank: string; compact?: boolean }) {
  const i18n = useI18n();
  const hasIndex = () => props.rank !== NO_K9X_INDEX && !!props.rank;

  return (
    <span
      class={`k9x-score ${props.compact ? "k9x-score--compact" : ""}`.trim()}
      classList={{ "k9x-score--empty": !hasIndex() }}
      title={hasIndex() ? undefined : i18n.t("DOGS.INDEX.NO_INDEX_HINT")}
    >
      <Show when={hasIndex()} fallback={<span aria-hidden>—</span>}>
        {props.rank}
      </Show>
      <Show when={!hasIndex()}>
        <span class="k9x-score__sr-only">
          {i18n.t("DOGS.INDEX.NO_INDEX_HINT")}
        </span>
      </Show>
    </span>
  );
}
