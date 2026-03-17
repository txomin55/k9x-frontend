import "@/components/news_visualizer/index.css";
import { For, Show } from "solid-js";
import { auth } from "@/stores/auth";
import { showNotification } from "@/utils/notifications/notifications";

export default function NewsVisualizer() {
  const updateNotes = () => auth().user?.getNews?.() ?? ["1", "2"];
  const showUpdateNotes = () => updateNotes().length > 0;

  return (
    <div class="news-visualizer">
      <div class="news-visualizer__toast-trigger">
        <button
          class="news-visualizer__toast-button"
          onClick={showNotification}
        >
          txomins
        </button>
      </div>

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
