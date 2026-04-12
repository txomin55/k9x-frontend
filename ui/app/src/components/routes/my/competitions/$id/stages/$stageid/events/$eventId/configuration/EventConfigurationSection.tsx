import type { EventResponse } from "@/services/api/competition-crud/competitionCrud.types";
import { Show } from "solid-js";
import ConfigurationEditorForm
  from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/configuration/ConfigurationEditorForm";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import "./styles.css";

export default function (props: {
  draft: EventResponse;
  event: EventResponse;
  isEditing: boolean;
  onDraftChange: (updater: (current: EventResponse) => EventResponse) => void;
}) {
  return (
    <section class="event-configuration-section">
      <Show
        when={props.isEditing}
        fallback={
          <div>
            <p>{`--Id: ${props.event.configuration.id}`}</p>
            <p>{`--Name: ${props.event.configuration.name}`}</p>
            <div class="event-configuration-section__federation">
              <span>--Federation:</span>
              <Show when={props.event.configuration.federation?.country}>
                {(country) => (
                  <CountryFlag country={country()} alt={`${country()} flag`} />
                )}
              </Show>
              <Show when={props.event.configuration.federation?.name}>
                {(name) => <span>{name()}</span>}
              </Show>
            </div>
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
