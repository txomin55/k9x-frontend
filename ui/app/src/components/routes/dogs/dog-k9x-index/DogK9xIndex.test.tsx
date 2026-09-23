import { fireEvent, render } from "@solidjs/testing-library";
import type { ActiveElement, Chart, ChartConfiguration } from "chart.js";
import type { JSX } from "solid-js";
import DogK9xIndex, {
  roundJumps,
} from "@/components/routes/dogs/dog-k9x-index/DogK9xIndex";
import type {
  DogIndexEvent,
  DogIndexTimeline,
} from "@/services/fetch-dogs/fetchDogs.types";

const MONTH = 30.4375 * 86_400_000;
const START = Date.UTC(2025, 0, 10);

const event = (overrides: Partial<DogIndexEvent> = {}): DogIndexEvent => ({
  event: { id: "event-1", name: "Grade 2" },
  stageId: "stage-1",
  discipline: { id: "OBDX", name: "Obedience" },
  country: { id: "ES", name: "Spain" },
  date: START,
  eventScore: 750,
  totalScore: 251.456,
  position: 2,
  index: 384,
  restricted: false,
  ...overrides,
});

const timeline = vi.fn<() => DogIndexTimeline | undefined>();
let chartConfig: ChartConfiguration | undefined;

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
  usePublicDogIndex: () => ({
    get data() {
      return timeline();
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

vi.mock("@tanstack/solid-router", () => ({
  Link: (props: {
    class?: string;
    params: { id: string; eventId: string };
    search: { pinned: string };
    children: JSX.Element;
  }) => (
    <a
      class={props.class}
      href={`/stages/${props.params.id}/events/${props.params.eventId}/classification?pinned=${props.search.pinned}`}
    >
      {props.children}
    </a>
  ),
}));

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const renderIndex = () => render(() => <DogK9xIndex identification="DOG-1" />);

type Dataset = {
  type?: string;
  data: { x: number; y: number }[];
  pointBackgroundColor?: string[];
};
const datasets = () => chartConfig!.data.datasets as unknown as Dataset[];

/** Clicks the chart as Chart.js would report it: the elements under the pointer and the chart itself. */
const clickChart = (elements: { datasetIndex: number; index: number }[]) => {
  const chart = {
    data: chartConfig!.data,
    canvas: document.createElement("canvas"),
    getDatasetMeta: () => ({ data: [{ x: 120, y: 80 }] }),
  } as unknown as Chart;
  const active = elements.map((element) => ({
    ...element,
    element: { x: 120, y: 80 },
  })) as unknown as ActiveElement[];
  const onClick = chartConfig!.options!.onClick as unknown as (
    event: unknown,
    elements: ActiveElement[],
    chart: Chart,
  ) => void;
  onClick({}, active, chart);
};

describe("dog K9X index", () => {
  beforeEach(() => {
    chartConfig = undefined;
    timeline.mockReturnValue({
      events: [event()],
      curve: [
        { timestamp: START, index: 384 },
        { timestamp: START + 12 * MONTH, index: 300 },
      ],
      freshnessDegradationFrom: START + 6 * MONTH,
    });
  });

  test("says so when the dog has no index yet", () => {
    timeline.mockReturnValue({
      events: [],
      curve: [],
      freshnessDegradationFrom: null,
    });

    const { container } = renderIndex();

    expect(container.querySelector(".dog-k9x-index__empty")).not.toBeNull();
    expect(chartConfig).toBeUndefined();
  });

  test("draws the curve, the event scores and the index after each event", () => {
    renderIndex();

    const [curve, scores, indexes] = datasets();
    expect(curve!.data.map((point) => point.y)).toEqual([384, 300]);
    expect(scores!.data).toEqual([
      expect.objectContaining({ x: START, y: 750 }),
    ]);
    expect(indexes!.data).toEqual([
      expect.objectContaining({ x: START, y: 384 }),
    ]);
  });

  test("leaves out the score of a restricted event but keeps its index", () => {
    timeline.mockReturnValue({
      events: [event({ restricted: true, eventScore: null, totalScore: null })],
      curve: [{ timestamp: START, index: 384 }],
      freshnessDegradationFrom: START + 6 * MONTH,
    });

    renderIndex();

    const [, scores, indexes] = datasets();
    expect(scores!.data).toEqual([]);
    expect(indexes!.data).toHaveLength(1);
  });

  test("marks only where the whole index starts fading with a vertical line", () => {
    renderIndex();

    const verticals = datasets()
      .slice(3)
      .map((dataset) => dataset.data.map((point) => point.x));
    expect(verticals).toEqual([[START + 6 * MONTH, START + 6 * MONTH]]);
  });

  test("stretches the time axis to a freshness line still ahead", () => {
    timeline.mockReturnValue({
      events: [event()],
      curve: [{ timestamp: START, index: 384 }],
      freshnessDegradationFrom: START + 6 * MONTH,
    });

    renderIndex();

    expect(chartConfig!.options!.scales!.x!.max).toBeGreaterThan(
      START + 6 * MONTH,
    );
  });

  test("moves the sample before a jump a little earlier so the line climbs in a curve", () => {
    const rounded = roundJumps(
      [
        { timestamp: 0, index: 300 },
        { timestamp: 1000, index: 250 },
        { timestamp: 1000, index: 600 },
        { timestamp: 2000, index: 600 },
      ],
      100,
    );

    expect(rounded.map((point) => [point.x, point.y])).toEqual([
      [0, 300],
      [900, 250],
      [1000, 600],
      [2000, 600],
    ]);
  });

  test("never moves the sample before a jump past half the gap to the previous one", () => {
    const rounded = roundJumps(
      [
        { timestamp: 950, index: 260 },
        { timestamp: 1000, index: 250 },
        { timestamp: 1000, index: 600 },
      ],
      100,
    );

    expect(rounded[1]!.x).toBe(975);
  });

  test("leaves room before the first event so its dots are not cut", () => {
    renderIndex();

    expect(chartConfig!.options!.scales!.x!.min).toBeLessThan(START);
  });

  test("colors each dot by the rank band it falls in", () => {
    timeline.mockReturnValue({
      events: [event({ index: 384, eventScore: 750 })],
      curve: [{ timestamp: START, index: 384 }],
      freshnessDegradationFrom: null,
    });

    renderIndex();

    const [, scores, indexes] = datasets();
    // D (201-400) for the index, B (601-800) for the score, translucent.
    expect(indexes!.pointBackgroundColor).toEqual(["#b45309"]);
    expect(scores!.pointBackgroundColor![0]).toMatch(/^#1d4ed8/);
  });

  test("opens the event card on click, linking to its classification with the dog pinned", () => {
    const { container, findByRole } = renderIndex();

    clickChart([{ datasetIndex: 2, index: 0 }]);

    return findByRole("dialog").then((card) => {
      expect(card.querySelector("a")).toHaveAttribute(
        "href",
        "/stages/stage-1/events/event-1/classification?pinned=DOG-1",
      );
      expect(card).toHaveTextContent("Grade 2");
      expect(card.querySelector(".country-flag")).not.toBeNull();
      expect(card).not.toHaveTextContent("Spain");
      expect(container.querySelector(".dog-k9x-index__card")).not.toBeNull();
    });
  });

  test("keeps the card open until the reader clicks outside it", async () => {
    const { findByRole, queryByRole } = renderIndex();

    clickChart([{ datasetIndex: 2, index: 0 }]);
    const card = await findByRole("dialog");
    fireEvent.pointerDown(card);
    expect(queryByRole("dialog")).not.toBeNull();

    fireEvent.pointerDown(document.body);
    expect(queryByRole("dialog")).toBeNull();
  });

  test("closes the card when the click lands on no event", async () => {
    const { findByRole, queryByRole } = renderIndex();

    clickChart([{ datasetIndex: 2, index: 0 }]);
    await findByRole("dialog");
    clickChart([]);

    expect(queryByRole("dialog")).toBeNull();
  });
});
