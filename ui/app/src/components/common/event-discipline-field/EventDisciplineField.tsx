import AtomSelect, { type AtomSelectOption } from "@lib/components/atoms/select/AtomSelect";
import i18n from "i18next";
import { createMemo } from "solid-js";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import { DISCIPLINES } from "@/utils/disciplines";

export const getEventDisciplineOptions = (): AtomSelectOption[] => [
  {
    label: i18n.t("COMMON.EVENT_DISCIPLINE_FIELD.FCI_OBEDIENCE"),
    value: DISCIPLINES.OBDX,
  },
];

const getEventDisciplineOptionsWithIcon = (): AtomSelectOption[] =>
  getEventDisciplineOptions().map((option) => ({
    ...option,
    preLabel: (
      <DisciplineIcon
        disciplineId={option.value}
        alt={`${option.value} icon`}
      />
    ),
  }));

export const getEventDisciplineOption = (discipline: string) =>
  getEventDisciplineOptions().find(
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
  const options = createMemo(() => getEventDisciplineOptionsWithIcon());

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
