import { For, Show } from "solid-js";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import type { TagListProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/TagList.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function TagList(props: TagListProps) {
  return (
    <Show when={props.tags.length > 0}>
      <div class="obdx-clf__tags">
        <For each={props.tags}>
          {(tag) => <AtomBadge textValue={tag}>{tag}</AtomBadge>}
        </For>
      </div>
    </Show>
  );
}
