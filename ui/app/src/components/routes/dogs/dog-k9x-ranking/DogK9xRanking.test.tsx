import { fireEvent, render } from "@solidjs/testing-library";
import type { Chart, ChartConfiguration } from "chart.js";
import DogK9xRanking, {
  dogMarkerPlugin,
} from "@/components/routes/dogs/dog-k9x-ranking/DogK9xRanking";
import type {
  K9xRanking,
  K9xRankingBucket,
} from "@/services/fetch-dogs/fetchDogs.types";

const AS_OF = Date.UTC(2026, 8, 16);

/** The 45 bands of 20 points from 100 to 1000, with `dogs` dogs in the bands given. */
const buckets = (dogs: Record<number, number> = {}): K9xRankingBucket[] =>
  Array.from({ length: 45 }, (_, band) => {
    const from = 100 + band * 20;
    return { from, to: from + 20, dogs: dogs[from] ?? 0 };
  });

const ranking = (overrides: Partial<K9xRanking> = {}): K9xRanking => ({
  total: 1623,
  asOf: AS_OF,
  buckets: buckets({ 400: 1600, 940: 23 }),
  highlight: {
    dog: { id: "DOG-1", name: "Rex" },
    index: 953,
    position: 8,
    topPercent: 1,
  },
  ...overrides,
});

const data = vi.fn<() => K9xRanking | undefined>();
const requestedCountry = vi.fn<(country: string | undefined) => void>();
let chartConfig: ChartConfiguration | undefined;

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
  usePublicK9xRanking: (
    _identification: () => string,
    country: () => string | undefined,
  ) => ({
    get data() {
      requestedCountry(country());
      return data();
    },
  }),
}));

vi.mock("@/features/methodology/charts/useChart", () => ({
  useChart: (_canvas: unknown, config: () => ChartConfiguration) => {
    chartConfig = config();
  },
}));

vi.mock("@/features/methodology/api", () => ({
  useObdxMethodology: () => ({
    data: {
      globalScale: {
        min: 0,
        max: 1000,
        ranges: [
          { letter: "E", min: 0, max: 200 },
          { letter: "D", min: 201, max: 400 },
          { letter: "C", min: 401, max: 600 },
          { letter: "B", min: 601, max: 800 },
          { letter: "A", min: 801, max: 900 },
          { letter: "S", min: 901, max: 1000 },
        ],
      },
    },
  }),
}));

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const renderRanking = (country?: { id: string; name: string }) =>
  render(() => <DogK9xRanking identification="DOG-1" country={country} />);

