import { renderSolid } from "@lib/../.storybook/renderSolid";
import Calendar from "@lib/components/molecules/calendar/Calendar";

type CalendarStoryArgs = {
  from: string;
  to: string;
  locale: string;
  weekStartsOn: number;
  selectable: boolean;
};

const toTimestamp = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

const meta = {
  title: "Molecules/Calendar",
  argTypes: {
    from: { control: "text" },
    to: { control: "text" },
    locale: { control: "text" },
    weekStartsOn: { control: { type: "number", min: 0, max: 6 } },
    selectable: { control: "boolean" },
  },
  render: (args: CalendarStoryArgs) =>
    renderSolid(() => (
      <Calendar
        range={{ from: toTimestamp(args.from), to: toTimestamp(args.to) }}
        locale={args.locale}
        weekStartsOn={args.weekStartsOn}
        onDayClick={args.selectable ? () => {} : undefined}
      />
    )),
};

export default meta;

export const SingleMonth = {
  args: {
    from: "2026-09-08",
    to: "2026-09-20",
    locale: "es-ES",
    weekStartsOn: 1,
    selectable: false,
  },
};

export const MultipleMonths = {
  args: {
    from: "2026-09-08",
    to: "2026-12-06",
    locale: "es-ES",
    weekStartsOn: 1,
    selectable: false,
  },
};

export const Selectable = {
  args: {
    from: "2026-09-08",
    to: "2026-11-20",
    locale: "en-GB",
    weekStartsOn: 1,
    selectable: true,
  },
};
