import { Show } from "solid-js";
import type { JSX, ParentProps } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";

export default function TranslationsGate(
  props: ParentProps<{ fallback?: JSX.Element }>,
) {
  const i18n = useI18n();

  return (
    <Show
      when={i18n.ready() && i18n.translationsLoaded()}
      fallback={props.fallback ?? null}
    >
      {props.children}
    </Show>
  );
}
