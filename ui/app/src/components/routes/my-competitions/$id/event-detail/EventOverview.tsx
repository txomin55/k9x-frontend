import { Show } from "solid-js";
import type { EventResponse } from "@/services/api/event_api_crud/eventApiCrud";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

type EventOverviewProps = {
  draftEvent: EventResponse;
  isEditing: boolean;
  onConfigurationFederationChange: (value: string) => void;
  onConfigurationNameChange: (value: string) => void;
  onConfigurationVersionChange: (value: string) => void;
  onDisciplineChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export default function EventOverview(props: EventOverviewProps) {
  return (
    <div>
      <header>
        <Show
          when={props.isEditing}
          fallback={
            <>
              <h1>{props.draftEvent.name}</h1>
              <p>{`--Discipline: ${props.draftEvent.discipline || "--No discipline"}`}</p>
              <p>{`--Participants: ${props.draftEvent.competitors.length}`}</p>
              <p>{`--Status: ${props.draftEvent.status || "--No status"}`}</p>
            </>
          }
        >
          <AtomInput
            label="--Event title"
            value={props.draftEvent.name}
            onChange={props.onNameChange}
          />
          <AtomInput
            label="--Discipline"
            value={props.draftEvent.discipline}
            onChange={props.onDisciplineChange}
          />
          <AtomInput
            label="--Status"
            value={props.draftEvent.status}
            onChange={props.onStatusChange}
          />
        </Show>
      </header>

      <section>
        <h2>--Configuration</h2>
        <Show
          when={props.isEditing}
          fallback={
            <>
              <p>{`--Name: ${props.draftEvent.configuration.name || "--No name"}`}</p>
              <p>{`--Version: ${props.draftEvent.configuration.version}`}</p>
              <p>{`--Federation: ${props.draftEvent.configuration.federation || "--No federation"}`}</p>
            </>
          }
        >
          <AtomInput
            label="--Configuration name"
            value={props.draftEvent.configuration.name}
            onChange={props.onConfigurationNameChange}
          />
          <AtomNumberInput
            label="--Version"
            value={props.draftEvent.configuration.version}
            onChange={props.onConfigurationVersionChange}
          />
          <AtomInput
            label="--Federation"
            value={props.draftEvent.configuration.federation}
            onChange={props.onConfigurationFederationChange}
          />
        </Show>
      </section>
    </div>
  );
}
