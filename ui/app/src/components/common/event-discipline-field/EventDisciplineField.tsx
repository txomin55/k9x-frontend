import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import i18n from "i18next";

export const EVENT_DISCIPLINE_OPTIONS: AtomSelectOption[] = [
  {
    label: i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.FCI_OBEDIENCE"),
    value: "fci_ob",
  },
];

export const getEventDisciplineOption = (discipline: string) =>
  EVENT_DISCIPLINE_OPTIONS.find(
    (option) =>
      option.value === discipline || option.label === discipline,
  ) ?? null;

export const getEventDisciplineLabel = (discipline: string) =>
  getEventDisciplineOption(discipline)?.label ?? discipline;

type EventDisciplineFieldProps = {
  disabled?: boolean;
  onChange: (value: AtomSelectOption) => void;
  value: string;
};

export default function EventDisciplineField(
  props: EventDisciplineFieldProps,
) {
  return (
    <AtomSelect
      label={i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.DISCIPLINE")}
      onChange={props.onChange}
      options={EVENT_DISCIPLINE_OPTIONS}
      value={getEventDisciplineOption(props.value)}
      disabled={props.disabled}
    />
  );
}