/** Kobalte's segmented control observes its box; jsdom has no observer. */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("dog K9X ranking", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    chartConfig = undefined;
    requestedCountry.mockClear();
    data.mockReturnValue(ranking());
  });

  test("shows the dog's position among the charted dogs and the top percentage it is in", () => {
    const { container } = renderRanking();

    expect(
      container.querySelector(".dog-k9x-ranking__position-value"),
    ).toHaveTextContent("8");
    expect(
      container.querySelector(".dog-k9x-ranking__position-total"),
    ).toHaveTextContent("/ 1623");
    expect(
      container.querySelector(".dog-k9x-ranking__top-value"),
    ).toHaveTextContent("1%");
  });

  test("draws the field as thin lines mirrored around the baseline, with no count axis or tooltip", () => {
    renderRanking();

    const lines = chartConfig!.data.datasets[0]!.data as unknown as {
      x: number;
      y: [number, number];
    }[];
    expect(lines.length).toBeGreaterThan(10);
    expect(lines.every((line) => line.y[0] === -line.y[1])).toBe(true);
    expect(lines.every((line) => line.x % 10 === 0)).toBe(true);
    const options = chartConfig!.options as {
      scales: { y: { display: boolean } };
      plugins: { tooltip: { enabled: boolean } };
    };
    expect(options.scales.y.display).toBe(false);
    expect(options.plugins.tooltip.enabled).toBe(false);
  });

  test("colors each line by its rank band and lights up only the dog's band", () => {
    renderRanking();

    const lines = chartConfig!.data.datasets[0]!.data as unknown as {
      x: number;
    }[];
    const colors = chartConfig!.data.datasets[0]!.backgroundColor as string[];
    const color = (x: number) =>
      colors[lines.findIndex((line) => line.x === x)]!;
    // the dog's 953 sits in the 940-960 band, drawn in full S color
    expect(color(940)).toBe("#6d28d9");
    expect(color(950)).toBe("#6d28d9");
    // the rest keep their band color, washed out
    expect(color(400)).not.toBe(color(940));
    expect(color(400).startsWith("#b45309")).toBe(true);
  });

  test("draws nothing past the top band anyone reaches", () => {
    renderRanking();

    const lines = chartConfig!.data.datasets[0]!.data as unknown as {
      x: number;
    }[];
    // the busiest dogs top out in the 940-960 band
    expect(Math.max(...lines.map((line) => line.x))).toBeLessThan(960);
  });

  test("marks the dog at its exact index with its rank letter and index", () => {
    renderRanking();

    const marker = (
      chartConfig!.options!.plugins as {
        dogMarker: { dog?: { index: number; label: string } };
      }
    ).dogMarker;
    expect(marker.dog).toEqual(
      expect.objectContaining({ index: 953, label: "S 953" }),
    );
    expect(chartConfig!.plugins).toContain(dogMarkerPlugin);

    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      roundRect: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      measureText: () => ({ width: 40 }),
    };
    const chart = {
      options: chartConfig!.options,
      ctx,
      chartArea: { top: 0, bottom: 200, left: 0, right: 1000 },
      scales: {
        x: { getPixelForValue: (value: number) => value },
        y: { getPixelForValue: () => 120 },
      },
    } as unknown as Chart<"bar">;
    (dogMarkerPlugin.afterDatasetsDraw as (chart: Chart<"bar">) => void)(chart);

    expect(ctx.lineTo).toHaveBeenCalledWith(1000, 120); // the dotted baseline
    expect(ctx.lineTo).toHaveBeenCalledWith(953, 200); // the dog's line
    expect(ctx.fillText).toHaveBeenCalledWith("S 953", 953, 11);
  });

  test("draws no marker for a dog off the chart", () => {
    data.mockReturnValue(ranking({ highlight: null }));

    renderRanking();

    expect(
      (chartConfig!.options!.plugins as { dogMarker: { dog?: unknown } })
        .dogMarker.dog,
    ).toBeUndefined();
  });

  test("says why a dog below the threshold is not on the chart, and still charts the field", () => {
    data.mockReturnValue(ranking({ highlight: null }));

    const { container } = renderRanking();

    expect(container.textContent).toContain(
      "DOGS.DETAIL.K9X_RANKING_OFF_CHART",
    );
    expect(container.querySelector(".dog-k9x-ranking__summary")).toBeNull();
    expect(chartConfig).toBeDefined();
  });

  test("says so while the ranking has never been computed", () => {
    data.mockReturnValue(ranking({ asOf: null, total: 0, highlight: null }));

    const { container } = renderRanking();

    expect(container.querySelector(".dog-k9x-ranking__empty")).not.toBeNull();
    expect(chartConfig).toBeUndefined();
  });

  test("offers only the world ranking when the dog's country is unknown", () => {
    const { queryAllByRole } = renderRanking();

    expect(queryAllByRole("radio")).toHaveLength(0);
    expect(requestedCountry).toHaveBeenLastCalledWith(undefined);
  });

  test("narrows the ranking to the dog's country", () => {
    const { getAllByRole, container } = renderRanking({
      id: "ES",
      name: "Spain",
    });

    expect(requestedCountry).toHaveBeenLastCalledWith(undefined);
    fireEvent.click(getAllByRole("radio")[1]!);

    expect(requestedCountry).toHaveBeenLastCalledWith("ES");
    expect(
      container.querySelector(".dog-k9x-ranking__position .country-flag"),
    ).not.toBeNull();
  });
});
