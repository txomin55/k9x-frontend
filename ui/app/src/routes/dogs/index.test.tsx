import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { Route } from "@/routes/dogs/index";
import type { PublicDog } from "@/services/fetch-dogs/fetchDogs.types";

const dog = (overrides: Partial<PublicDog> = {}): PublicDog => ({
  identification: "981098106001010",
  name: "Rex",
  handler: "Ana",
  country: { id: "ES", name: "Spain" },
  sex: "MALE",
  breed: { id: "BORDER_COLLIE", name: "Border Collie" },
  rank: "742",
  ...overrides,
});

const dogs = vi.fn<() => PublicDog[] | undefined>(() => []);
const isFetching = vi.fn<() => boolean>(() => false);

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
  usePublicDogs: () => ({
    get data() {
      return dogs();
    },
    get isPending() {
      return dogs() === undefined;
    },
    get isFetching() {
      return isFetching();
    },
  }),
  loadMorePublicDogs: vi.fn(),
  publicDogsPages: {
    hasMore: () => false,
    state: () => ({
      loadedPages: 1,
      totalPages: 1,
      total: 1,
      isLoadingMore: false,
    }),
  },
}));

vi.mock("@/components/common/page-seo/PageSeo", () => ({
  default: () => null,
}));

const navigate = vi.fn();

vi.mock("@tanstack/solid-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/solid-router")>();

  return {
    ...actual,
    useNavigate: () => navigate,
    Link: (props: { class?: string; children?: unknown }) => (
      <a class={props.class}>{props.children as never}</a>
    ),
  };
});

/** Kobalte's segmented control and the virtual grid both observe their box; jsdom has no observer. */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const renderPage = () => {
  const Component = Route.options.component as () => JSX.Element;

  return render(() => <Component />);
};

describe("public dogs route", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    dogs.mockReturnValue([]);
    isFetching.mockReturnValue(false);
    navigate.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("offers no view selector while the directory comes back empty", () => {
    const { container } = renderPage();

    expect(container.querySelector(".atom-segmented-control")).toBeNull();
    expect(container.querySelector(".virtual-card-grid")).toBeNull();
  });

  /**
   * The very first load has no earlier results to keep showing, so it must not read for a moment as
   * "nothing matches" — the filters stay usable underneath the skeleton.
   */
  test("shows the skeleton, not an empty result, on the first load", () => {
    dogs.mockReturnValue(undefined);

    const { container } = renderPage();

    expect(container.querySelector(".card")).not.toBeNull();
    expect(container.querySelector(".atom-skeleton")).not.toBeNull();
    expect(container.querySelectorAll(".name-filter")).toHaveLength(2);
  });

  /**
   * The data proxy cannot tell "loading" from "really empty", so a refetch that has no dogs yet must not
   * flash the empty label over a directory that does have dogs.
   */
  test("shows the skeleton, not the empty label, while refetching without dogs", () => {
    dogs.mockReturnValue([]);
    isFetching.mockReturnValue(true);

    const { container } = renderPage();

    expect(container.querySelector(".atom-skeleton")).not.toBeNull();
    expect(container.querySelector(".public-dogs__empty")).toBeNull();
  });

  /** With dogs on screen a background refetch keeps them: no skeleton on top of a painted list. */
  test("keeps the dogs on screen while refetching in the background", () => {
    dogs.mockReturnValue([dog()]);
    isFetching.mockReturnValue(true);

    const { container, queryByText } = renderPage();

    expect(queryByText("Rex")).toBeInTheDocument();
    expect(container.querySelector(".atom-skeleton")).toBeNull();
  });

  test("offers both the card list and the table once there are dogs", () => {
    dogs.mockReturnValue([dog()]);

    const { container } = renderPage();

    expect(container.querySelector(".atom-segmented-control")).not.toBeNull();
    expect(
      [
        ...container.querySelectorAll<HTMLInputElement>(
          ".atom-segmented-control__item-input",
        ),
      ].map((input) => input.value),
    ).toEqual(["LIST", "TABLE"]);
  });

  /** The filters outlive an empty result, or a filter that matches nothing could not be undone. */
  test("keeps the three filters on screen while the directory is empty", () => {
    const { container } = renderPage();

    expect(container.querySelectorAll(".name-filter")).toHaveLength(2);
    expect(container.querySelectorAll(".country-filter")).toHaveLength(1);
  });

  test("shows the dog and its index in the card list", () => {
    dogs.mockReturnValue([dog()]);

    const { queryByText } = renderPage();

    expect(queryByText("Rex")).toBeInTheDocument();
    expect(queryByText("Border Collie")).toBeInTheDocument();
    expect(queryByText("Ana")).toBeInTheDocument();
    expect(queryByText("742")).toBeInTheDocument();
  });

  /** A dog with no index is not a dog with a bad one, so no number is printed for it. */
  test("shows a dash instead of a score for a dog with no index yet", () => {
    dogs.mockReturnValue([
      dog({ rank: "NO_K9X_INDEX_GENERATED", name: "Nala" }),
    ]);

    const { container, queryByText } = renderPage();

    expect(queryByText("Nala")).toBeInTheDocument();
    expect(queryByText("NO_K9X_INDEX_GENERATED")).not.toBeInTheDocument();
    expect(container.querySelector(".k9x-score--empty")?.textContent).toContain(
      "—",
    );
  });

  /**
   * The order is always the server's — K9X index descending — so no header may offer to re-sort the
   * pages pulled so far, and the rows must reach the table in the order they arrived in.
   */
  test("offers no sorting and keeps the order the dogs arrived in", async () => {
    dogs.mockReturnValue([
      dog({ identification: "1", name: "Top", rank: "980" }),
      dog({ identification: "2", name: "Amber", rank: "512" }),
      dog({ identification: "3", name: "Zoe", rank: "NO_K9X_INDEX_GENERATED" }),
    ]);

    const { container, findByRole } = renderPage();

    const table = await findByRole("radio", { checked: false });
    table.click();

    const names = [
      ...container.querySelectorAll(".list-table__name > a"),
    ].map((cell) => cell.textContent);
    expect(names).toEqual(["Top", "Amber", "Zoe"]);
    const headerButtons = [
      ...container.querySelectorAll<HTMLButtonElement>("th button"),
    ];
    expect(headerButtons.length).toBeGreaterThan(0);
    expect(headerButtons.every((button) => button.disabled)).toBe(true);
    expect(container.querySelector("th .is-sortable")).toBeNull();
  });

  test("opens the dog detail from the card action", () => {
    dogs.mockReturnValue([dog()]);

    const { container } = renderPage();

    const action = container.querySelector<HTMLButtonElement>(
      ".public-dog-card__actions .atom-button",
    );
    expect(action).not.toBeNull();
    expect(action?.classList).toContain("primary");

    action?.click();

    expect(navigate).toHaveBeenCalledWith({
      to: "/dogs/$identification",
      params: { identification: "981098106001010" },
    });
  });

  /** The list starts on the cards, so the table is only built once it is asked for. */
  test("starts on the card list", () => {
    dogs.mockReturnValue([dog()]);

    const { container } = renderPage();

    expect(container.querySelector(".virtual-card-grid")).not.toBeNull();
    expect(container.querySelector(".public-dogs__table")).toBeNull();
  });
});
