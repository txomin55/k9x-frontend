import { createMemo } from "solid-js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { isDark } from "@/stores/theme/theme";
import { useChart } from "../charts/useChart";
import { AXIS_FONT, dogColor, readChartTheme } from "../theme";
import type { ExampleDog } from "../types";

type Props = {
  dogs: ExampleDog[];
  indexScale: { min: number; max: number };
  dogName: (dog: ExampleDog) => string;
  xTitle: string;
  yTitle: string;
  monthTick: (month: number) => string;
  tooltipIndex: (dog: string, month: number, index: string) => string;
  tooltipEvent: (
    dog: string,
    detail: string,
    score: number,
    index: string,
  ) => string;
  tooltipScore: (dog: string, score: string, month: number) => string;
};

const X_STEP = 10;
const Y_STEP = 100;
const RETIRED_DASH = [6, 4];

type Point = {
  x: number;
  y: number;
  kind?: "score" | "event";
  detail?: string;
  score?: number;
};

export default function IndexExample(props: Props) {
  let canvas: HTMLCanvasElement | undefined;

  const xMax = createMemo(() =>
    Math.max(
      ...props.dogs.flatMap((dog) => dog.series.map((point) => point.month)),
    ),
  );

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();

    return {
      type: "line",
      data: {
        datasets: props.dogs.flatMap((dog) => {
          const color = dogColor(dog.id);
          const label = props.dogName(dog);
          const retires = dog.events.length === 1;

          return [
            {
              label,
              data: dog.series.map((point) => ({
                x: point.month,
                y: point.index,
              })),
              borderColor: color,
              borderDash: retires ? RETIRED_DASH : undefined,
              borderWidth: 2,
              pointRadius: 0,
            },
            {
              label,
              type: "scatter" as const,
              data: dog.results.map((result) => ({
                x: result.month,
                y: result.score,
                kind: "score" as const,
              })),
              pointRadius: 5,
              pointBackgroundColor: `${color}55`,
              pointBorderWidth: 0,
            },
            {
              label,
              type: "scatter" as const,
              data: dog.events.map((event) => ({
                x: event.month,
                y: event.index,
                kind: "event" as const,
                detail: event.label,
                score: event.score,
              })),
              pointRadius: 6,
              pointBackgroundColor: color,
              pointBorderColor: theme.surface,
              pointBorderWidth: 2,
            },
          ];
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item: TooltipItem<"line">) => {
                const point = item.raw as Point;
                const dog = item.dataset.label ?? "";

                const month = Number(item.parsed.x);
                const value = Number(item.parsed.y).toFixed(1);

                if (point.kind === "score") {
                  return props.tooltipScore(dog, value, month);
                }

                if (point.kind === "event") {
                  return props.tooltipEvent(
                    dog,
                    point.detail ?? "",
                    point.score ?? 0,
                    value,
                  );
                }

                return props.tooltipIndex(dog, month, value);
              },
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
            min: props.indexScale.min,
            max: props.indexScale.max,
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
