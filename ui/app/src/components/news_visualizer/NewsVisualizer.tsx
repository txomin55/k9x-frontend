import "@/components/news_visualizer/news-visualizer.css";
import { For, Show } from "solid-js";
import { auth } from "@/stores/auth";
import { showNotification } from "@/utils/notifications/notifications";

export default function NewsVisualizer() {
  const updateNotes = () => auth().user?.getNews?.() ?? ["1", "2"];
  const showUpdateNotes = () => updateNotes().length > 0;

  return (
    <div class="Container">
      <div class="Toast2">
        <button class="ToastButton" onClick={showNotification}>
          txomins
        </button>
      </div>

      <Show when={showUpdateNotes()}>
        <div class="Toast">
          <div class="ToastMessage">
            <For each={updateNotes()}>{(note) => <div>{note}</div>}</For>
          </div>
        </div>
      </Show>
    </div>
  );
}
