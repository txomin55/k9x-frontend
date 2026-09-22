import { createMemo, For, Show } from "solid-js";
import Calendar, {
  startOfUtcDay,
} from "@lib/components/molecules/calendar/Calendar";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import { StageMapMarkerPopup } from "@/components/routes/stages/stages-map/StageMapMarker";
import type { StageSummaryResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { useI18n } from "@/stores/i18n/i18n";
import { formatUtcDateOnly, ONE_DAY_IN_MS } from "@/utils/date";
import { isStageLive } from "@/utils/stage";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "./styles.css";

/* A day shows at most a couple of trials: beyond that the week row grows tall
   enough to push the rest of the month out of view, and the dialog already
   lists the whole day. */
const VISIBLE_STAGES_PER_DAY = 2;

interface StagesCalendarProps {
  stages: StageSummaryResponseDTO[];
  from: number;
  to: number;
  onEnroll?: (stageId: string, eventId: string) => void;
}

export default function StagesCalendar(props: StagesCalendarProps) {
  const i18n = useI18n();
  const [dayParam, setDayParam] = useSearchParam("day", "");

  const rangeFrom = () => startOfUtcDay(props.from);
  const rangeTo = () => startOfUtcDay(props.to);

  /* A stage spans days: it shows on every day it covers, clamped to the range
     so a long span never grows the map beyond the visible calendar. */
  const stagesByDay = createMemo(() => {
    const byDay = new Map<number, StageSummaryResponseDTO[]>();

    for (const stage of props.stages) {
      const start = Math.max(startOfUtcDay(stage.dateFrom ?? 0), rangeFrom());
      const end = Math.min(
        startOfUtcDay(stage.dateTo ?? stage.dateFrom ?? 0),
        rangeTo(),
      );

      for (let day = start; day <= end; day += ONE_DAY_IN_MS) {
        byDay.set(day, [...(byDay.get(day) ?? []), stage]);
      }
    }

    return byDay;
  });

  const stagesOfDay = (day: number) => stagesByDay().get(day) ?? [];
  const visibleStagesOfDay = (day: number) =>
    stagesOfDay(day).slice(0, VISIBLE_STAGES_PER_DAY);
  const hiddenStagesOfDay = (day: number) =>
    stagesOfDay(day).length - visibleStagesOfDay(day).length;

  const selectedDay = () => (dayParam() ? Number(dayParam()) : null);
  const selectedStages = createMemo(() => {
    const day = selectedDay();
    return day === null ? [] : stagesOfDay(day);
  });

  const dialogTitle = () => {
    const stages = selectedStages();
    if (stages.length === 1) return stages[0].name;
    return formatUtcDateOnly(selectedDay() ?? 0);
  };

  const openDay = (day: number) => setDayParam(String(day));

  return (
    <div class="stages-calendar">
      <Calendar
        range={{ from: props.from, to: props.to }}
        locale={i18n.locale()}
        onDayClick={openDay}
        isDayClickable={(day) => stagesOfDay(day).length > 0}
        highlightRange={false}
        previousMonthLabel={i18n.t("STAGES.STAGES_CALENDAR.PREVIOUS_MONTH")}
        nextMonthLabel={i18n.t("STAGES.STAGES_CALENDAR.NEXT_MONTH")}
        dayContent={(day) => (
          <span class="stages-calendar__day-stages">
            <For each={visibleStagesOfDay(day)}>
              {(stage) => (
                <span class="stages-calendar__stage">
                  <CountryFlag
                    country={stage.country ?? ""}
                    height={12}
                    width={12}
                  />
                  <span class="stages-calendar__stage-name text-caption-md">
                    {stage.name}
                  </span>
                  <Show when={stage.status && isStageLive(stage.status)}>
                    <StatusBadge status={stage.status} dotMode />
                  </Show>
                </span>
              )}
            </For>
            <Show when={hiddenStagesOfDay(day) > 0}>
              <span class="stages-calendar__more text-caption-sm">
                <span class="stages-calendar__more-long">
                  {i18n.t("STAGES.STAGES_CALENDAR.MORE", {
                    count: hiddenStagesOfDay(day),
                  })}
                </span>
                <span class="stages-calendar__more-short">
                  {i18n.t("STAGES.STAGES_CALENDAR.MORE_SHORT", {
                    count: hiddenStagesOfDay(day),
                  })}
                </span>
              </span>
            </Show>
          </span>
        )}
      />

      <AtomDialog
        open={selectedStages().length > 0}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDayParam("");
        }}
        title={dialogTitle()}
        content={
          <div class="stages-calendar__day-detail">
            <For each={selectedStages()}>
              {(stage) => (
                <section class="stages-calendar__day-stage">
                  <Show when={selectedStages().length > 1}>
                    <h3 class="stages-calendar__day-stage-title text-heading-xs">
                      {stage.name}
                    </h3>
                  </Show>
                  <StageMapMarkerPopup
                    stage={stage}
                    onEnroll={props.onEnroll}
                  />
                </section>
              )}
            </For>
          </div>
        }
      />
    </div>
  );
}
