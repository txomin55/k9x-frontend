import { createRoot } from "solid-js";
import type { ChartConfiguration } from "chart.js";
import { useChart } from "@/features/methodology/charts/useChart";

const created = vi.fn<(element: HTMLCanvasElement) => void>();

vi.mock("chart.js", () => {
  class Chart {
    static register = vi.fn();
    constructor(element: HTMLCanvasElement) {
      created(element);
    }
    destroy() {}
    update() {}
  }
  return {
    Chart,
    BarController: {},
    BarElement: {},
    CategoryScale: {},
    LineController: {},
    LineElement: {},
    LinearScale: {},
    PointElement: {},
    ScatterController: {},
    Tooltip: {},
  };
});

let observed: (() => void) | undefined;

class ResizeObserverMock {
  constructor(callback: () => void) {
    observed = callback;
  }
  observe() {}
  disconnect() {}
}

const config = { type: "line", data: { datasets: [] } } as ChartConfiguration;

const mount = (canvas: HTMLCanvasElement) =>
  createRoot((dispose) => {
    useChart(
      () => canvas,
      () => config,
    );
    return dispose;
  });

describe("useChart", () => {
  beforeEach(() => {
    created.mockClear();
    observed = undefined;
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  test("creates the chart right away on a canvas already in the page", async () => {
    const canvas = document.body.appendChild(document.createElement("canvas"));

    const dispose = mount(canvas);
    await Promise.resolve();

    expect(created).toHaveBeenCalledWith(canvas);
    dispose();
  });

  /** A section built up front mounts its canvas detached: Chart.js would read styles from a missing window. */
  test("waits for a detached canvas to be inserted, then creates the chart on the next frame", async () => {
    const canvas = document.createElement("canvas");

    const dispose = mount(canvas);
    await Promise.resolve();
    expect(created).not.toHaveBeenCalled();

    document.body.appendChild(canvas);
    observed?.();
    expect(created).not.toHaveBeenCalled();

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(created).toHaveBeenCalledOnce();
    dispose();
  });
});
