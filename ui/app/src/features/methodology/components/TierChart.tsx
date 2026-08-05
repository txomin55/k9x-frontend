import { createMemo } from "solid-js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { isDark } from "@/stores/theme/theme";
import { useChart } from "../charts/useChart";
import { AXIS_FONT, readChartTheme, SERIES_COLORS } from "../theme";
import type { Grade } from "../types";

type Props = {
  grade: Grade;
  tierLabels: string[];
  axisLabel: string;
  nationalTooltip: (score: number) => string;
  internationalTooltip: (score: number) => string;
};

const BAR_PERCENTAGE = 0.55;
const AXIS_MARGIN = 5;
const AXIS_STEPS = 5;

export default function TierChart(props: Props) {
  let canvas: HTMLCanvasElement | undefined;

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();
    const { band, tiers } = props.grade;

    return {
      type: "bar",
      data: {
        labels: props.tierLabels,
        datasets: [
          {
            label: "base",
            data: tiers.map(() => band.min),
            backgroundColor: "rgba(0,0,0,0)",
            barPercentage: BAR_PERCENTAGE,
          },
          {
            label: "tier",
            data: tiers.map((tier) => tier.nationalRankScore - band.min),
            backgroundColor: SERIES_COLORS.blue,
            barPercentage: BAR_PERCENTAGE,
          },
          {
            label: "international",
            data: tiers.map(
              (tier) => tier.internationalRankScore - tier.nationalRankScore,
            ),
            backgroundColor: SERIES_COLORS.obdx,
            borderRadius: { topLeft: 4, topRight: 4 },
            barPercentage: BAR_PERCENTAGE,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            filter: (item: TooltipItem<"bar">) => item.datasetIndex > 0,
            callbacks: {
              label: (item: TooltipItem<"bar">) => {
                const tier = tiers[item.dataIndex];

                if (!tier) return "";

                return item.datasetIndex === 1
                  ? props.nationalTooltip(tier.nationalRankScore)
                  : props.internationalTooltip(tier.internationalRankScore);
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: theme.tick, autoSkip: false },
          },
          y: {
            stacked: true,
            min: band.min - AXIS_MARGIN,
            max: band.max + AXIS_MARGIN,
            grid: { color: theme.grid },
            ticks: {
              color: theme.tick,
              stepSize: Math.round((band.max - band.min) / AXIS_STEPS),
            },
            title: {
              display: true,
              text: props.axisLabel,
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
