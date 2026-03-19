import "@/components/news_visualizer/index.css";
import { For, Show } from "solid-js";
import { useAuthUser } from "@/stores/auth";
import { displayNotification } from "@/utils/notifications/notifications";
import mockedNotification from "@/utils/service_worker/native_features/notifications/mockedNotification";

export default function NewsVisualizer() {
  const user = useAuthUser();
  const updateNotes = () => user()?.getNews() ?? ["1", "2"];
  const showUpdateNotes = () => updateNotes().length > 0;

  return (
    <div class="news-visualizer">
      <div class="news-visualizer__toast-trigger">
        <button
          class="news-visualizer__toast-button"
          onClick={() => displayNotification(mockedNotification)}
        >
          --txomins
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
