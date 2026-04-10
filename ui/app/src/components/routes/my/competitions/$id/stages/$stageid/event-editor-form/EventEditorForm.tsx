import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { type EventResponse } from "@/services/api/event-api-crud/eventApiCrud";
import "./styles.css";

type EventEditorFormProps = {
  draft: EventResponse;
  onCancel: () => void;
  onChange: (
    updater: (current: EventResponse | null) => EventResponse | null,
  ) => void;
  onSave: () => void;
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
  return (
    <div class="event-editor-form">
      <AtomInput
        label="--Event title"
        value={props.draft.name}
        onChange={handleNameChange}
      />
      <AtomInput label="--Discipline" value={props.draft.discipline} readOnly />
      <div class="event-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
