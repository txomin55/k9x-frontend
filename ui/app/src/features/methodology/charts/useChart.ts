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
 *
 * A canvas can mount before it is in the document — a segmented control section is built as an element
 * up front and only inserted once selected — and Chart.js reads styles through the canvas's window, which
 * a detached node cloned from a template does not have. So the chart waits until the canvas is connected:
 * a ResizeObserver fires once it gets laid out. The chart is created on the next frame, not inside the
 * observer's callback: Chart.js sizes the canvas as it starts, and a layout change within the callback makes
 * the browser report a "ResizeObserver loop" error.
 */
export const useChart = (
  canvas: Accessor<HTMLCanvasElement | undefined>,
  config: Accessor<ChartConfiguration>,
) => {
  let chart: Chart | undefined;
  let observer: ResizeObserver | undefined;
  let frame: number | undefined;

  const create = (element: HTMLCanvasElement) => {
    if (chart || !element.isConnected) return;

    observer?.disconnect();
    observer = undefined;
    chart = new Chart(element, config());
  };

  onMount(() => {
    const element = canvas();

    if (!element) return;

    if (element.isConnected || typeof ResizeObserver === "undefined") {
      create(element);
      return;
    }

    observer = new ResizeObserver(() => {
      if (frame !== undefined) return;

      frame = requestAnimationFrame(() => {
        frame = undefined;
        create(element);
      });
    });
    observer.observe(element);
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
    if (frame !== undefined) cancelAnimationFrame(frame);
    observer?.disconnect();
    observer = undefined;
    chart?.destroy();
    chart = undefined;
  });
};
