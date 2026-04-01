import { Show } from "solid-js";
import type { EventResponse } from "@/services/api/event_api_crud/eventApiCrud";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

type EventOverviewProps = {
  configurationFederation: string;
  configurationName: string;
  configurationVersion: string;
  discipline: string;
  displayEvent: EventResponse;
  isEditing: boolean;
  name: string;
  onConfigurationFederationChange: (value: string) => void;
  onConfigurationNameChange: (value: string) => void;
  onConfigurationVersionChange: (value: string) => void;
  onDisciplineChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  status: string;
};

export default function EventOverview(props: EventOverviewProps) {
  return (
    <div>
      <header>
        <Show
          when={props.isEditing}
          fallback={
            <>
              <h1>{props.displayEvent.name}</h1>
              <p>{`--Discipline: ${props.displayEvent.discipline || "--No discipline"}`}</p>
              <p>{`--Participants: ${props.displayEvent.competitors.length}`}</p>
              <p>{`--Status: ${props.displayEvent.status || "--No status"}`}</p>
            </>
          }
        >
          <AtomInput
            label="--Event title"
            value={props.name}
            onChange={props.onNameChange}
          />
          <AtomInput
            label="--Discipline"
            value={props.discipline}
            onChange={props.onDisciplineChange}
          />
          <AtomInput
            label="--Status"
            value={props.status}
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
              <p>{`--Name: ${props.displayEvent.configuration.name || "--No name"}`}</p>
              <p>{`--Version: ${props.displayEvent.configuration.version}`}</p>
              <p>{`--Federation: ${props.displayEvent.configuration.federation || "--No federation"}`}</p>
            </>
          }
        >
          <AtomInput
            label="--Configuration name"
            value={props.configurationName}
            onChange={props.onConfigurationNameChange}
          />
          <AtomNumberInput
            label="--Version"
            value={props.configurationVersion}
            onChange={props.onConfigurationVersionChange}
          />
          <AtomInput
            label="--Federation"
            value={props.configurationFederation}
            onChange={props.onConfigurationFederationChange}
          />
        </Show>
      </section>
    </div>
  );
}
