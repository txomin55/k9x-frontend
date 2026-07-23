import type {EventDetailResponseDTO, EventEditorDraft,} from "@/services/secured/event-crud/eventCrud.types";
import {Show} from "solid-js";
import ConfigurationEditorForm
  from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm";
import FederationIcon from "@/components/common/federation-icon/FederationIcon";
import {useI18n} from "@/stores/i18n/i18n";
import "./styles.css";

export default function (props: {
  draft: EventEditorDraft;
  event: EventDetailResponseDTO;
  isEditing: boolean;
  onDraftChange: (
    updater: (current: EventEditorDraft) => EventEditorDraft,
  ) => void;
}) {
  const i18n = useI18n();
  return (
    <section class="event-configuration-section">
      <div class="event-configuration-section__content">
        <Show
          when={props.isEditing}
          fallback={
            <>
              <span class="text-caption-md">
                {i18n.t("MY.COMPETITIONS.EVENT_CONFIGURATION.CONFIGURATION")}
              </span>
              <div>
                <span class="text-caption-lg">{`${props.event.configuration.name}`}</span>
                <div class="event-configuration-section__content--federation">
                  <Show when={props.event.configuration.federation}>
                    {(federation) => (
                      <span class="text-caption-lg">
                        {federation().name ? federation().name : "-"}
                      </span>
                    )}
                  </Show>
                  <Show when={props.event.configuration.federation?.id}>
                    {(id) => (
                      <FederationIcon
                        federation={id()}
                        alt={`${id()} icon`}
                      />
                    )}
                  </Show>
                </div>
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
