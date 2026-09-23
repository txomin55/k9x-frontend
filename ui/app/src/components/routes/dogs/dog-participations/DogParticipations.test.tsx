import { fireEvent, render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import DogParticipations from "@/components/routes/dogs/dog-participations/DogParticipations";
import type {
  DogParticipation,
  DogParticipationYear,
} from "@/services/fetch-dogs/fetchDogs.types";

const participation = (
  overrides: Partial<DogParticipation> = {},
): DogParticipation => ({
  event: { id: "event-1", name: "Grade 2" },
  stageId: "stage-1",
  date: Date.UTC(2025, 5, 14),
  country: { id: "ES", name: "Spain" },
  position: 4,
  totalScore: 251.456,
  obdxPoints: 80,
  restricted: false,
  ...overrides,
});

const years = vi.fn<() => DogParticipationYear[] | undefined>(() => []);

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
  usePublicDogParticipations: () => ({
    get data() {
      return years();
    },
  }),
}));

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
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

const renderParticipations = () =>
  render(() => <DogParticipations identification="DOG-1" />);

describe("dog participations", () => {
  beforeEach(() => {
    years.mockReturnValue([]);
  });

  test("says so when the dog has no participations", () => {
    const { container } = renderParticipations();

    expect(
      container.querySelector(".dog-participations__empty"),
    ).not.toBeNull();
  });

  test("shows one collapsible per year, only the first one open", () => {
    years.mockReturnValue([
      { year: 2025, participations: [participation()] },
      {
        year: 2024,
        participations: [participation({ event: { id: "e2", name: "Old" } })],
      },
    ]);

    const { getAllByRole } = renderParticipations();

    const triggers = getAllByRole("button");
    expect(triggers).toHaveLength(2);
    expect(triggers[0]).toHaveTextContent("2025");
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[1]).toHaveTextContent("2024");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
  });

  test("alternates the years between two independent columns, keeping the chronological order", () => {
    years.mockReturnValue(
      [2026, 2025, 2024, 2022].map((year) => ({
        year,
        participations: [participation()],
      })),
    );

    const { container } = renderParticipations();

    const columns = container.querySelectorAll(".dog-participations__column");
    expect(columns).toHaveLength(2);
    const yearsIn = (column: Element) =>
      Array.from(column.querySelectorAll(".dog-participations__year-box")).map(
        (box) => [
          box.querySelector(".dog-participations__year span")?.textContent,
          (box as HTMLElement).style.order,
        ],
      );
    expect(yearsIn(columns[0])).toEqual([
      ["2026", "0"],
      ["2024", "2"],
    ]);
    expect(yearsIn(columns[1])).toEqual([
      ["2025", "1"],
      ["2022", "3"],
    ]);
  });

  test("opens another year on click", () => {
    years.mockReturnValue([
      { year: 2025, participations: [participation()] },
      { year: 2024, participations: [participation()] },
    ]);

    const { getAllByRole } = renderParticipations();
    fireEvent.click(getAllByRole("button")[1]);

    expect(getAllByRole("button")[1]).toHaveAttribute("aria-expanded", "true");
  });

  test("links each event to its classification with the dog pinned", () => {
    years.mockReturnValue([{ year: 2025, participations: [participation()] }]);

    const { getByRole } = renderParticipations();

    expect(getByRole("link")).toHaveAttribute(
      "href",
      "/stages/stage-1/events/event-1/classification?pinned=DOG-1",
    );
  });

  test("shows the position, the rounded score and the OBDX points", () => {
    years.mockReturnValue([{ year: 2025, participations: [participation()] }]);

    const { getByRole } = renderParticipations();

    const row = getByRole("link");
    expect(row).toHaveTextContent("Grade 2");
    expect(row).toHaveTextContent("4º");
    expect(row).toHaveTextContent("251.46");
    expect(row).toHaveTextContent("80");
    expect(row.querySelector(".dog-participations__obdx img")).toHaveAttribute(
      "alt",
      "DOGS.DETAIL.PARTICIPATIONS_OBDX_POINTS",
    );
  });

  test("says the results are pending before the snapshot has run", () => {
    years.mockReturnValue([
      {
        year: 2025,
        participations: [
          participation({ position: null, totalScore: null, obdxPoints: null }),
        ],
      },
    ]);

    const { getByRole } = renderParticipations();

    expect(getByRole("link")).toHaveTextContent(
      "DOGS.DETAIL.PARTICIPATIONS_PENDING",
    );
  });

  test("withholds the scores of a restricted competition", () => {
    years.mockReturnValue([
      {
        year: 2025,
        participations: [
          participation({
            restricted: true,
            totalScore: null,
            obdxPoints: null,
          }),
        ],
      },
    ]);

    const { getByRole } = renderParticipations();

    expect(getByRole("link")).toHaveTextContent(
      "DOGS.DETAIL.PARTICIPATIONS_RESTRICTED",
    );
    expect(getByRole("link")).toHaveTextContent("4º");
  });
});
