import { For, Show } from "solid-js";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export type TagListProps = {
  tags: string[];
};

export default function TagList(props: TagListProps) {
  return (
    <Show when={props.tags.length > 0}>
      <div class="obdx-clf__tags">
        <For each={props.tags}>
          {(tag) => (
            <AtomBadge textValue={tag} colorByLabel>
              {tag}
            </AtomBadge>
          )}
        </For>
      </div>
    </Show>
  );
}
