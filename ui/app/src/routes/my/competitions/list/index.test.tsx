import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { Route } from "@/routes/my/competitions/list/index";

vi.mock("@tanstack/solid-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/solid-router")>();

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock(
  "@/components/routes/my/competitions/list/competition-card/CompetitionCard",
  () => ({
    default: () => <div>competition-card</div>,
  }),
);

vi.mock(
  "@/components/common/floating-toggle-circle/FloatingToggleCircle",
  () => ({
    default: () => <button type="button">toggle</button>,
  }),
);

vi.mock("@/services/secured/competition-crud/competitionCrud", () => ({
  useCompetitions: () => ({
    data: [],
  }),
}));

describe("my competition route", () => {
  test("renders login text", () => {
    const Component = Route.options.component as () => JSX.Element;
    const { queryByText } = render(() => <Component />);

    expect(queryByText("ESTAS LOGUEADO")).not.toBeInTheDocument();
  });
});
