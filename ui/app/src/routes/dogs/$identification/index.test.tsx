import { render } from "@solidjs/testing-library";
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

vi.mock("@/services/fetch-dogs/fetchDogs", () => ({
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

const renderPage = () => {
  const Component = Route.options.component as () => JSX.Element;

  return render(() => <Component />);
};

describe("public dog detail route", () => {
  beforeEach(() => {
    dog.mockReturnValue(detail());
    isPending.mockReturnValue(false);
    isFetching.mockReturnValue(false);
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
});
