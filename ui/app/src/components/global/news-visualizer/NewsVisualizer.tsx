import "@/components/global/news-visualizer/index.css";
import { For, Show } from "solid-js";
import { useAuthUser } from "@/stores/auth";

export default function NewsVisualizer() {
  const user = useAuthUser();
  const updateNotes = () => user()?.news ?? [];
  const showUpdateNotes = () => updateNotes().length > 0;

  return (
    <div class="news-visualizer">
      <Show when={showUpdateNotes()}>
        <div class="news-visualizer__toast">
          <div class="news-visualizer__toast--message">
            <For each={updateNotes()}>{(note) => <div>{note}</div>}</For>
          </div>
        </div>
      </Show>
    </div>
  );
}
