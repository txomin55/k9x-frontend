import type { EventDetailResponseDTO, EventEditorDraft } from "@/services/secured/event-crud/eventCrud.types";
import { Show } from "solid-js";
import ConfigurationEditorForm
  from "@/components/routes/my/competitions/$id/stages/$stageid/events/$eventId/obdx/configuration/ConfigurationEditorForm";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useI18n } from "@/stores/i18n/i18n";
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
      <span class="text-heading-sm" role="heading" aria-level={3}>
        {i18n.t("MY.COMPETITIONS.EVENT_CONFIGURATION.CONFIGURATION")}
      </span>
      <div class="event-configuration-section__content">
        <Show
          when={props.isEditing}
          fallback={
            <>
              <div class="event-configuration-section__content--federation">
                <Show when={props.event.configuration.federation?.country}>
                  {(country) => (
                    <CountryFlag
                      country={country()}
                      alt={`${country()} flag`}
                    />
                  )}
                </Show>
                <Show when={props.event.configuration.federation?.name}>
                  {(name) => <span class="text-caption-md">{name()}</span>}
                </Show>
              </div>
              <span class="text-caption-sm">{`${props.event.configuration.name}`}</span>
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
