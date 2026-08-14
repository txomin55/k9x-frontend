import { createMemo } from "solid-js";
import type { ChartConfiguration, TooltipItem } from "chart.js";
import { isDark } from "@/stores/theme/theme";
import { useChart } from "../charts/useChart";
import {
  AXIS_FONT,
  rankBarBorder,
  rankBarColor,
  readChartTheme,
} from "../theme";
import type { Grade } from "../types";

type Props = {
  grade: Grade;
  tierLabels: string[];
  categoryLabel: (categoryId: string) => string;
  axisLabel: string;
  tooltip: (category: string, score: number) => string;
};

const BAR_PERCENTAGE = 0.8;
const AXIS_MARGIN = 5;
const AXIS_STEPS = 5;

/**
 * One grouped bar per category across the competitor tiers. Championship rounds come out as a flat row of
 * equal bars, which is exactly the point: a final is worth the same however many competitors turn up.
 */
export default function TierChart(props: Props) {
  let canvas: HTMLCanvasElement | undefined;

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();
    const { band, categories } = props.grade;

    return {
      type: "bar",
      data: {
        labels: props.tierLabels,
        datasets: categories.map((category, index) => ({
          label: props.categoryLabel(category.id),
          data: category.tiers.map((tier) => tier.rankScore),
          // Per bar, not per dataset: a sub-band may straddle a letter boundary.
          backgroundColor: category.tiers.map((tier) =>
            rankBarColor(tier.letter, index, categories.length),
          ),
          borderColor: category.tiers.map((tier) => rankBarBorder(tier.letter)),
          borderWidth: 1,
          borderRadius: { topLeft: 4, topRight: 4 },
          barPercentage: BAR_PERCENTAGE,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          // The page renders its own HTML legend above the canvas, as every other figure does.
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item: TooltipItem<"bar">) => {
                const category = categories[item.datasetIndex];

                if (!category) return "";

                return props.tooltip(
                  props.categoryLabel(category.id),
                  category.tiers[item.dataIndex]?.rankScore ?? 0,
                );
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: theme.tick, autoSkip: false },
          },
          y: {
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
