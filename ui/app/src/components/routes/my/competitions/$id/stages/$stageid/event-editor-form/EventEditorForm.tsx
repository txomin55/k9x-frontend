import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import EventDisciplineField from "@/components/common/event-discipline-field/EventDisciplineField";
import { EMPTY_FEDERATION_CONFIGURATION } from "@/services/secured/configurations/configurations";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import type { EventEditorDraft } from "@/services/secured/event-crud/eventCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import { Show } from "solid-js";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
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
  const i18n = useI18n();
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
        label={i18n.t("MY.COMPETITIONS.EVENT_EDITOR_FORM.EVENT_TITLE")}
        value={props.draft.name}
        onChange={handleNameChange}
      />
      <Show
        when={props.isCreate}
        fallback={<DisciplineIcon disciplineId={props.draft.discipline.id} />}
      >
        <EventDisciplineField
          onChange={updateDiscipline}
          value={props.draft.discipline.id}
          disabled={!props.isCreate}
        />
      </Show>
      <div class="event-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.COMPETITIONS.EVENT_EDITOR_FORM.CANCEL")}
        </AtomButton>
        <AtomButton
          onClick={props.onSave}
          disabled={!props.draft.discipline.id}
        >
          {i18n.t("MY.COMPETITIONS.EVENT_EDITOR_FORM.SAVE")}
        </AtomButton>
      </div>
    </div>
  );
}
