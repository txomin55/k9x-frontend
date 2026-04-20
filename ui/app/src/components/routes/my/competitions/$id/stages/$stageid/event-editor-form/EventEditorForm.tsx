import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import EventDisciplineField from "@/components/common/event-discipline-field/EventDisciplineField";
import { EMPTY_FEDERATION_CONFIGURATION } from "@/services/api/configurations/configurations";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import type { EventEditorDraft } from "@/services/api/event-crud/eventCrud.types";
import "./styles.css";

type EventEditorFormProps = {
  draft: EventEditorDraft;
  onCancel: () => void;
  onChange: (
    updater: (current: EventEditorDraft | null) => EventEditorDraft | null,
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
        ? current.discipline.id === option.value
          ? current
          : {
              ...current,
              discipline: {
                id: option.value,
                name: option.label,
              },
              configuration: {
                federation: EMPTY_FEDERATION_CONFIGURATION,
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
        value={props.draft.discipline.id}
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
