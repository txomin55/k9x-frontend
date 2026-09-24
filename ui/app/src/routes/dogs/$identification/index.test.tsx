import { fireEvent, render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { Route } from "@/routes/dogs/$identification/index";
import type { PublicDogDetail } from "@/services/fetch-dogs/fetchDogs.types";

const detail = (overrides: Partial<PublicDogDetail> = {}): PublicDogDetail => ({
  identification: "981098106001010",
  name: "Rex",
  image: "",
  breed: { id: "BORDER_COLLIE", name: "Border Collie" },
  origin: "LOE-1234",
  license: "LIC-9",
  country: { id: "ES", name: "Spain" },
  team: "Team K9X",
  handler: "Ana",
  sex: "MALE",
  withersCm: 52,
  threeFciGenerationsConfirmed: true,
  lastUpdate: 1_756_000_000_000,
  ...overrides,
});

const dog = vi.fn<() => PublicDogDetail | undefined>(() => detail());
// Loading and "there is no such dog" are different states, and the page answers each differently.
const isPending = vi.fn<() => boolean>(() => false);
const isFetching = vi.fn<() => boolean>(() => false);

const prefetchParticipations = vi.fn<(identification: string) => void>();
const prefetchIndex = vi.fn<(identification: string) => void>();
const prefetchRanking = vi.fn<(identification: string) => void>();

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
  prefetchPublicDogParticipations: (identification: string) =>
    prefetchParticipations(identification),
  prefetchPublicDogIndex: (identification: string) =>
    prefetchIndex(identification),
  prefetchPublicK9xRanking: (identification: string) =>
    prefetchRanking(identification),
  usePublicDog: () => ({
    get data() {
      return dog();
    },
    get isPending() {
      return isPending();
    },
    get isFetching() {
      return isFetching();
    },
  }),
}));

const tabParam = vi.fn<() => string>(() => "BIO");
const setTabParam = vi.fn<(value: string) => void>();

vi.mock("@/utils/search-params/useSearchParam", () => ({
  useSearchParam: () => [tabParam, setTabParam] as const,
}));

vi.mock(
  "@/components/routes/dogs/dog-participations/DogParticipations",
  () => ({
    default: (props: { identification: string }) => (
      <div class="participations-stub">{props.identification}</div>
    ),
  }),
);

vi.mock("@/components/routes/dogs/dog-k9x-index/DogK9xIndex", () => ({
  default: (props: { identification: string }) => (
    <div class="k9x-index-stub">{props.identification}</div>
  ),
}));

vi.mock("@/components/routes/dogs/dog-k9x-ranking/DogK9xRanking", () => ({
  default: (props: { identification: string; country?: { id: string } }) => (
    <div class="k9x-ranking-stub">
      {props.identification}:{props.country?.id}
    </div>
  ),
}));

vi.mock("@/components/common/page-seo/PageSeo", () => ({
  default: () => null,
}));

vi.mock("@tanstack/solid-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/solid-router")>();

  return {
    ...actual,
    createFileRoute: () => (options: unknown) => ({
      options,
      useParams: () => () => ({ identification: "981098106001010" }),
    }),
  };
});

/** Kobalte's segmented control observes its box; jsdom has no observer. */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const renderPage = () => {
  const Component = Route.options.component as () => JSX.Element;

  return render(() => <Component />);
};

