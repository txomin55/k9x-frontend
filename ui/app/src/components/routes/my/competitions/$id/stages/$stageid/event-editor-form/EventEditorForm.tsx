import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { type EventResponse } from "@/services/api/event-api-crud/eventApiCrud";
import EventDisciplineField from "@/components/routes/my/competitions/$id/stages/$stageid/event-editor-form/EventDisciplineField";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import "./styles.css";

type EventEditorFormProps = {
  draft: EventResponse;
  onCancel: () => void;
  onChange: (
    updater: (current: EventResponse | null) => EventResponse | null,
  ) => void;
  onSave: () => void;
  isCreate?: boolean;
};

export default function EventEditorForm(props: EventEditorFormProps) {
  const handleNameChange = (value: string) =>
    props.onChange((current) =>
      current
        ? {
            ...current,
            name: value,
          }
        : current,
    );

  const updateDiscipline = (option: AtomSelectOption) => {
    props.onChange((current) =>
      current
        ? current.discipline === option.value
          ? current
          : {
              ...current,
              discipline: option.value,
              configuration: {
                federation: undefined,
                id: "",
                name: "",
              },
            }
        : current,
    );
  };
  return (
    <div class="event-editor-form">
      <AtomInput
        label="--Event title"
        value={props.draft.name}
        onChange={handleNameChange}
      />
      <EventDisciplineField
        onChange={updateDiscipline}
        value={props.draft.discipline}
        disabled={!props.isCreate}
      />
      <div class="event-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
