import type { EventResponse } from "@/services/api/competition-crud/competitionCrud.types";
import { Show } from "solid-js";
import ConfigurationEditorForm
  from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/configuration/ConfigurationEditorForm";

export default function (props: {
  draft: EventResponse;
  event: EventResponse;
  isEditing: boolean;
  onDraftChange: (updater: (current: EventResponse) => EventResponse) => void;
}) {
  return (
    <section>
      <Show
        when={props.isEditing}
        fallback={
          <div>
            <p>{`--Id: ${props.event.configuration.id}`}</p>
            <p>{`--Name: ${props.event.configuration.name}`}</p>
            <p>{`--Federation: ${props.event.configuration.federation?.name ?? ""}`}</p>
          </div>
        }
      >
        <ConfigurationEditorForm
          draft={props.draft}
          onChange={(updater) =>
            props.onDraftChange((current) => updater(current) ?? current)
          }
        />
      </Show>
    </section>
  );
}