describe("public dog detail route", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    dog.mockReturnValue(detail());
    isPending.mockReturnValue(false);
    isFetching.mockReturnValue(false);
    tabParam.mockReturnValue("BIO");
    setTabParam.mockClear();
    prefetchParticipations.mockClear();
    prefetchIndex.mockClear();
  });

  test("shows every public field of the dog", () => {
    const { queryByText } = renderPage();

    expect(queryByText("Rex")).toBeInTheDocument();
    expect(queryByText("981098106001010")).toBeInTheDocument();
    expect(queryByText("Border Collie")).toBeInTheDocument();
    expect(queryByText("Spain")).toBeInTheDocument();
    expect(queryByText("Ana")).toBeInTheDocument();
    expect(queryByText("Team K9X")).toBeInTheDocument();
    expect(queryByText("LOE-1234")).toBeInTheDocument();
    expect(queryByText("LIC-9")).toBeInTheDocument();
    expect(queryByText("52 cm")).toBeInTheDocument();
  });

  /** A field nobody filled in still gets its row, so every dog reads as the same shape. */
  test("shows a dash for the fields the dog has no value for", () => {
    dog.mockReturnValue(
      detail({ handler: "", team: "   ", license: "", withersCm: null }),
    );

    const { container } = renderPage();

    const values = [
      ...container.querySelectorAll(".dog-detail__fact > dd"),
    ].map((cell) => cell.textContent);
    expect(values.filter((value) => value === "—")).toHaveLength(4);
  });

  /**
   * While the dog is loading the page shows the skeleton, never the not-found message: the reader may
   * well be on a dog that does exist.
   */
  test("shows the skeleton while the dog is still loading", () => {
    dog.mockReturnValue(undefined);
    isPending.mockReturnValue(true);

    const { container } = renderPage();

    expect(container.querySelector(".atom-skeleton")).not.toBeNull();
    expect(container.querySelector(".dog-detail__name")).toBeNull();
    expect(container.querySelector(".dog-detail__empty")).toBeNull();
  });

  /** A refetch that has dropped the data must not read as "no such dog" either. */
  test("shows the skeleton while refetching without data", () => {
    dog.mockReturnValue(undefined);
    isFetching.mockReturnValue(true);

    const { container } = renderPage();

    expect(container.querySelector(".atom-skeleton")).not.toBeNull();
    expect(container.querySelector(".dog-detail__empty")).toBeNull();
  });

  /** A dog that is gone, or was never there, gets a message instead of an empty card. */
  test("shows no card when the dog is not available", () => {
    dog.mockReturnValue(undefined);

    const { container } = renderPage();

    expect(container.querySelector(".dog-detail__facts")).toBeNull();
    expect(container.querySelector(".atom-skeleton")).toBeNull();
    expect(container.querySelector(".dog-detail__empty")).not.toBeNull();
  });

  test("shows the bio, participations and k9x sections, bio first", () => {
    const { getAllByRole } = renderPage();

    const sections = getAllByRole("radio");
    expect(sections).toHaveLength(3);
    expect(sections[0]).toBeChecked();
  });

  test("opens the section named in the url", () => {
    tabParam.mockReturnValue("PARTICIPATIONS");

    const { getAllByRole, container } = renderPage();

    expect(getAllByRole("radio")[1]).toBeChecked();
    expect(container.querySelector(".dog-detail__facts")).toBeNull();
  });

  test("falls back to the bio section for an unknown one in the url", () => {
    tabParam.mockReturnValue("NOPE");

    const { getAllByRole } = renderPage();

    expect(getAllByRole("radio")[0]).toBeChecked();
  });

  test("writes the chosen section to the url", () => {
    const { getAllByRole } = renderPage();

    fireEvent.click(getAllByRole("radio")[2]);

    expect(setTabParam).toHaveBeenCalledWith("K9X");
  });

  test("starts loading the participations, the index and the ranking without waiting for the dog", () => {
    dog.mockReturnValue(undefined);
    isPending.mockReturnValue(true);

    renderPage();

    expect(prefetchParticipations).toHaveBeenCalledWith("981098106001010");
    expect(prefetchIndex).toHaveBeenCalledWith("981098106001010");
    expect(prefetchRanking).toHaveBeenCalledWith("981098106001010");
  });

  test("shows the dog's K9X index in the K9X section", () => {
    tabParam.mockReturnValue("K9X");

    const { container } = renderPage();

    expect(container.querySelector(".k9x-index-stub")).toHaveTextContent(
      "981098106001010",
    );
  });

  test("puts the dog's world ranking before its index chart, narrowable to its country", () => {
    tabParam.mockReturnValue("K9X");

    const { container } = renderPage();

    const section = container.querySelector(".dog-detail__k9x")!;
    expect(section.firstElementChild).toHaveClass("dog-detail__k9x-ranking");
    expect(section.lastElementChild).toHaveClass("dog-detail__k9x-index");
    expect(container.querySelector(".k9x-ranking-stub")).toHaveTextContent(
      "981098106001010:ES",
    );
  });

  test("shows the dog's participations in the participations section", () => {
    tabParam.mockReturnValue("PARTICIPATIONS");

    const { container } = renderPage();

    expect(container.querySelector(".participations-stub")).toHaveTextContent(
      "981098106001010",
    );
  });
});
