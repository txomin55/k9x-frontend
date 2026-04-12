import type { EventResponse } from "@/services/api/competition-crud/competitionCrud.types";
import { Setter, Show } from "solid-js";
import AtomInput from "@lib/components/atoms/input/AtomInput";

export default function (props: {
  isEditing: boolean;
  event: EventResponse;
  onBlur: () => void;
  name: string;
  onNameChange: Setter<string>;
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
