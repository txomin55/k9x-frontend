import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "@lib/components/atoms/combobox/AtomCombobox";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import { createMemo } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

/** An announcement is only worth sending with a target and an actual message behind it. */
export const NOTIFICATION_MIN_CONTENT_LENGTH = 10;

export type NotificationEditorDraft = {
  eventIds: string[];
  content: string;
};

type NotificationEditorFormProps = {
  draft: NotificationEditorDraft;
  eventOptions: AtomComboboxOption[];
  onCancel: () => void;
  onChange: (
    updater: (current: NotificationEditorDraft) => NotificationEditorDraft,
  ) => void;
  onNotify: () => void;
};

export const createEmptyNotificationDraft = (): NotificationEditorDraft => ({
  content: "",
  eventIds: [],
});

export const isNotificationDraftSendable = (draft: NotificationEditorDraft) =>
  draft.eventIds.length > 0 &&
  draft.content.trim().length >= NOTIFICATION_MIN_CONTENT_LENGTH;

export default function NotificationEditorForm(
  props: NotificationEditorFormProps,
) {
  const i18n = useI18n();
  const selectedOptions = createMemo<AtomComboboxOption[]>(() =>
    props.eventOptions.filter((option) =>
      props.draft.eventIds.includes(option.value),
    ),
  );
  const handleEventsChange = (options: AtomComboboxOption[]) =>
    props.onChange((current) => ({
      ...current,
      eventIds: options.map((option) => option.value),
    }));
  const handleContentChange = (value: string) =>
    props.onChange((current) => ({ ...current, content: value }));

  return (
    <div class="notification-editor-form">
      <AtomCombobox
        multiple
        label={i18n.t("MY.COMPETITIONS.NOTIFICATION_EDITOR.EVENTS")}
        placeholder={i18n.t(
          "MY.COMPETITIONS.NOTIFICATION_EDITOR.SELECT_EVENTS",
        )}
        options={props.eventOptions}
        value={selectedOptions()}
        onChange={handleEventsChange}
      />
      <AtomTextArea
        label={i18n.t("MY.COMPETITIONS.NOTIFICATION_EDITOR.CONTENT")}
        description={i18n.t(
          "MY.COMPETITIONS.NOTIFICATION_EDITOR.CONTENT_HINT",
          {
            min: NOTIFICATION_MIN_CONTENT_LENGTH,
          },
        )}
        placeholder={i18n.t(
          "MY.COMPETITIONS.NOTIFICATION_EDITOR.CONTENT_PLACEHOLDER",
        )}
        value={props.draft.content}
        onChange={handleContentChange}
      />
      <div class="notification-editor-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.COMPETITIONS.NOTIFICATION_EDITOR.CANCEL")}
        </AtomButton>
        <AtomButton
          type={BUTTON_TYPES.PRIMARY}
          onClick={props.onNotify}
          disabled={!isNotificationDraftSendable(props.draft)}
        >
          {i18n.t("MY.COMPETITIONS.NOTIFICATION_EDITOR.NOTIFY")}
        </AtomButton>
      </div>
    </div>
  );
}
