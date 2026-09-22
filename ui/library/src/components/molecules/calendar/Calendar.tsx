import { For, Show, createMemo, createSignal } from "solid-js";
import type { JSX } from "solid-js";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import "./styles.css";

export type CalendarRange = {
  from: number;
  to: number;
};

export type CalendarProps = {
  range: CalendarRange;
  locale?: string;
  weekStartsOn?: number;
  month?: number;
  onMonthChange?: (monthStart: number) => void;
  onDayClick?: (day: number) => void;
  isDayClickable?: (day: number) => boolean;
  highlightRange?: boolean;
  dayContent?: (day: number) => JSX.Element;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const WEEK_LENGTH = 7;
const DEFAULT_WEEK_STARTS_ON = 1;

export function startOfUtcDay(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function startOfUtcMonth(timestamp: number) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addUtcMonths(monthStart: number, amount: number) {
  const date = new Date(monthStart);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function monthOrder(timestamp: number) {
  const date = new Date(timestamp);
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

function clampMonth(monthStart: number, first: number, last: number) {
  if (monthOrder(monthStart) < monthOrder(first)) return first;
  if (monthOrder(monthStart) > monthOrder(last)) return last;
  return monthStart;
}

export default function Calendar(props: CalendarProps) {
  const locale = () => props.locale ?? undefined;
  const weekStartsOn = () => props.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON;

  const rangeStart = () => startOfUtcDay(props.range.from);
  const rangeEnd = () => startOfUtcDay(props.range.to);
  const firstMonth = () => startOfUtcMonth(rangeStart());
  const lastMonth = () => startOfUtcMonth(rangeEnd());

  const [internalMonth, setInternalMonth] = createSignal<number | undefined>();

  const visibleMonth = createMemo(() => {
    const selected = props.month ?? internalMonth() ?? firstMonth();
    return clampMonth(selected, firstMonth(), lastMonth());
  });

  const hasMonthSelector = () =>
    monthOrder(firstMonth()) !== monthOrder(lastMonth());
  const canGoBack = () => monthOrder(visibleMonth()) > monthOrder(firstMonth());
  const canGoForward = () =>
    monthOrder(visibleMonth()) < monthOrder(lastMonth());

  const goToMonth = (monthStart: number) => {
    const clamped = clampMonth(monthStart, firstMonth(), lastMonth());
    setInternalMonth(clamped);
    props.onMonthChange?.(clamped);
  };

  const monthLabel = () =>
    new Intl.DateTimeFormat(locale(), {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(visibleMonth()));

  const weekdayNames = createMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale(), {
      weekday: "short",
      timeZone: "UTC",
    });

    return Array.from({ length: WEEK_LENGTH }, (_, index) => {
      const dayOfWeek = (weekStartsOn() + index) % WEEK_LENGTH;
      return formatter.format(new Date(Date.UTC(2024, 0, 7 + dayOfWeek)));
    });
  });

  const weeks = createMemo(() => {
    const month = visibleMonth();
    const monthDate = new Date(month);
    const daysInMonth = new Date(
      Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const leading =
      (monthDate.getUTCDay() - weekStartsOn() + WEEK_LENGTH) % WEEK_LENGTH;
    const totalCells =
      Math.ceil((leading + daysInMonth) / WEEK_LENGTH) * WEEK_LENGTH;
    const gridStart = month - leading * DAY_IN_MS;

    return Array.from({ length: totalCells / WEEK_LENGTH }, (_, week) =>
      Array.from(
        { length: WEEK_LENGTH },
        (_, day) => gridStart + (week * WEEK_LENGTH + day) * DAY_IN_MS,
      ),
    );
  });

  const dayFormatter = createMemo(
    () =>
      new Intl.DateTimeFormat(locale(), { dateStyle: "long", timeZone: "UTC" }),
  );

  const isClickable = (day: number) =>
    Boolean(props.onDayClick) && (props.isDayClickable?.(day) ?? true);

  const isOutsideMonth = (day: number) =>
    monthOrder(day) !== monthOrder(visibleMonth());
  const isInRange = (day: number) => day >= rangeStart() && day <= rangeEnd();
  const isToday = (day: number) => day === startOfUtcDay(Date.now());

  const dayClass = (day: number) => {
    const classes = ["calendar__day"];

    if (isOutsideMonth(day)) classes.push("calendar__day--outside");

    if (props.highlightRange ?? true) {
      if (isInRange(day)) classes.push("calendar__day--in-range");
      if (day === rangeStart()) classes.push("calendar__day--start");
      if (day === rangeEnd()) classes.push("calendar__day--end");
    }
    if (isToday(day)) classes.push("calendar__day--today");

    return classes.join(" ");
  };

  const dayNumber = (day: number) => String(new Date(day).getUTCDate());

  return (
    <section class="calendar">
      <header class="calendar__header">
        <Show when={hasMonthSelector()}>
          <CircleButton
            type={BUTTON_TYPES.GHOST}
            size="sm"
            disabled={!canGoBack()}
            ariaLabel={props.previousMonthLabel ?? "Previous month"}
            onClick={() => goToMonth(addUtcMonths(visibleMonth(), -1))}
          >
            <span class="calendar__nav-icon">‹</span>
          </CircleButton>
        </Show>

        <h2 class="calendar__title text-label-lg">{monthLabel()}</h2>

        <Show when={hasMonthSelector()}>
          <CircleButton
            type={BUTTON_TYPES.GHOST}
            size="sm"
            disabled={!canGoForward()}
            ariaLabel={props.nextMonthLabel ?? "Next month"}
            onClick={() => goToMonth(addUtcMonths(visibleMonth(), 1))}
          >
            <span class="calendar__nav-icon">›</span>
          </CircleButton>
        </Show>
      </header>

      {/* Plain boxes, not a grid of ARIA roles: without roving focus a
          role="grid" would announce a keyboard model the calendar does not
          have. Each day button carries its full date instead. */}
      <div class="calendar__grid">
        <div class="calendar__week calendar__weekdays" aria-hidden="true">
          <For each={weekdayNames()}>
            {(weekday) => (
              <span class="calendar__weekday text-caption-md">{weekday}</span>
            )}
          </For>
        </div>

        <For each={weeks()}>
          {(week) => (
            <div class="calendar__week">
              <For each={week}>
                {(day) => (
                  <div class="calendar__cell">
                    <Show
                      when={isClickable(day)}
                      fallback={
                        <span
                          class={dayClass(day)}
                          aria-current={isToday(day) ? "date" : undefined}
                        >
                          <span class="calendar__day-number text-body-sm">
                            {dayNumber(day)}
                          </span>
                          {props.dayContent?.(day)}
                        </span>
                      }
                    >
                      <button
                        type="button"
                        class={dayClass(day)}
                        aria-label={dayFormatter().format(new Date(day))}
                        aria-current={isToday(day) ? "date" : undefined}
                        onClick={() => props.onDayClick?.(day)}
                      >
                        <span class="calendar__day-number text-body-sm">
                          {dayNumber(day)}
                        </span>
                        {props.dayContent?.(day)}
                      </button>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
