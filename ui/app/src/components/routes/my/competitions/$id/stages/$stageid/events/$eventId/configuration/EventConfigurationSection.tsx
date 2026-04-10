import type { EventResponse } from "@/services/api/competition-crud/competitionCrud.types";
import { Setter, Show } from "solid-js";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

export default function (props: {
  isEditing: boolean;
  event: EventResponse;
  onBlur: () => void;
  name: string;
  onNameChange: Setter<string>;
  version: string;
  onVersionChange: Setter<string>;
  federation: string;
  onFederationChange: Setter<string>;
}) {
  return (
    <section>
      <Show
        when={props.isEditing}
        fallback={
          <div>
            <p>{`--Name: ${props.event.configuration.name}`}</p>
            <p>{`--Version: ${props.event.configuration.version}`}</p>
            <p>{`--Federation: ${props.event.configuration.federation}`}</p>
          </div>
        }
      >
        <div>
          <AtomInput
            label="--Configuration name"
            onBlur={props.onBlur}
            value={props.name}
            onChange={props.onNameChange}
          />
          <AtomNumberInput
            label="--Version"
            onBlur={props.onBlur}
            value={props.version}
            onChange={props.onVersionChange}
          />
          <AtomInput
            label="--Federation"
            onBlur={props.onBlur}
            value={props.federation}
            onChange={props.onFederationChange}
          />
        </div>
      </Show>
    </section>
  );
}
