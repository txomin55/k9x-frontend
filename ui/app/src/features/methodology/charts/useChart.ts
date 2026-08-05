import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import { createEffect, on, onCleanup, onMount, type Accessor } from "solid-js";

Chart.register(
  BarController,
  LineController,
  ScatterController,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);

/**
 * The only place allowed to instantiate Chart.js. Creating the chart on mount and mutating it on
 * every config change keeps language and theme switches from recreating (and leaking) the canvas.
 */
export const useChart = (
  canvas: Accessor<HTMLCanvasElement | undefined>,
  config: Accessor<ChartConfiguration>,
) => {
  let chart: Chart | undefined;

  onMount(() => {
    const element = canvas();

    if (!element) return;

    chart = new Chart(element, config());
  });

  createEffect(
    on(
      config,
      (nextConfig) => {
        if (!chart) return;

        chart.data = nextConfig.data;
        chart.options = nextConfig.options ?? {};
        chart.update();
      },
      { defer: true },
    ),
  );

  onCleanup(() => {
    chart?.destroy();
    chart = undefined;
  });
};
