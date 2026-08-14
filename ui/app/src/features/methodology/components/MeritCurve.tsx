import { createMemo } from "solid-js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { isDark } from "@/stores/theme/theme";
import { useChart } from "../charts/useChart";
import { AXIS_FONT, readChartTheme, SERIES_COLORS } from "../theme";
import type { MeritCurve as MeritCurveData } from "../types";

type Props = {
  meritCurve: MeritCurveData;
  xTitle: string;
  yTitle: string;
  tickLabel: (value: number) => string;
  tooltip: (x: number, y: string) => string;
};

const X_MARGIN = 5;
const X_TAIL = 10;
const Y_MARGIN = 20;
const X_STEPS = 10;

export default function MeritCurve(props: Props) {
  let canvas: HTMLCanvasElement | undefined;

  /**
   * Chart.js normalises point objects in place, so it must never be handed the query store's own arrays —
   * Solid rejects that with "Cannot mutate a Store directly". Hence the plain copy.
   */
  const seriesById = (id: string) =>
    (props.meritCurve.series.find((series) => series.id === id)?.points ?? []).map(
      (point) => ({ x: point.x, y: point.y }),
    );

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();
    const { context } = props.meritCurve;
    const floor = seriesById("floor");
    const firstFloorX = floor[0]?.x ?? 0;

    return {
      type: "line",
      data: {
        datasets: [
          {
            data: floor,
            borderColor: SERIES_COLORS.gray,
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            data: seriesById("curve"),
            borderColor: SERIES_COLORS.blue,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: SERIES_COLORS.blue,
          },
          {
            type: "scatter",
            data: seriesById("knee"),
            pointRadius: 9,
            pointHoverRadius: 10,
            pointBackgroundColor: SERIES_COLORS.red,
            pointBorderColor: theme.surface,
            pointBorderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item: TooltipItem<"line">) =>
                props.tooltip(
                  Number(item.parsed.x),
                  Number(item.parsed.y).toFixed(2),
                ),
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: firstFloorX - X_MARGIN,
            max: context.maxScore + X_TAIL,
            grid: { color: theme.grid },
            ticks: {
              color: theme.tick,
              stepSize: context.maxScore / X_STEPS,
              callback: (value) => props.tickLabel(Number(value)),
            },
            title: {
              display: true,
              text: props.xTitle,
              color: theme.tick,
              font: AXIS_FONT,
            },
          },
          y: {
            min: context.parameters.floorBelowFirstQualification - Y_MARGIN,
            max: context.eventScore + Y_MARGIN,
            grid: { color: theme.grid },
            ticks: { color: theme.tick },
            title: {
              display: true,
              text: props.yTitle,
              color: theme.tick,
              font: AXIS_FONT,
            },
          },
        },
      },
    };
  });

  useChart(
    () => canvas,
    () => config(),
  );

  return (
    <div class="methodology-page__chart-box">
      <canvas ref={canvas} />
    </div>
  );
}
