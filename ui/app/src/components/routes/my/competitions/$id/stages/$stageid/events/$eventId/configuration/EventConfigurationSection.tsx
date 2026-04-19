import type { EventDetail, EventEditorDraft } from "@/services/api/event-crud/eventCrud.types";
import { Show } from "solid-js";
import ConfigurationEditorForm
  from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/configuration/ConfigurationEditorForm";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import "./styles.css";

export default function (props: {
  draft: EventEditorDraft;
  event: EventDetail;
  isEditing: boolean;
  onDraftChange: (
    updater: (current: EventEditorDraft) => EventEditorDraft,
  ) => void;
}) {
  return (
    <section class="event-configuration-section">
      <h3>--Configuration</h3>
      <div class="event-configuration-section__content">
        <Show
          when={props.isEditing}
          fallback={
            <>
              <span>{`--Id: ${props.event.configuration.id}`}</span>
              <span>{`--Name: ${props.event.configuration.name}`}</span>
              <div class="event-configuration-section__content--federation">
                <span>--Federation:</span>
                <Show when={props.event.configuration.federation?.country}>
                  {(country) => (
                    <CountryFlag
                      country={country()}
                      alt={`${country()} flag`}
                    />
                  )}
                </Show>
                <Show when={props.event.configuration.federation?.name}>
                  {(name) => <span>{name()}</span>}
                </Show>
              </div>
            </>
          }
        >
          <ConfigurationEditorForm
            draft={props.draft}
            onChange={(updater) =>
              props.onDraftChange((current) => updater(current) ?? current)
            }
          />
        </Show>
      </div>
    </section>
  );
}
