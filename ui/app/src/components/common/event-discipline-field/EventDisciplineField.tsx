import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import i18n from "i18next";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";

export const EVENT_DISCIPLINE_OPTIONS: AtomSelectOption[] = [
  {
    label: i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.FCI_OBEDIENCE"),
    value: "obdx",
  },
];

const getEventDisciplineOptionsWithIcon = (): AtomSelectOption[] =>
  EVENT_DISCIPLINE_OPTIONS.map((option) => ({
    ...option,
    preLabel: <DisciplineIcon disciplineId={option.value} alt={`${option.value} icon`} />,
  }));

export const getEventDisciplineOption = (discipline: string) =>
  EVENT_DISCIPLINE_OPTIONS.find(
    (option) => option.value === discipline || option.label === discipline,
  ) ?? null;

export const getEventDisciplineLabel = (discipline: string) =>
  getEventDisciplineOption(discipline)?.label ?? discipline;

type EventDisciplineFieldProps = {
  disabled?: boolean;
  onChange: (value: AtomSelectOption) => void;
  value: string;
};

export default function EventDisciplineField(props: EventDisciplineFieldProps) {
  const options = () => getEventDisciplineOptionsWithIcon();

  return (
    <AtomSelect
      label={i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.DISCIPLINE")}
      placeholder={i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.SELECT_DISCIPLINE")}
      onChange={props.onChange}
      options={options()}
      value={getEventDisciplineOption(props.value)}
      disabled={props.disabled}
    />
  );
}
