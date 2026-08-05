import { createMemo } from "solid-js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { isDark } from "@/stores/theme/theme";
import { useChart } from "../charts/useChart";
import { AXIS_FONT, readChartTheme, SERIES_COLORS } from "../theme";
import type { DecaySeries } from "../types";

type Props = {
  series: DecaySeries[];
  seriesLabel: (id: DecaySeries["id"]) => string;
  xTitle: string;
  yTitle: string;
  monthTick: (month: number) => string;
  tooltip: (serie: string, month: number, weight: string) => string;
};

const X_TAIL = 4;
const X_STEP = 8;
const Y_MAX = 1.05;
const Y_STEP = 0.25;

const STYLES: Record<
  DecaySeries["id"],
  { color: string; dash?: number[]; pointStyle: "circle" | "rect" }
> = {
  level: { color: SERIES_COLORS.blue, pointStyle: "circle" },
  freshness: {
    color: SERIES_COLORS.orange,
    dash: [6, 4],
    pointStyle: "rect",
  },
};

export default function DecayCurves(props: Props) {
  let canvas: HTMLCanvasElement | undefined;

  const xMax = createMemo(
    () =>
      Math.max(...props.series.map((series) => series.floor.fromMonth)) + X_TAIL,
  );

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();

    return {
      type: "line",
      data: {
        datasets: props.series.map((series) => {
          const style = STYLES[series.id];

          return {
            label: props.seriesLabel(series.id),
            data: [
              ...series.anchors.map((anchor) => ({
                x: anchor.month,
                y: anchor.weight,
              })),
              { x: xMax(), y: series.floor.value },
            ],
            borderColor: style.color,
            borderDash: style.dash,
            borderWidth: 2,
            pointRadius: 3,
            pointStyle: style.pointStyle,
            pointBackgroundColor: style.color,
          };
        }),
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
                  item.dataset.label ?? "",
                  Number(item.parsed.x),
                  Number(item.parsed.y).toFixed(2),
                ),
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 0,
            max: xMax(),
            grid: { color: theme.grid },
            ticks: {
              color: theme.tick,
              stepSize: X_STEP,
              callback: (value) => props.monthTick(Number(value)),
            },
            title: {
              display: true,
              text: props.xTitle,
              color: theme.tick,
              font: AXIS_FONT,
            },
          },
          y: {
            min: 0,
            max: Y_MAX,
            grid: { color: theme.grid },
            ticks: { color: theme.tick, stepSize: Y_STEP },
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
