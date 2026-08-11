import { render } from "@solidjs/testing-library";
import RankingResults from "@/components/routes/my/competitions/$id/rankings-section/RankingResults";
import type { RankingClassificationResponseDTO } from "@/services/fetch-rankings/fetchRankings.types";

const mocks = vi.hoisted(() => ({
  results: null as RankingClassificationResponseDTO | null,
  isPending: false,
  navigate: vi.fn(),
}));

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@tanstack/solid-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("@/services/fetch-rankings/fetchRankings", () => ({
  useRankingClassification: () => ({
    get data() {
      return mocks.results;
    },
    get isPending() {
      return mocks.isPending;
    },
  }),
}));

const results: RankingClassificationResponseDTO = {
  events: [
    { id: "event-1", name: "Event 1", stageId: "stage-1" },
    { id: "event-2", name: "Event 2", stageId: "stage-2" },
  ],
  groups: [
    {
      id: "alpha",
      name: "Team Alpha",
      position: 1,
      tied: false,
      total: 150,
      members: [
        {
          id: "rex",
          name: "Rex",
          cells: [
            { eventId: "event-1", score: 100, counts: true },
            // Scored but left out by the inclusion criterion.
            { eventId: "event-2", score: 10, counts: false },
          ],
        },
        {
          id: "nala",
          name: "Nala",
          cells: [
            { eventId: "event-1", score: 50, counts: true },
            // Did not compete.
            { eventId: "event-2", score: null, counts: false },
          ],
        },
      ],
    },
    {
      id: "beta",
      name: "Team Beta",
      position: 2,
      tied: true,
      total: 80,
      members: [
        {
          id: "luna",
          name: "Luna",
          cells: [
            { eventId: "event-1", score: 80, counts: true },
            { eventId: "event-2", score: null, counts: false },
          ],
        },
      ],
    },
  ],
};

const renderResults = () =>
  render(() => <RankingResults rankingId="ranking_competition_1" />);

/**
 * The matrix only exists once a group is expanded: Kobalte keeps the collapsible content out of the DOM
 * while it is closed.
 */
const expandGroup = (container: HTMLElement, index = 0) => {
  container
    .querySelectorAll<HTMLButtonElement>(".atom-collapsible__trigger")
    [index].click();
};

const cellsOf = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLButtonElement>(".ranking-results__cell"),
];

describe("RankingResults", () => {
  beforeEach(() => {
    mocks.results = results;
    mocks.isPending = false;
    mocks.navigate.mockClear();
  });

  test("renders one collapsible per group with its position, criterion and total", () => {
    const { container, getByText } = renderResults();

    expect(container.querySelectorAll(".ranking-results__group")).toHaveLength(
      2,
    );
    expect(getByText("Team Alpha")).toBeInTheDocument();
    expect(getByText("Team Beta")).toBeInTheDocument();
    expect(
      container.querySelectorAll(".ranking-results__total")[0],
    ).toHaveTextContent("150");
  });

  test("marks a tied group", () => {
    const { container } = renderResults();

    expect(container.querySelectorAll(".ranking-results__tied")).toHaveLength(
      1,
    );
  });

  test("keeps the matrix out of the DOM until the group is expanded", () => {
    const { container } = renderResults();

    expect(
      container.querySelector(".ranking-results__matrix"),
    ).not.toBeInTheDocument();

    expandGroup(container);

    expect(
      container.querySelector(".ranking-results__matrix"),
    ).toBeInTheDocument();
  });

  test("renders one matrix row per member and one column per event", () => {
    const { container } = renderResults();
    expandGroup(container);

    const firstMatrix = container.querySelectorAll(
      ".ranking-results__matrix",
    )[0];
    expect(firstMatrix.querySelectorAll("thead th")).toHaveLength(3);
    expect(firstMatrix.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  test("marks a score that counts as counted and leaves it clickable", () => {
    const { container } = renderResults();
    expandGroup(container);

    const counted = cellsOf(container).find(
      (cell) => cell.textContent === "100",
    );

    expect(counted).toHaveClass("is-counted");
    expect(counted).not.toBeDisabled();
  });

  test("disables the cell of an event the competitor did not enter", () => {
    const { container } = renderResults();
    expandGroup(container);

    const absent = cellsOf(container).find((cell) => cell.textContent === "—");

    expect(absent).toBeDisabled();
    // Grey, not red: there is no result to call bad.
    expect(absent).toHaveClass("is-empty");
    expect(absent).not.toHaveClass("is-excluded");
  });

  test("shows a score left out by the criterion as excluded but still clickable", () => {
    const { container } = renderResults();
    expandGroup(container);

    const excluded = cellsOf(container).find(
      (cell) => cell.textContent === "10",
    );

    expect(excluded).toHaveClass("is-excluded");
    expect(excluded).not.toBeDisabled();
  });

  test("navigates from a score that does not count", () => {
    const { container } = renderResults();
    expandGroup(container);

    cellsOf(container)
      .find((cell) => cell.textContent === "10")!
      .click();

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/stages/$id/events/$eventId/classification",
      params: { id: "stage-2", eventId: "event-2" },
      search: { competitors: "rex" },
    });
  });

  test("clicking a score opens that event's classification filtered by the competitor", () => {
    const { container } = renderResults();
    expandGroup(container);

    cellsOf(container)
      .find((cell) => cell.textContent === "100")!
      .click();

    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/stages/$id/events/$eventId/classification",
      params: { id: "stage-1", eventId: "event-1" },
      search: { competitors: "rex" },
    });
  });

  test("does not navigate when the cell has no score", () => {
    const { container } = renderResults();
    expandGroup(container);

    cellsOf(container)
      .find((cell) => cell.textContent === "—")!
      .click();

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test("shows the empty message when the ranking has no results", () => {
    mocks.results = { events: [], groups: [] };

    const { getByText } = renderResults();

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.NO_RESULTS"),
    ).toBeInTheDocument();
  });

  test("shows skeletons while the request is in flight", () => {
    mocks.results = null;
    mocks.isPending = true;

    const { container } = renderResults();

    expect(
      container.querySelector(".ranking-results__group-skeleton"),
    ).toBeInTheDocument();
  });
});
